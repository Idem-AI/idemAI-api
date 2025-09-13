import logger from "../../config/logger";
import { ProjectModel } from "../../models/project.model";
import { LLMProvider, PromptService } from "../prompt.service";

import {
  BrandIdentityModel,
  ColorModel,
  TypographyModel,
} from "../../models/brand-identity.model";
import { LOGO_GENERATION_PROMPT } from "./prompts/singleGenerations/00_logo-generation-section.prompt";
import { LOGO_VARIATIONS_GENERATION_PROMPT } from "./prompts/singleGenerations/01_logo-variations-generation.prompt";

import { BRAND_HEADER_SECTION_PROMPT } from "./prompts/00_brand-header-section.prompt";
import { LOGO_SYSTEM_SECTION_PROMPT } from "./prompts/01_logo-system-section.prompt";
import { COLOR_PALETTE_SECTION_PROMPT } from "./prompts/02_color-palette-section.prompt";
import { TYPOGRAPHY_SECTION_PROMPT } from "./prompts/03_typography-section.prompt";
import { USAGE_GUIDELINES_SECTION_PROMPT } from "./prompts/04_usage-guidelines-section.prompt";
import { BRAND_FOOTER_SECTION_PROMPT } from "./prompts/07_brand-footer-section.prompt";
import { SectionModel } from "../../models/section.model";
import { DiagramModel } from "../../models/diagram.model";
import { DevelopmentConfigsModel } from "../../models/development.model";
import { LandingModel } from "../../models/landing.model";
import { AnalysisResultBuilder } from "../../models/builders/analysisResult.builder";
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
import { SvgIconExtractorService } from "./svgIconExtractor.service";
import { LogoJsonToSvgService } from "./logoJsonToSvg.service";
import { SvgOptimizerService } from "./svgOptimizer.service";
import {
  LogoJsonStructure,
  LogoVariationsJson,
} from "./interfaces/logoJson.interface";

export class BrandingService extends GenericService {
  private pdfService: PdfService;
  private logoJsonToSvgService: LogoJsonToSvgService;

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
        // {
        //   promptConstant: LOGO_SYSTEM_SECTION_PROMPT + projectDescription,
        //   stepName: "Logo System",
        //   hasDependencies: false,
        // },
        // {
        //   promptConstant: COLOR_PALETTE_SECTION_PROMPT + projectDescription,
        //   stepName: "Color Palette",
        //   hasDependencies: false,
        // },
        // {
        //   promptConstant: TYPOGRAPHY_SECTION_PROMPT + projectDescription,
        //   stepName: "Typography",
        //   hasDependencies: false,
        // },
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
        // {
        //   promptConstant: BRAND_FOOTER_SECTION_PROMPT + projectDescription,
        //   stepName: "Brand Footer",
        //   hasDependencies: false,
        // },
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

    const sectionResults = await this.processSteps(steps, project, {
      provider: LLMProvider.GEMINI,
      modelName: "gemini-2.0-flash",
      llmOptions: {
        maxOutputTokens: 5000,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });
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

    const sectionResults = await this.processSteps(steps, project, {
      provider: LLMProvider.GEMINI,
      modelName: "gemini-2.0-flash",
      llmOptions: {
        maxOutputTokens: 5000,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });
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
        maxOutputTokens: 4000,
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

    const sectionResults = await this.processSteps(steps, project, {
      provider: LLMProvider.GEMINI,
      modelName: "gemini-2.5-flash",
      llmOptions: {
        maxOutputTokens: 4000,
        temperature: 0.2,
        topP: 0.8,
        topK: 20,
      },
    });
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
      `Professional logo concept ${conceptIndex + 1} generated with direct SVG content`
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
      return fullSvg.replace(/<g id="text"[^>]*>[\s\S]*?<\/g>/, '');
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
   * Generate logo variations using optimized JSON-to-SVG layered approach
   * Implements token-saving strategy with compact JSON generation
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
      `Generating optimized logo variations using JSON-to-SVG conversion for logo: ${selectedLogo.id}`
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
    };

    const prompt = `Logo structure: ${JSON.stringify(
      logoStructure
    )}\n\n${LOGO_VARIATIONS_GENERATION_PROMPT}`;

    const steps: IPromptStep[] = [
      {
        promptConstant: prompt,
        stepName: "Logo Variations Generation",
        maxOutputTokens: 2000, // Increased tokens for detailed variations
        modelParser: (content) => {
          try {
            const variationsJson: LogoVariationsJson = JSON.parse(content);
            return variationsJson;
          } catch (error) {
            logger.error("Error parsing logo variations JSON:", error);
            throw new Error("Failed to parse logo variations JSON");
          }
        },
        hasDependencies: false,
      },
    ];

    const sectionResults = await this.processSteps(steps, project);
    const variationsResult = sectionResults[0];
    const variationsJson: LogoVariationsJson = variationsResult.parsedData;

    // Convert JSON variations to optimized SVGs
    const svgVariations =
      this.logoJsonToSvgService.convertVariationsJsonToSvg(variationsJson);

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
        `Optimized logo variations cached - ProjectId: ${projectId}, Shapes: ${Object.keys(
          variationsJson.variations
        )
          .map(
            (k) =>
              variationsJson.variations[
                k as keyof typeof variationsJson.variations
              ].shapes.length
          )
          .join("/")}`
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
}
