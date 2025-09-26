import logger from "../../config/logger";
import { ProjectModel } from "../../models/project.model";
import { LLMProvider, PromptService } from "../prompt.service";

import {
  BrandIdentityModel,
  ColorModel,
  TypographyModel,
} from "../../models/brand-identity.model";
import { LOGO_GENERATION_PROMPT } from "./prompts/singleGenerations/00_logo-generation-section.prompt";
import { LOGO_VARIATION_LIGHT_PROMPT } from "./prompts/singleGenerations/logo-variation-light.prompt";
import { LOGO_VARIATION_DARK_PROMPT } from "./prompts/singleGenerations/logo-variation-dark.prompt";
import { LOGO_VARIATION_MONOCHROME_PROMPT } from "./prompts/singleGenerations/logo-variation-monochrome.prompt";

import { BRAND_HEADER_SECTION_PROMPT } from "./prompts/00_brand-header-section.prompt";
import { LOGO_SYSTEM_SECTION_PROMPT } from "./prompts/01_logo-system-section.prompt";
import { COLOR_PALETTE_SECTION_PROMPT } from "./prompts/02_color-palette-section.prompt";
import { TYPOGRAPHY_SECTION_PROMPT } from "./prompts/03_typography-section.prompt";
import { BRAND_FOOTER_SECTION_PROMPT } from "./prompts/07_brand-footer-section.prompt";
import { SectionModel } from "../../models/section.model";
import { BrandIdentityBuilder } from "../../models/builders/brandIdentity.builder";
import {
  GenericService,
  IPromptStep,
  ISectionResult,
} from "../common/generic.service";
import { LogoModel } from "../../models/logo.model";
import { COLORS_GENERATION_PROMPT } from "./prompts/singleGenerations/colors-generation.prompt";
import { TYPOGRAPHY_GENERATION_PROMPT } from "./prompts/singleGenerations/typography-generation.prompt";
import { PdfService } from "../pdf.service";
import { cacheService } from "../cache.service";
import crypto from "crypto";
import { projectService } from "../project.service";
import { LogoJsonToSvgService } from "./logoJsonToSvg.service";
import { SvgOptimizerService } from "./svgOptimizer.service";

export class BrandingService extends GenericService {
  private pdfService: PdfService;
  private logoJsonToSvgService: LogoJsonToSvgService;

  // Configuration LLM pour la génération de logos et variations
  private static readonly LOGO_LLM_CONFIG = {
    provider: LLMProvider.GEMINI,
    modelName: "gemini-2.0-flash",
    llmOptions: {
      maxOutputTokens: 2000,
      temperature: 0.15,
      topP: 0.85,
      topK: 50,
    },
  };

  // Configuration LLM pour la génération de couleurs
  private static readonly COLORS_LLM_CONFIG = {
    provider: LLMProvider.GEMINI,
    modelName: "gemini-2.0-flash",
    llmOptions: {
      maxOutputTokens: 3500,
      temperature: 0.1,
      topP: 0.9,
      topK: 50,
    },
  };

  // Configuration LLM pour la génération de typographies
  private static readonly TYPOGRAPHY_LLM_CONFIG = {
    provider: LLMProvider.GEMINI,
    modelName: "gemini-2.0-flash",
    llmOptions: {
      maxOutputTokens: 5000,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    },
  };

  constructor(promptService: PromptService) {
    super(promptService);
    this.pdfService = new PdfService();
    this.logoJsonToSvgService = new LogoJsonToSvgService();
    logger.info("BrandingService initialized with optimized logo generation");
  }

  /**
   * Récupération optimisée du projet avec cache intelligent
   */
  private async getProjectOptimized(
    userId: string,
    projectId: string
  ): Promise<ProjectModel | null> {
    const projectCacheKey = `project_${userId}_${projectId}`;

    // Tentative de récupération depuis le cache
    let project = await cacheService.get<ProjectModel>(projectCacheKey, {
      prefix: "project",
    });

    if (project) {
      logger.info(`Project cache hit - ProjectId: ${projectId}`);
      return project;
    }

    // Fallback vers la base de données
    logger.info(
      `Project cache miss, fetching from database - ProjectId: ${projectId}`
    );
    project = await this.projectRepository.findById(
      projectId,
      `users/${userId}/projects`
    );

    if (project) {
      // Cache asynchrone (non-bloquant)
      cacheService
        .set(projectCacheKey, project, {
          prefix: "project",
          ttl: 3600,
        })
        .catch((error) => logger.error(`Error caching project:`, error));
    }

    return project;
  }

  /**
   * Construction du prompt optimisé pour la génération de logos
   */
  private buildOptimizedLogoPrompt(
    projectDescription: string,
    colors: ColorModel,
    typography: TypographyModel
  ): string {
    // Prompt condensé avec informations essentielles uniquement
    const colorInfo = `Primary: ${
      colors.colors?.primary || "N/A"
    }, Secondary: ${colors.colors?.secondary || "N/A"}`;
    const fontInfo = `Primary: ${typography.primaryFont || "N/A"}, Secondary: ${
      typography.secondaryFont || "N/A"
    }`;

    return `${projectDescription}\n\nColors: ${colorInfo}\nTypography: ${fontInfo}\n\n${LOGO_GENERATION_PROMPT}`;
  }

  async generateBrandingWithStreaming(
    userId: string,
    projectId: string,
    streamCallback?: (sectionResult: ISectionResult) => Promise<void>
  ): Promise<ProjectModel | null> {
    logger.info(
      `Generating branding with streaming for userId: ${userId}, projectId: ${projectId}`
    );

    // Get project
    const project = await this.getProject(projectId, userId);
    if (!project) {
      return null;
    }

    // Generate cache key based on project content
    const projectDescription =
      this.extractProjectDescription(project) +
      "\n\nHere is the project branding colors: " +
      JSON.stringify(project.analysisResultModel.branding.colors) +
      "\n\nHere is the project branding typography: " +
      JSON.stringify(project.analysisResultModel.branding.typography) +
      "\n\nHere is the project branding logo: " +
      JSON.stringify(project.analysisResultModel.branding.logo);

    const contentHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          name: project.name,
          description: project.description,
          branding: project.analysisResultModel?.branding,
          projectDescription,
        })
      )
      .digest("hex")
      .substring(0, 16);

    const cacheKey = cacheService.generateAIKey(
      "branding",
      userId,
      projectId,
      contentHash
    );

    // Check cache first
    const cachedResult = await cacheService.get<ProjectModel>(cacheKey, {
      prefix: "ai",
      ttl: 7200, // 2 hours
    });

    if (cachedResult) {
      logger.info(`Branding cache hit for projectId: ${projectId}`);
      return cachedResult;
    }

    logger.info(
      `Branding cache miss, generating new content for projectId: ${projectId}`
    );

    try {
      // Define branding steps
      const steps: IPromptStep[] = [
        {
          promptConstant: BRAND_HEADER_SECTION_PROMPT + projectDescription,
          stepName: "Brand Header",
          hasDependencies: false,
        },
        {
          promptConstant: LOGO_SYSTEM_SECTION_PROMPT + projectDescription,
          stepName: "Logo System",
          hasDependencies: false,
        },
        {
          promptConstant: COLOR_PALETTE_SECTION_PROMPT + projectDescription,
          stepName: "Color Palette",
          hasDependencies: false,
        },
        {
          promptConstant: TYPOGRAPHY_SECTION_PROMPT + projectDescription,
          stepName: "Typography",
          hasDependencies: false,
        },
        // {
        //   promptConstant: USAGE_GUIDELINES_SECTION_PROMPT + projectDescription,
        //   stepName: "Usage Guidelines",
        //   hasDependencies: false,
        // },
        // {
        //   promptConstant: VISUAL_EXAMPLES_SECTION_PROMPT + projectDescription,
        //   stepName: "Visual Examples",
        //   hasDependencies: false,
        // },
        {
          promptConstant: BRAND_FOOTER_SECTION_PROMPT + projectDescription,
          stepName: "Brand Footer",
          hasDependencies: false,
        },
      ];

      // Initialize empty sections array to collect results as they come in
      let sections: SectionModel[] = [];

      // Process steps one by one with streaming if callback provided
      if (streamCallback) {
        await this.processStepsWithStreaming(
          steps,
          project,
          async (result: ISectionResult) => {
            logger.info(`Received streamed result for step: ${result.name}`);

            // Skip progress and completion events - handle only actual step results
            if (
              result.data === "steps_in_progress" ||
              result.data === "all_steps_completed"
            ) {
              await streamCallback(result);
              return;
            }

            // Convert result to section model
            const section: SectionModel = {
              name: result.name,
              type: result.type,
              data: result.data,
              summary: result.summary,
            };

            // Add to sections array
            sections.push(section);

            // Update project immediately after each step
            logger.info(
              `Updating project after step: ${result.name} - projectId: ${projectId}`
            );

            // Get the current project
            const currentProject = await this.projectRepository.findById(
              projectId,
              `users/${userId}/projects`
            );
            if (!currentProject) {
              logger.warn(
                `Project not found with ID: ${projectId} for user: ${userId} during step update.`
              );
              throw new Error(`Project not found: ${projectId}`);
            }

            // Create the updated project with current sections
            const updatedProjectData = {
              ...currentProject,
              analysisResultModel: {
                ...currentProject.analysisResultModel,
                branding: {
                  sections: sections,
                  colors: currentProject.analysisResultModel.branding.colors,
                  typography:
                    currentProject.analysisResultModel.branding.typography,
                  logo: currentProject.analysisResultModel.branding.logo,
                  generatedLogos:
                    currentProject.analysisResultModel.branding
                      .generatedLogos || [],
                  generatedColors:
                    currentProject.analysisResultModel.branding
                      .generatedColors || [],
                  generatedTypography:
                    currentProject.analysisResultModel.branding
                      .generatedTypography || [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              },
            };

            // Update the project in the database
            const updatedProject = await this.projectRepository.update(
              projectId,
              updatedProjectData,
              `users/${userId}/projects`
            );

            if (updatedProject) {
              logger.info(
                `Successfully updated project with step: ${result.name} - projectId: ${projectId}`
              );

              // Update cache with latest project state
              await cacheService.set(cacheKey, updatedProject, {
                prefix: "ai",
                ttl: 7200, // 2 hours
              });
              logger.info(
                `Branding cached after step: ${result.name} - projectId: ${projectId}`
              );

              // Only send to frontend after successful database update
              await streamCallback(result);
            } else {
              logger.error(
                `Failed to update project after step: ${result.name} - projectId: ${projectId}`
              );
              throw new Error(
                `Failed to update project after step: ${result.name}`
              );
            }
          },
          undefined, // promptConfig
          "branding", // promptType
          userId
        );

        // Return the updated project (it should be available in cache or fetch it again)
        const finalProject = await this.projectRepository.findById(
          projectId,
          `users/${userId}/projects`
        );
        return finalProject;
      } else {
        // Fallback to non-streaming processing
        const stepResults = await this.processSteps(steps, project);
        sections = stepResults.map((result) => ({
          name: result.name,
          type: result.type,
          data: result.data,
          summary: result.summary,
        }));

        // Get the existing project to prepare for update
        const oldProject = await this.projectRepository.findById(
          projectId,
          `users/${userId}/projects`
        );
        if (!oldProject) {
          logger.warn(
            `Original project not found with ID: ${projectId} for user: ${userId} before updating with branding.`
          );
          return null;
        }

        // Create the new project with updated branding
        const newProject = {
          ...oldProject,
          analysisResultModel: {
            ...oldProject.analysisResultModel,
            branding: {
              sections: sections,
              colors: oldProject.analysisResultModel.branding.colors,
              typography: oldProject.analysisResultModel.branding.typography,
              logo: oldProject.analysisResultModel.branding.logo,
              generatedLogos:
                oldProject.analysisResultModel.branding.generatedLogos || [],
              generatedColors:
                oldProject.analysisResultModel.branding.generatedColors || [],
              generatedTypography:
                oldProject.analysisResultModel.branding.generatedTypography ||
                [],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        };

        // Update the project in the database
        const updatedProject = await this.projectRepository.update(
          projectId,
          newProject,
          `users/${userId}/projects`
        );

        if (updatedProject) {
          logger.info(
            `Successfully updated project with ID: ${projectId} with branding`
          );

          // Cache the result for future requests
          await cacheService.set(cacheKey, updatedProject, {
            prefix: "ai",
            ttl: 7200, // 2 hours
          });
          logger.info(`Branding cached for projectId: ${projectId}`);
        }
        return updatedProject;
      }
    } catch (error) {
      logger.error(
        `Error generating branding for projectId ${projectId}:`,
        error
      );
      throw error;
    } finally {
      logger.info(`Completed branding generation for projectId ${projectId}`);
    }
  }

  /**
   * Génère un seul ensemble de couleurs - Méthode privée pour génération parallèle
   */
  private async generateSingleColors(
    projectDescription: string,
    project: ProjectModel
  ): Promise<ColorModel[]> {
    logger.info(`Generating colors`);

    const steps: IPromptStep[] = [
      {
        promptConstant: projectDescription + COLORS_GENERATION_PROMPT,
        stepName: "Colors Generation",
        modelParser: (content) => {
          try {
            const parsedColors = JSON.parse(content);
            return parsedColors.colors;
          } catch (error) {
            logger.error(`Error parsing colors:`, error);
            throw new Error(`Failed to parse colors`);
          }
        },
        hasDependencies: false,
      },
    ];

    const sectionResults = await this.processSteps(
      steps,
      project,
      BrandingService.COLORS_LLM_CONFIG
    );
    const colorsResult: ISectionResult = sectionResults[0];

    logger.info(`Colors generated successfully`);
    return colorsResult.parsedData as ColorModel[];
  }

  /**
   * Génère un seul ensemble de typographies - Méthode privée pour génération parallèle
   */
  private async generateSingleTypography(
    projectDescription: string,
    project: ProjectModel
  ): Promise<TypographyModel[]> {
    logger.info(`Generating typography`);

    const steps: IPromptStep[] = [
      {
        promptConstant: projectDescription + TYPOGRAPHY_GENERATION_PROMPT,
        stepName: "Typography Generation",
        modelParser: (content) => {
          try {
            const parsedTypography = JSON.parse(content);
            return parsedTypography.typography;
          } catch (error) {
            logger.error(`Error parsing typography:`, error);
            throw new Error(`Failed to parse typography`);
          }
        },
        hasDependencies: false,
      },
    ];

    const sectionResults = await this.processSteps(
      steps,
      project,
      BrandingService.TYPOGRAPHY_LLM_CONFIG
    );
    const typographyResult = sectionResults[0];

    logger.info(`Typography generated successfully`);
    return typographyResult.parsedData as TypographyModel[];
  }

  async generateColorsAndTypography(
    userId: string,
    project: ProjectModel
  ): Promise<{
    colors: ColorModel[];
    typography: TypographyModel[];
    project: ProjectModel;
  }> {
    logger.info(
      `Generating colors and typography in parallel for userId: ${userId}`
    );

    // Créer le projet
    project = {
      ...project,
      analysisResultModel: {
        ...project.analysisResultModel,
        branding: BrandIdentityBuilder.createEmpty(),
      },
    };
    const createdProject = await projectService.createUserProject(
      userId,
      project
    );

    if (!createdProject.id) {
      throw new Error(`Failed to create project`);
    }

    // Stocker le projet en cache
    try {
      const projectCacheKey = `project_${userId}_${createdProject.id}`;
      await cacheService.set(projectCacheKey, createdProject, {
        prefix: "project",
        ttl: 3600, // 1 heure
      });
      logger.info(
        `Project cached with ID: ${createdProject.id} for userId: ${userId}`
      );
    } catch (error) {
      logger.error(`Error caching project for userId: ${userId}`, error);
      // Continue without failing - cache is not critical
    }

    const projectDescription = this.extractProjectDescription(project);

    // Génération parallèle des couleurs et typographies
    const startTime = Date.now();

    // Créer 2 promesses pour générer couleurs et typographies en parallèle
    const [colors, typography] = await Promise.all([
      this.generateSingleColors(projectDescription, createdProject),
      this.generateSingleTypography(projectDescription, createdProject),
    ]);

    const generationTime = Date.now() - startTime;
    logger.info(
      `Parallel colors and typography generation completed in ${generationTime}ms`
    );

    // Mettre à jour le projet avec les couleurs et typographies générées
    const updatedProjectData = {
      ...createdProject,
      analysisResultModel: {
        ...createdProject.analysisResultModel,
        branding: {
          ...createdProject.analysisResultModel.branding,
          generatedColors: colors,
          generatedTypography: typography,
          updatedAt: new Date(),
        },
      },
    };

    // Mise à jour en base de données
    const updatedProject = await this.projectRepository.update(
      createdProject.id!,
      updatedProjectData,
      `users/${userId}/projects`
    );

    if (updatedProject) {
      logger.info(
        `Successfully updated project with colors and typography - ProjectId: ${createdProject.id}`
      );

      // Mise à jour du cache projet
      const projectCacheKey = `project_${userId}_${createdProject.id}`;
      await cacheService.set(projectCacheKey, updatedProject, {
        prefix: "project",
        ttl: 3600,
      });

      logger.info(
        `Project cache updated with colors and typography - ProjectId: ${createdProject.id}`
      );
    }

    return {
      colors,
      typography,
      project: updatedProject || createdProject,
    };
  }

  /**
   * Generate single logo concept using direct SVG generation
   * AI generates complete SVG content directly for professional results
   */
  private async generateSingleLogoConcept(
    projectDescription: string,
    colors: ColorModel,
    typography: TypographyModel,
    project: ProjectModel,
    conceptIndex: number
  ): Promise<LogoModel> {
    logger.info(
      `Generating professional logo concept ${
        conceptIndex + 1
      } with direct SVG generation`
    );

    // Build optimized prompt for direct SVG generation
    const optimizedPrompt = this.buildOptimizedLogoPrompt(
      projectDescription,
      colors,
      typography
    );

    // AI generation with direct SVG output
    const steps: IPromptStep[] = [
      {
        promptConstant: optimizedPrompt,
        stepName: `Logo Concept ${conceptIndex + 1}`,
        maxOutputTokens: 3500,
        modelParser: (content) => {
          try {
            // Parse JSON response containing SVG
            const logoData = JSON.parse(content);

            // Ensure unique ID for each concept
            if (!logoData.id) {
              logoData.id = `concept${String(conceptIndex + 1).padStart(
                2,
                "0"
              )}`;
            }

            return logoData;
          } catch (error) {
            logger.error(
              `Error parsing logo data concept ${conceptIndex + 1}:`,
              error
            );
            throw new Error(
              `Failed to parse logo data concept ${conceptIndex + 1}`
            );
          }
        },
        hasDependencies: false,
      },
    ];

    const sectionResults = await this.processSteps(
      steps,
      project,
      BrandingService.LOGO_LLM_CONFIG
    );
    const logoResult = sectionResults[0];
    const logoData = logoResult.parsedData;

    // Create LogoModel directly from SVG data
    const logoModel: LogoModel = {
      id: `concept${String(conceptIndex + 1).padStart(2, "0")}`,
      name: logoData.name || `Logo Concept ${conceptIndex + 1}`,
      concept: logoData.concept || "Professional logo design",
      colors: logoData.colors || [],
      fonts: logoData.fonts || [],
      svg: logoData.svg, // Direct SVG from AI
      iconSvg: this.extractIconFromSvg(logoData.svg), // Extract icon part
    };

    // Apply SVG optimization
    const optimizedLogo = this.optimizeLogoSvgs(logoModel);

    logger.info(
      `Professional logo concept ${
        conceptIndex + 1
      } generated with direct SVG content`
    );
    return optimizedLogo;
  }

  /**
   * Extract icon-only SVG from the complete logo SVG
   * Removes text elements to create an icon-only version
   */
  private extractIconFromSvg(fullSvg: string): string {
    try {
      // Extract the icon group from the full SVG (using multiline regex)
      const iconMatch = fullSvg.match(/<g id="icon"[^>]*>([\s\S]*?)<\/g>/);
      if (iconMatch) {
        // Create a new SVG with just the icon content
        const iconContent = iconMatch[1];
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><g id="icon">${iconContent}</g></svg>`;
      }

      // Fallback: return a simplified version of the full SVG
      logger.warn("Could not extract icon from SVG, using fallback");
      return fullSvg.replace(/<g id="text"[^>]*>[\s\S]*?<\/g>/, "");
    } catch (error) {
      logger.error("Error extracting icon from SVG:", error);
      return fullSvg; // Return original if extraction fails
    }
  }

  /**
   * Optimize logo SVGs using advanced compression techniques
   */
  private optimizeLogoSvgs(logoModel: LogoModel): LogoModel {
    logger.info(`Optimizing SVGs for logo: ${logoModel.id}`);

    const optimized = { ...logoModel };

    // Optimize main SVG
    if (optimized.svg) {
      optimized.svg = SvgOptimizerService.optimizeSvg(optimized.svg);
    }

    // Optimize icon SVG
    if (optimized.iconSvg) {
      optimized.iconSvg = SvgOptimizerService.optimizeSvg(optimized.iconSvg);
    }

    // Optimize variations if present
    if (optimized.variations) {
      optimized.variations = this.optimizeLogoVariations(optimized.variations);
    }

    return optimized;
  }

  /**
   * Optimize logo variations SVGs
   */
  private optimizeLogoVariations(variations: any): any {
    const optimized = { ...variations };

    if (variations.withText) {
      optimized.withText = this.optimizeVariationSet(variations.withText);
    }

    if (variations.iconOnly) {
      optimized.iconOnly = this.optimizeVariationSet(variations.iconOnly);
    }

    return optimized;
  }

  /**
   * Optimize a set of variations
   */
  private optimizeVariationSet(variationSet: any): any {
    const optimized = { ...variationSet };

    Object.keys(optimized).forEach((key) => {
      if (typeof optimized[key] === "string") {
        optimized[key] = SvgOptimizerService.optimizeSvg(optimized[key]);
      }
    });

    return optimized;
  }

  /**
   * Étape 1: Génère 3 concepts de logos principaux en parallèle - Version optimisée
   */
  async generateLogoConcepts(
    userId: string,
    projectId: string,
    selectedColors: ColorModel,
    selectedTypography: TypographyModel
  ): Promise<{
    logos: LogoModel[];
  }> {
    logger.info(
      `Generating 3 logo concepts in parallel for userId: ${userId}, projectId: ${projectId}`
    );

    // Étape 1: Récupération optimisée du projet avec fallback gracieux
    const project = await this.getProjectOptimized(userId, projectId);
    if (!project) {
      throw new Error(`Project not found with ID: ${projectId}`);
    }

    // Étape 4: Préparation du prompt optimisé
    const projectDescription = this.extractProjectDescription(project);

    // Step 5: Parallel AI generation of 4 optimized logos using JSON-to-SVG
    const startTime = Date.now();

    // Create 4 promises for parallel logo generation with token optimization
    const logoPromises = Array.from({ length: 3 }, (_, index) =>
      this.generateSingleLogoConcept(
        projectDescription,
        selectedColors,
        selectedTypography,
        project,
        index
      )
    );

    // Wait for all logos to be generated in parallel with optimization
    const optimizedLogos = await Promise.all(logoPromises);

    // Apply batch SVG optimization
    const finalOptimizedLogos =
      SvgOptimizerService.optimizeLogos(optimizedLogos);

    const aiGenerationTime = Date.now() - startTime;
    logger.info(
      `Parallel optimized AI generation completed in ${aiGenerationTime}ms for 3 logos with JSON-to-SVG conversion`
    );

    // Étape 6: Mise à jour immédiate du projet avec les logos générés
    const updatedProjectData = {
      ...project,
      analysisResultModel: {
        ...project.analysisResultModel,
        branding: {
          ...project.analysisResultModel.branding,
          colors: selectedColors,
          typography: selectedTypography,
          generatedLogos: finalOptimizedLogos as LogoModel[],
          updatedAt: new Date(),
        },
      },
    };

    // Database update with optimized logos
    const updatedProject = await this.projectRepository.update(
      projectId,
      updatedProjectData,
      `users/${userId}/projects`
    );

    if (updatedProject) {
      logger.info(
        `Successfully updated project with optimized logos - ProjectId: ${projectId}, LogoCount: ${finalOptimizedLogos.length}`
      );

      // Mise à jour du cache projet
      const projectCacheKey = `project_${userId}_${projectId}`;
      await cacheService.set(projectCacheKey, updatedProject, {
        prefix: "project",
        ttl: 3600,
      });

      logger.info(`Project cache updated with logos - ProjectId: ${projectId}`);
    }

    const totalTime = Date.now() - startTime;
    logger.info(
      `Parallel logo generation completed in ${totalTime}ms for 3 concepts`
    );

    return {
      logos: finalOptimizedLogos as LogoModel[],
    };
  }

  /**
   * Generate single logo variation for light background
   */
  private async generateSingleLightVariation(
    logoStructure: any,
    project: ProjectModel
  ): Promise<{ lightBackground?: string }> {
    const prompt = `Logo structure: ${JSON.stringify(
      logoStructure
    )}\n\n${LOGO_VARIATION_LIGHT_PROMPT}`;

    const steps: IPromptStep[] = [
      {
        promptConstant: prompt,
        stepName: "Light Background Variation",
        maxOutputTokens: 1000,
        modelParser: (content) => {
          try {
            const parsed = JSON.parse(content);
            return parsed.variation;
          } catch (error) {
            logger.error("Error parsing light variation JSON:", error);
            throw new Error("Failed to parse light variation JSON");
          }
        },
        hasDependencies: false,
      },
    ];

    const sectionResults = await this.processSteps(
      steps,
      project,
      BrandingService.LOGO_LLM_CONFIG
    );
    return sectionResults[0].parsedData;
  }

  /**
   * Generate single logo variation for dark background
   */
  private async generateSingleDarkVariation(
    logoStructure: any,
    project: ProjectModel
  ): Promise<{ darkBackground?: string }> {
    const prompt = `Logo structure: ${JSON.stringify(
      logoStructure
    )}\n\n${LOGO_VARIATION_DARK_PROMPT}`;

    const steps: IPromptStep[] = [
      {
        promptConstant: prompt,
        stepName: "Dark Background Variation",
        maxOutputTokens: 1000,
        modelParser: (content) => {
          try {
            const parsed = JSON.parse(content);
            return parsed.variation;
          } catch (error) {
            logger.error("Error parsing dark variation JSON:", error);
            throw new Error("Failed to parse dark variation JSON");
          }
        },
        hasDependencies: false,
      },
    ];

    const sectionResults = await this.processSteps(
      steps,
      project,
      BrandingService.LOGO_LLM_CONFIG
    );
    return sectionResults[0].parsedData;
  }

  /**
   * Generate single logo variation for monochrome
   */
  private async generateSingleMonochromeVariation(
    logoStructure: any,
    project: ProjectModel
  ): Promise<{ monochrome?: string }> {
    const prompt = `Logo structure: ${JSON.stringify(
      logoStructure
    )}\n\n${LOGO_VARIATION_MONOCHROME_PROMPT}`;

    const steps: IPromptStep[] = [
      {
        promptConstant: prompt,
        stepName: "Monochrome Variation",
        maxOutputTokens: 1000,
        modelParser: (content) => {
          try {
            const parsed = JSON.parse(content);
            return parsed.variation;
          } catch (error) {
            logger.error("Error parsing monochrome variation JSON:", error);
            throw new Error("Failed to parse monochrome variation JSON");
          }
        },
        hasDependencies: false,
      },
    ];

    const sectionResults = await this.processSteps(
      steps,
      project,
      BrandingService.LOGO_LLM_CONFIG
    );
    return sectionResults[0].parsedData;
  }

  /**
   * Generate logo variations using parallel execution for each variation type
   * Implements optimized parallel generation strategy
   */
  async generateLogoVariations(
    userId: string,
    projectId: string,
    selectedLogo: LogoModel
  ): Promise<{
    withText: {
      lightBackground?: string;
      darkBackground?: string;
      monochrome?: string;
    };
    iconOnly: {
      lightBackground?: string;
      darkBackground?: string;
      monochrome?: string;
    };
  }> {
    logger.info(
      `Generating logo variations using parallel execution for logo: ${selectedLogo.id}`
    );

    const project = await this.getProjectOptimized(userId, projectId);
    if (!project) {
      throw new Error(`Project not found with ID: ${projectId}`);
    }

    // Create compact logo structure for AI input (token-efficient)
    const logoStructure = {
      id: selectedLogo.id,
      name: selectedLogo.name,
      colors: selectedLogo.colors,
      concept: selectedLogo.concept,
      svg: selectedLogo.iconSvg,
    };

    // Execute all three variations in parallel
    logger.info(`Starting parallel generation of 3 logo variations`);
    const [lightVariation, darkVariation, monochromeVariation] =
      await Promise.all([
        this.generateSingleLightVariation(logoStructure, project),
        this.generateSingleDarkVariation(logoStructure, project),
        this.generateSingleMonochromeVariation(logoStructure, project),
      ]);

    logger.info(`Successfully generated all 3 variations in parallel`);

    // Create direct SVG variations (bypassing JSON-to-SVG conversion since we already have SVGs)
    const svgVariations = {
      withText: {
        lightBackground: lightVariation.lightBackground,
        darkBackground: darkVariation.darkBackground,
        monochrome: monochromeVariation.monochrome,
      },
      iconOnly: {
        lightBackground: lightVariation.lightBackground,
        darkBackground: darkVariation.darkBackground,
        monochrome: monochromeVariation.monochrome,
      },
    };

    // Apply advanced SVG optimization
    const optimizedVariations = {
      withText: this.optimizeVariationSet(svgVariations.withText),
      iconOnly: this.optimizeVariationSet(svgVariations.iconOnly),
    };

    // Update project with optimized variations
    const updatedProjectData = {
      ...project,
      analysisResultModel: {
        ...project.analysisResultModel,
        branding: {
          ...project.analysisResultModel.branding,
          logo: {
            ...selectedLogo,
            variations: optimizedVariations,
          },
          updatedAt: new Date(),
        },
      },
    };

    // Database update
    const updatedProject = await this.projectRepository.update(
      projectId,
      updatedProjectData,
      `users/${userId}/projects`
    );

    if (updatedProject) {
      logger.info(
        `Successfully updated project with optimized logo variations - ProjectId: ${projectId}, LogoId: ${selectedLogo.id}`
      );

      // Update project cache
      const projectCacheKey = `project_${userId}_${projectId}`;
      await cacheService.set(projectCacheKey, updatedProject, {
        prefix: "project",
        ttl: 3600,
      });

      // Cache AI variations with 2h TTL
      const variationsCacheKey = cacheService.generateAIKey(
        "logo_variations",
        userId,
        projectId,
        crypto
          .createHash("sha256")
          .update(JSON.stringify(selectedLogo))
          .digest("hex")
          .substring(0, 16)
      );
      await cacheService.set(variationsCacheKey, optimizedVariations, {
        prefix: "ai",
        ttl: 7200,
      });

      logger.info(
        `Optimized logo variations cached - ProjectId: ${projectId}, Variations: ${Object.keys(
          optimizedVariations.iconOnly
        ).join("/")}`
      );
    }

    return optimizedVariations;
  }

  async getBrandingsByProjectId(
    userId: string,
    projectId: string
  ): Promise<BrandIdentityModel | null> {
    logger.info(
      `Fetching branding for projectId: ${projectId}, userId: ${userId}`
    );
    const project = await this.projectRepository.findById(
      projectId,
      `users/${userId}/projects`
    );
    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId} when fetching branding.`
      );
      return null;
    }
    logger.info(`Successfully fetched branding for projectId: ${projectId}`);

    return project.analysisResultModel.branding;
  }

  async getBrandingById(
    userId: string,
    brandingId: string
  ): Promise<BrandIdentityModel | null> {
    logger.info(`Getting branding by ID: ${brandingId} for userId: ${userId}`);
    // In current implementation, branding is nested in project, so we don't have direct access by brandingId
    // This method would need to be implemented differently if we had a separate branding repository
    logger.warn(
      `Direct access to branding by ID is not supported in the current implementation`
    );
    return null;
  }

  async updateBranding(
    userId: string,
    projectId: string,
    data: Partial<BrandIdentityModel>
  ): Promise<ProjectModel | null> {
    logger.info(
      `Updating branding for userId: ${userId}, projectId: ${projectId}`
    );

    const project = await this.projectRepository.findById(
      projectId,
      `users/${userId}/projects`
    );
    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId} when updating branding.`
      );
      return null;
    }

    const updatedProject = {
      ...project,
      analysisResultModel: {
        ...project.analysisResultModel,
        branding: {
          ...project.analysisResultModel.branding,
          ...data,
        },
      },
    };

    const result = await this.projectRepository.update(
      projectId,
      updatedProject,
      `users/${userId}/projects`
    );
    logger.info(`Successfully updated branding for projectId: ${projectId}`);
    return result;
  }

  async deleteBranding(userId: string, projectId: string): Promise<boolean> {
    logger.info(
      `Removing branding for userId: ${userId}, projectId: ${projectId}`
    );

    const project = await this.projectRepository.findById(
      projectId,
      `users/${userId}/projects`
    );
    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId} when deleting branding.`
      );
      return false;
    }

    // Reset branding to empty state rather than removing it completely
    project.analysisResultModel.branding = {
      logo: {
        svg: "",
        concept: "",
        colors: [],
        fonts: [],
        id: "1",
        name: "",
      },
      generatedLogos: [],
      typography: {
        id: "",
        name: "",
        url: "",
        primaryFont: "",
        secondaryFont: "",
      },
      generatedTypography: [],
      generatedColors: [],
      colors: {
        id: "",
        name: "",
        url: "",
        colors: {
          primary: "",
          secondary: "",
          accent: "",
          background: "",
          text: "",
        },
      },
      sections: [],
    };

    await this.projectRepository.update(
      projectId,
      project,
      `users/${userId}/projects`
    );
    logger.info(`Successfully reset branding for projectId: ${projectId}`);
    return true;
  }

  /**
   * Génère un PDF à partir des sections de branding d'un projet
   * @param userId - ID de l'utilisateur
   * @param projectId - ID du projet
   * @returns Chemin vers le fichier PDF temporaire généré
   */
  async generateBrandingPdf(
    userId: string,
    projectId: string
  ): Promise<string> {
    logger.info(
      `Generating PDF for branding sections - projectId: ${projectId}, userId: ${userId}`
    );
    // Récupérer le projet et ses données de branding
    const project = await this.projectRepository.findById(
      projectId,
      `users/${userId}/projects`
    );

    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId} when generating branding PDF.`
      );
      throw new Error(`Project not found with ID: ${projectId}`);
    }
    const branding = project.analysisResultModel.branding;
    if (!branding || !branding.sections || branding.sections.length === 0) {
      logger.warn(
        `No branding sections found for project ${projectId} when generating PDF.`
      );
      return "";
    }

    try {
      // Generate cache key for PDF
      const pdfCacheKey = cacheService.generateAIKey(
        "branding-pdf",
        userId,
        projectId
      );

      // Check if PDF is already cached
      const cachedPdfPath = await cacheService.get<string>(pdfCacheKey, {
        prefix: "pdf",
        ttl: 3600, // 1 hour
      });

      if (cachedPdfPath) {
        logger.info(`Branding PDF cache hit for projectId: ${projectId}`);
        return cachedPdfPath;
      }

      logger.info(
        `Branding PDF cache miss, generating new PDF for projectId: ${projectId}`
      );

      // Utiliser le PdfService pour générer le PDF
      const pdfPath = await this.pdfService.generatePdf({
        title: "Branding",
        projectName: project.name || "Projet Sans Nom",
        projectDescription: project.description || "",
        sections: branding.sections,
        sectionDisplayOrder: [
          "Brand Header",
          "Logo System",
          "Color Palette",
          "Typography",
          "Usage Guidelines",
          // "Visual Examples",
          "Brand Footer",
        ],
        footerText: "Generated by Idem",
      });

      // Cache the PDF path for future requests
      await cacheService.set(pdfCacheKey, pdfPath, {
        prefix: "pdf",
        ttl: 3600, // 1 hour
      });
      logger.info(`Branding PDF cached for projectId: ${projectId}`);

      return pdfPath;
    } catch (error) {
      logger.error(
        `Error generating branding PDF for projectId: ${projectId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Génère un fichier ZIP contenant toutes les déclinaisons du logo
   * @param userId - ID de l'utilisateur
   * @param projectId - ID du projet
   * @param extension - Extension souhaitée (svg, png, psd)
   * @returns Buffer du fichier ZIP
   */
  async generateLogosZip(
    userId: string,
    projectId: string,
    extension: "svg" | "png" | "psd"
  ): Promise<Buffer> {
    logger.info(
      `Generating logos ZIP for projectId: ${projectId}, userId: ${userId}, extension: ${extension}`
    );

    // Récupérer le projet et ses données de branding
    const project = await this.projectRepository.findById(
      projectId,
      `users/${userId}/projects`
    );

    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId} when generating logos ZIP.`
      );
      throw new Error(`Project not found with ID: ${projectId}`);
    }

    const branding = project.analysisResultModel.branding;
    if (!branding || !branding.logo) {
      logger.warn(
        `No logo found for project ${projectId} when generating logos ZIP.`
      );
      throw new Error(`No logo found for project ${projectId}`);
    }

    const JSZip = require("jszip");
    const zip = new JSZip();

    try {
      // Récupérer toutes les déclinaisons disponibles
      const logoVariations = branding.logo.variations;
      const logoFiles: { name: string; content: string }[] = [];

      // Logo principal
      if (branding.logo.svg) {
        const content = await this.fetchContentFromUrl(branding.logo.svg);
        if (content) {
          logoFiles.push({
            name: "logo-main",
            content: content,
          });
        }
      }

      // Logo icône seulement
      if (branding.logo.iconSvg) {
        const content = await this.fetchContentFromUrl(branding.logo.iconSvg);
        if (content) {
          logoFiles.push({
            name: "logo-icon",
            content: content,
          });
        }
      }

      // Variations avec texte
      if (logoVariations?.withText) {
        if (logoVariations.withText.lightBackground) {
          const content = await this.fetchContentFromUrl(
            logoVariations.withText.lightBackground
          );
          if (content) {
            logoFiles.push({
              name: "logo-with-text-light-background",
              content: content,
            });
          }
        }
        if (logoVariations.withText.darkBackground) {
          const content = await this.fetchContentFromUrl(
            logoVariations.withText.darkBackground
          );
          if (content) {
            logoFiles.push({
              name: "logo-with-text-dark-background",
              content: content,
            });
          }
        }
        if (logoVariations.withText.monochrome) {
          const content = await this.fetchContentFromUrl(
            logoVariations.withText.monochrome
          );
          if (content) {
            logoFiles.push({
              name: "logo-with-text-monochrome",
              content: content,
            });
          }
        }
      }

      // Variations icône seulement
      if (logoVariations?.iconOnly) {
        if (logoVariations.iconOnly.lightBackground) {
          const content = await this.fetchContentFromUrl(
            logoVariations.iconOnly.lightBackground
          );
          if (content) {
            logoFiles.push({
              name: "logo-icon-only-light-background",
              content: content,
            });
          }
        }
        if (logoVariations.iconOnly.darkBackground) {
          const content = await this.fetchContentFromUrl(
            logoVariations.iconOnly.darkBackground
          );
          if (content) {
            logoFiles.push({
              name: "logo-icon-only-dark-background",
              content: content,
            });
          }
        }
        if (logoVariations.iconOnly.monochrome) {
          const content = await this.fetchContentFromUrl(
            logoVariations.iconOnly.monochrome
          );
          if (content) {
            logoFiles.push({
              name: "logo-icon-only-monochrome",
              content: content,
            });
          }
        }
      }

      if (logoFiles.length === 0) {
        throw new Error("No logo variations found to include in ZIP");
      }

      logger.info(
        `Found ${logoFiles.length} logo variations to include in ZIP`
      );

      // Traitement selon l'extension demandée
      for (const logoFile of logoFiles) {
        const fileName = `${logoFile.name}.${extension}`;

        if (extension === "svg") {
          // Pour SVG, ajouter directement le contenu
          zip.file(fileName, logoFile.content);
        } else if (extension === "png") {
          // Pour PNG, convertir le SVG
          const pngBuffer = await this.convertSvgToPng(logoFile.content);
          zip.file(fileName, pngBuffer);
        } else if (extension === "psd") {
          // Pour PSD, convertir le SVG en vrai fichier PSD
          const psdBuffer = await this.convertSvgToPsd(
            logoFile.name,
            logoFile.content
          );
          zip.file(fileName, psdBuffer);
        }
      }

      // Ajouter un fichier README avec les informations du projet
      const readmeContent = this.generateReadmeContent(
        project,
        extension,
        logoFiles.length
      );
      zip.file("README.txt", readmeContent);

      // Générer le ZIP
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      logger.info(
        `Successfully generated logos ZIP for projectId: ${projectId}, extension: ${extension}, files: ${logoFiles.length}`
      );

      return zipBuffer;
    } catch (error) {
      logger.error(
        `Error generating logos ZIP for projectId: ${projectId}, extension: ${extension}`,
        error
      );
      throw error;
    }
  }

  /**
   * Convertit un SVG en PNG
   */
  private async convertSvgToPng(svgContent: string): Promise<Buffer> {
    try {
      const sharp = require("sharp");

      // Convertir le SVG en PNG avec une résolution de 512x512
      const pngBuffer = await sharp(Buffer.from(svgContent))
        .resize(512, 512, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 }, // Fond transparent
        })
        .png()
        .toBuffer();

      return pngBuffer;
    } catch (error) {
      logger.error("Error converting SVG to PNG:", error);
      // Fallback: retourner le contenu SVG comme texte
      return Buffer.from(svgContent, "utf-8");
    }
  }

  /**
   * Convertit un SVG en fichier PSD réel
   * Utilise ag-psd pour créer un vrai fichier PSD avec calques
   */
  private async convertSvgToPsd(
    logoName: string,
    svgContent: string
  ): Promise<Buffer> {
    try {
      const { writePsd } = require("ag-psd");
      const sharp = require("sharp");

      logger.info(`Converting SVG to PSD for logo: ${logoName}`);

      // Étape 1: Convertir le SVG en PNG haute résolution pour le PSD
      const pngBuffer = await sharp(Buffer.from(svgContent))
        .resize(2048, 2048, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 }, // Fond transparent
        })
        .png()
        .toBuffer();

      // Obtenir les métadonnées de l'image
      const metadata = await sharp(pngBuffer).metadata();
      const width = metadata.width || 2048;
      const height = metadata.height || 2048;

      // Étape 2: Créer la structure PSD
      const psd = {
        width,
        height,
        channels: 4, // RGBA
        bitsPerChannel: 8,
        colorMode: 3, // RGB
        resources: {
          // Métadonnées du document
          documentSpecificIds: [],
          globalAngle: 30,
          globalAltitude: 30,
          printScale: {
            style: 0,
            x: 1,
            y: 1,
            scale: 1,
          },
          pixelAspectRatio: {
            aspect: 1,
          },
          // Informations sur le logo
          xmpMetadata: `<?xml version="1.0" encoding="UTF-8"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <dc:title>${logoName}</dc:title>
      <dc:description>Logo generated by Lexis API</dc:description>
      <dc:creator>Lexis Brand Identity System</dc:creator>
      <xmp:CreateDate>${new Date().toISOString()}</xmp:CreateDate>
      <xmp:ModifyDate>${new Date().toISOString()}</xmp:ModifyDate>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>`,
        },
        children: [
          // Calque de fond (optionnel, transparent)
          {
            name: "Background",
            opacity: 255,
            blendMode: "normal",
            visible: true,
            canvas: {
              width,
              height,
              data: new Uint8Array(width * height * 4).fill(0), // Transparent
            },
          },
          // Calque principal avec le logo
          {
            name: `${logoName} - Main`,
            opacity: 255,
            blendMode: "normal",
            visible: true,
            canvas: {
              width,
              height,
              data: new Uint8Array(pngBuffer),
            },
          },
          // Calque de texte (si le logo contient du texte)
          ...(svgContent.includes("<text")
            ? [
                {
                  name: `${logoName} - Text Layer`,
                  opacity: 255,
                  blendMode: "normal",
                  visible: true,
                  text: {
                    text: logoName,
                    transform: [1, 0, 0, 1, width / 2, height / 2],
                    textData: {
                      text: logoName,
                      antiAlias: true,
                      useFractionalGlyphWidths: true,
                    },
                    engineData: this.createTextEngineData(logoName),
                  },
                },
              ]
            : []),
          // Calque d'effets (ombre portée, etc.)
          {
            name: `${logoName} - Effects`,
            opacity: 128,
            blendMode: "multiply",
            visible: false,
            effects: {
              dropShadow: [
                {
                  enabled: true,
                  blendMode: "multiply",
                  color: { r: 0, g: 0, b: 0 },
                  opacity: 75,
                  angle: 135,
                  distance: 5,
                  spread: 0,
                  size: 5,
                },
              ],
            },
            canvas: {
              width,
              height,
              data: new Uint8Array(width * height * 4).fill(0),
            },
          },
        ],
      };

      // Étape 3: Générer le buffer PSD
      const psdBuffer = writePsd(psd);

      logger.info(
        `Successfully converted SVG to PSD for logo: ${logoName}, size: ${psdBuffer.length} bytes`
      );

      return Buffer.from(psdBuffer);
    } catch (error) {
      logger.error(`Error converting SVG to PSD for logo: ${logoName}`, error);

      // Fallback: créer un PSD simple avec juste l'image PNG
      return this.createSimplePsd(logoName, svgContent);
    }
  }

  /**
   * Crée un PSD simple en cas d'échec de la conversion complète
   */
  private async createSimplePsd(
    logoName: string,
    svgContent: string
  ): Promise<Buffer> {
    try {
      const { writePsd } = require("ag-psd");
      const sharp = require("sharp");

      // Convertir en PNG simple
      const pngBuffer = await sharp(Buffer.from(svgContent))
        .resize(1024, 1024, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toBuffer();

      const metadata = await sharp(pngBuffer).metadata();
      const width = metadata.width || 1024;
      const height = metadata.height || 1024;

      // PSD minimal
      const simplePsd = {
        width,
        height,
        channels: 4,
        bitsPerChannel: 8,
        colorMode: 3,
        children: [
          {
            name: logoName,
            opacity: 255,
            blendMode: "normal",
            visible: true,
            canvas: {
              width,
              height,
              data: new Uint8Array(pngBuffer),
            },
          },
        ],
      };

      const psdBuffer = writePsd(simplePsd);
      logger.info(`Created simple PSD for logo: ${logoName}`);

      return Buffer.from(psdBuffer);
    } catch (error) {
      logger.error(`Failed to create simple PSD for logo: ${logoName}`, error);

      // Dernier recours: retourner le contenu SVG comme fichier texte
      const fallbackContent = `PSD Conversion Failed for ${logoName}

Original SVG content:
${svgContent}

Error: ${error instanceof Error ? error.message : "Unknown error"}
Generated on: ${new Date().toISOString()}

Note: Install ag-psd and sharp dependencies for PSD conversion.
`;

      return Buffer.from(fallbackContent, "utf-8");
    }
  }

  /**
   * Crée les données de moteur de texte pour les calques de texte PSD
   */
  private createTextEngineData(text: string): any {
    return {
      EngineDict: {
        Editor: {
          Text: text,
        },
        ParagraphRun: {
          DefaultRunData: {
            ParagraphSheet: {
              DefaultStyleSheet: 0,
              Properties: {},
            },
            Adjustments: {
              Axis: [1, 0, 1],
              XY: [0, 0],
            },
          },
          RunArray: [
            {
              ParagraphSheet: {
                DefaultStyleSheet: 0,
                Properties: {},
              },
              Adjustments: {
                Axis: [1, 0, 1],
                XY: [0, 0],
              },
              RunLength: text.length,
            },
          ],
        },
        StyleRun: {
          DefaultRunData: {
            StyleSheet: {
              StyleSheetData: {
                Font: 0,
                FontSize: 48,
                FauxBold: false,
                FauxItalic: false,
                AutoLeading: true,
                Leading: 0,
                HorizontalScale: 1,
                VerticalScale: 1,
                Tracking: 0,
                AutoKern: true,
                BaselineShift: 0,
                FontCaps: 0,
                FontBaseline: 0,
                Strikethrough: false,
                Underline: false,
                Ligatures: true,
                DLigatures: false,
                BaselineDirection: 2,
                Tsume: 0,
                StyleRunAlignment: 2,
                Language: 0,
                NoBreak: false,
                FillColor: {
                  Type: 1,
                  Values: [0, 0, 0, 1],
                },
              },
            },
          },
          RunArray: [
            {
              StyleSheet: {
                StyleSheetData: {
                  Font: 0,
                  FontSize: 48,
                  FillColor: {
                    Type: 1,
                    Values: [0, 0, 0, 1],
                  },
                },
              },
              RunLength: text.length,
            },
          ],
        },
      },
    };
  }

  /**
   * Génère le contenu du fichier README
   */
  private generateReadmeContent(
    project: any,
    extension: string,
    fileCount: number
  ): string {
    return `Logo Package - ${project.name}
    
Project: ${project.name}
Description: ${project.description || "No description available"}
Format: ${extension.toUpperCase()}
Files included: ${fileCount}
Generated on: ${new Date().toISOString()}

File naming convention:
- logo-main: Main logo with text
- logo-icon: Icon-only version
- logo-with-text-*: Logo with text in different variations
- logo-icon-only-*: Icon-only in different variations

Variations:
- light-background: Optimized for light backgrounds
- dark-background: Optimized for dark backgrounds  
- monochrome: Single color version

Generated by Lexis API - Brand Identity System
`;
  }

  /**
   * Récupère le contenu d'un fichier depuis une URL (Firebase Storage ou autre)
   * @param url - URL du fichier à récupérer
   * @returns Le contenu du fichier ou null si erreur
   */
  private async fetchContentFromUrl(url: string): Promise<string | null> {
    try {
      logger.info(`Fetching content from URL: ${url}`);

      // Vérifier si c'est une URL valide
      if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
        logger.warn(`Invalid URL format: ${url}`);
        // Si ce n'est pas une URL, c'est peut-être déjà le contenu SVG
        if (url && url.includes("<svg")) {
          return url;
        }
        return null;
      }

      // Utiliser fetch pour récupérer le contenu
      const response = await fetch(url);

      if (!response.ok) {
        logger.error(
          `Failed to fetch content from URL: ${url}, status: ${response.status}`
        );
        return null;
      }

      const content = await response.text();

      // Vérifier que le contenu semble être du SVG
      if (!content.includes("<svg")) {
        logger.warn(`Content from URL ${url} does not appear to be SVG`);
      }

      logger.info(
        `Successfully fetched content from URL: ${url}, length: ${content.length} characters`
      );
      return content;
    } catch (error) {
      logger.error(`Error fetching content from URL: ${url}`, error);
      return null;
    }
  }
}
