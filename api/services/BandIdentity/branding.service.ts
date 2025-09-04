import logger from "../../config/logger";
import { ProjectModel } from "../../models/project.model";
import { PromptService } from "../prompt.service";

import {
  BrandIdentityModel,
  ColorModel,
  TypographyModel,
} from "../../models/brand-identity.model";
import { LOGO_GENERATION_PROMPT } from "./prompts/singleGenerations/00_logo-generation-section.prompt";
import { LOGO_VARIATIONS_GENERATION_PROMPT } from "./prompts/singleGenerations/01_logo-variations-generation.prompt";
import { SvgOptimizerService } from "./svgOptimizer.service";
import { SvgIconExtractorService } from "./svgIconExtractor.service";
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
import { COLORS_TYPOGRAPHY_GENERATION_PROMPT } from "./prompts/singleGenerations/colors-typography-generation.prompt";
import { PdfService } from "../pdf.service";
import { cacheService } from "../cache.service";
import crypto from "crypto";
import { projectService } from "../project.service";

export class BrandingService extends GenericService {
  private pdfService: PdfService;

  constructor(promptService: PromptService) {
    super(promptService);
    this.pdfService = new PdfService();
    logger.info("BrandingService initialized");
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

  /**
   * Optimisation SVG en parallèle pour améliorer les performances
   */
  private async optimizeLogosParallel(logoData: any[]): Promise<LogoModel[]> {
    if (!logoData || logoData.length === 0) {
      return [];
    }

    // Utiliser la méthode optimizeLogos existante qui est déjà optimisée
    try {
      return SvgOptimizerService.optimizeLogos(logoData);
    } catch (error) {
      logger.error(`Error optimizing logos:`, error);
      return logoData; // Fallback vers les logos non-optimisés
    }
  }

  /**
   * Mise à jour asynchrone du projet avec les logos (non-bloquant)
   */
  private async updateProjectWithLogosAsync(
    userId: string,
    projectId: string,
    project: ProjectModel,
    logos: LogoModel[]
  ): Promise<void> {
    try {
      // Préparation des données du projet
      if (!project.analysisResultModel) {
        project.analysisResultModel = AnalysisResultBuilder.createEmpty();
      }
      if (!project.analysisResultModel.branding) {
        project.analysisResultModel.branding =
          BrandIdentityBuilder.createEmpty();
      }

      project.analysisResultModel.branding.generatedLogos = logos;

      // Mise à jour en base de données
      const updatedProject = await this.projectRepository.update(
        project.id!,
        project,
        `users/${userId}/projects`
      );

      if (updatedProject) {
        // Mise à jour du cache projet
        const projectCacheKey = `project_${userId}_${projectId}`;
        await cacheService.set(projectCacheKey, updatedProject, {
          prefix: "project",
          ttl: 3600,
        });

        // Cache individuel des logos en parallèle
        const cachingPromises = logos.map((logo) =>
          cacheService
            .set(`logo_concept_${userId}_${logo.id}`, logo, {
              prefix: "logo",
              ttl: 3600,
            })
            .catch((error) =>
              logger.error(`Error caching logo ${logo.id}:`, error)
            )
        );

        await Promise.allSettled(cachingPromises);

        logger.info(
          `Background project update completed - ProjectId: ${projectId}, LogoCount: ${logos.length}`
        );
      }
    } catch (error) {
      logger.error(`Error in background project update:`, error);
      throw error;
    }
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

  async generateColorsAndTypography(
    userId: string,
    project: ProjectModel
  ): Promise<{
    colors: ColorModel[];
    typography: TypographyModel[];
    project: ProjectModel;
  }> {
    logger.info(`Generating colors and typography for userId: ${userId}`);

    // Créer le projet
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

    const steps: IPromptStep[] = [
      {
        promptConstant:
          projectDescription + COLORS_TYPOGRAPHY_GENERATION_PROMPT,
        stepName: "Colors and Typography Generation",
        modelParser: (content) =>
          this.parseSection(
            content,
            "Colors and Typography Generation",
            project.id!
          ),
        hasDependencies: false,
      },
    ];
    const sectionResults = await this.processSteps(steps, project);
    const colorsTypographyResult = sectionResults[0];

    return {
      colors: colorsTypographyResult.parsedData.colors,
      typography: colorsTypographyResult.parsedData.typography,
      project: createdProject,
    };
  }

  /**
   * Génère un seul concept de logo - Méthode privée pour génération parallèle
   */
  private async generateSingleLogoConcept(
    projectDescription: string,
    colors: ColorModel,
    typography: TypographyModel,
    project: ProjectModel,
    conceptIndex: number
  ): Promise<LogoModel> {
    logger.info(`Generating single logo concept ${conceptIndex + 1}`);

    // Préparation du prompt optimisé pour un seul logo
    const optimizedPrompt = this.buildOptimizedLogoPrompt(
      projectDescription,
      colors,
      typography
    );

    // Génération AI avec prompt optimisé pour un seul logo
    const steps: IPromptStep[] = [
      {
        promptConstant: optimizedPrompt,
        stepName: `Logo Concept ${conceptIndex + 1}`,
        modelParser: (content) => {
          try {
            // Parse le JSON d'un seul logo au lieu d'un array
            const parsedLogo = JSON.parse(content);

            // Assurer un ID unique pour chaque concept
            if (!parsedLogo.id) {
              parsedLogo.id = `concept${String(conceptIndex + 1).padStart(
                2,
                "0"
              )}`;
            }

            return {
              name: `Logo Concept ${conceptIndex + 1}`,
              type: "logo",
              data: content,
              summary: `Logo concept ${conceptIndex + 1} generated`,
              parsedData: parsedLogo, // Un seul logo, pas un array
            };
          } catch (error) {
            logger.error(
              `Error parsing logo concept ${conceptIndex + 1}:`,
              error
            );
            throw new Error(`Failed to parse logo concept ${conceptIndex + 1}`);
          }
        },
        hasDependencies: false,
      },
    ];

    const sectionResults = await this.processSteps(steps, project);
    const logoResult = sectionResults[0];
    const parsedLogoContent = logoResult.parsedData;

    // Optimisation SVG du logo unique
    const optimizedLogos = SvgOptimizerService.optimizeLogos([
      parsedLogoContent,
    ]);
    const optimizedLogo = optimizedLogos[0];

    logger.info(
      `Single logo concept ${conceptIndex + 1} generated and optimized`
    );
    return optimizedLogo;
  }

  /**
   * Étape 1: Génère 4 concepts de logos principaux en parallèle - Version optimisée
   */
  async generateLogoConcepts(
    userId: string,
    projectId: string
  ): Promise<{
    logos: LogoModel[];
  }> {
    logger.info(
      `Generating 4 logo concepts in parallel for userId: ${userId}, projectId: ${projectId}`
    );

    // Étape 1: Récupération optimisée du projet avec fallback gracieux
    const project = await this.getProjectOptimized(userId, projectId);
    if (!project) {
      throw new Error(`Project not found with ID: ${projectId}`);
    }

    // Étape 2: Génération de clé de cache basée sur le contenu pour l'IA
    const contentHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          projectName: project.name,
          projectDescription: project.description,
          colors: project.analysisResultModel.branding.colors,
          typography: project.analysisResultModel.branding.typography,
          prompt: LOGO_GENERATION_PROMPT.substring(0, 100), // Partial prompt for cache key
        })
      )
      .digest("hex")
      .substring(0, 16);

    const aiCacheKey = cacheService.generateAIKey(
      "logo-concepts",
      userId,
      projectId,
      contentHash
    );

    // Étape 3: Vérifier le cache AI d'abord (gain potentiel de 10-15s)
    const cachedLogos = await cacheService.get<LogoModel[]>(aiCacheKey, {
      prefix: "ai",
      ttl: 7200, // 2 heures
    });

    if (cachedLogos && cachedLogos.length > 0) {
      logger.info(
        `Logo concepts cache hit for projectId: ${projectId} - returning ${cachedLogos.length} cached logos`
      );

      // Mise à jour asynchrone du projet en arrière-plan (non-bloquant)
      this.updateProjectWithLogosAsync(
        userId,
        projectId,
        project,
        cachedLogos
      ).catch((error) =>
        logger.error(`Background project update failed:`, error)
      );

      return { logos: cachedLogos };
    }

    logger.info(
      `Logo concepts cache miss, generating 4 new concepts in parallel for projectId: ${projectId}`
    );

    // Étape 4: Préparation du prompt optimisé
    const projectDescription = this.extractProjectDescription(project);

    // Étape 5: Génération AI parallèle des 4 logos
    const startTime = Date.now();

    // Créer 4 promesses pour générer les logos en parallèle
    const logoPromises = Array.from({ length: 4 }, (_, index) =>
      this.generateSingleLogoConcept(
        projectDescription,
        project.analysisResultModel.branding.colors,
        project.analysisResultModel.branding.typography,
        project,
        index
      )
    );

    // Attendre que tous les logos soient générés en parallèle
    const optimizedLogos = await Promise.all(logoPromises);

    const aiGenerationTime = Date.now() - startTime;
    logger.info(
      `Parallel AI generation completed in ${aiGenerationTime}ms for 4 logos`
    );

    // Étape 6: Cache AI immédiat (avant mise à jour DB)
    await cacheService.set(aiCacheKey, optimizedLogos, {
      prefix: "ai",
      ttl: 7200, // 2 heures
    });
    logger.info(
      `Logo concepts cached for future requests - projectId: ${projectId}`
    );

    // Étape 7: Mise à jour du projet et cache en arrière-plan (non-bloquant)
    this.updateProjectWithLogosAsync(
      userId,
      projectId,
      project,
      optimizedLogos
    ).catch((error) =>
      logger.error(`Background project update failed:`, error)
    );

    const totalTime = Date.now() - startTime;
    logger.info(
      `Parallel logo generation completed in ${totalTime}ms for 4 concepts`
    );

    return {
      logos: optimizedLogos,
    };
  }

  /**
   * Étape 2: Génère les variations d'un logo sélectionné
   */
  async generateLogoVariations(
    userId: string,
    projectId: string
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
    // Utiliser le SVG du logo récupéré du cache
    const project = await this.getProjectOptimized(userId, projectId);
    if (!project) {
      throw new Error(`Project not found with ID: ${projectId}`);
    }
    const selectedLogoSvg = project.analysisResultModel.branding.logo.svg;
    const selectedIconSvg = project.analysisResultModel.branding.logo.iconSvg;

    // L'icône est maintenant directement fournie par l'IA, plus besoin d'extraction
    const iconResult = {
      fullLogo: selectedLogoSvg,
      iconOnly: selectedIconSvg || selectedLogoSvg, // Fallback au logo complet si pas d'icône
    };

    const prompt = `Selected logo SVG: ${JSON.stringify(
      iconResult
    )}\n\n${LOGO_VARIATIONS_GENERATION_PROMPT}`;

    const steps: IPromptStep[] = [
      {
        promptConstant: prompt,
        stepName: "Logo Variations Generation",
        modelParser: (content) => {
          try {
            const parsed = JSON.parse(content);
            return {
              name: "Logo Variations Generation",
              type: "variations",
              data: content,
              summary: "Logo variations generated",
              parsedData: parsed.variations,
            };
          } catch (error) {
            logger.error("Error parsing logo variations:", error);
            throw new Error("Failed to parse logo variations");
          }
        },
        hasDependencies: false,
      },
    ];

    const sectionResults = await this.processSteps(steps, project);
    const variationsResult = sectionResults[0];
    const variations = variationsResult.parsedData;

    // Étape 3: Optimiser les variations SVG
    const optimizedVariations: any = {};
    if (variations.lightBackground) {
      optimizedVariations.lightBackground = SvgOptimizerService.optimizeSvg(
        variations.lightBackground
      );
    }
    if (variations.darkBackground) {
      optimizedVariations.darkBackground = SvgOptimizerService.optimizeSvg(
        variations.darkBackground
      );
    }
    if (variations.monochrome) {
      optimizedVariations.monochrome = SvgOptimizerService.optimizeSvg(
        variations.monochrome
      );
    }

    // Étape 4: Générer les variations avec et sans texte
    const variationsWithText =
      SvgIconExtractorService.generateVariationsWithText(
        selectedLogoSvg,
        optimizedVariations
      );

    // Les variations générées par l'IA sont déjà des icônes uniquement
    // Plus besoin d'extraction supplémentaire
    const iconVariations = {
      lightBackground: optimizedVariations.lightBackground,
      darkBackground: optimizedVariations.darkBackground,
      monochrome: optimizedVariations.monochrome,
    };

    return {
      withText: variationsWithText.withText,
      iconOnly: iconVariations,
    };
  }

  async generateLogoColorsAndTypography(
    userId: string,
    project: ProjectModel
  ): Promise<{
    logos: LogoModel[];
    colors: ColorModel[];
    typography: TypographyModel[];
  }> {
    logger.info(
      `Generating logo colors and typography for userId: ${userId}, projectId: ${project.id}`
    );

    if (!project.id) {
      throw new Error(`Project not found with ID: ${project.id}`);
    }

    const projectDescription = this.extractProjectDescription(project);

    const steps: IPromptStep[] = [
      {
        promptConstant:
          projectDescription + COLORS_TYPOGRAPHY_GENERATION_PROMPT,
        stepName: "Colors and Typography Generation",
        modelParser: (content) =>
          this.parseSection(
            content,
            "Colors and Typography Generation",
            project.id!
          ),
        hasDependencies: false,
      },
      {
        promptConstant: projectDescription + LOGO_GENERATION_PROMPT,
        stepName: "Logo Concepts Generation",
        modelParser: (content) =>
          this.parseSection(content, "Logo Concepts Generation", project.id!),
        hasDependencies: false,
      },
    ];
    const sectionResults = await this.processSteps(steps, project);
    const colorsTypographyResult = sectionResults[0];
    const logoResult = sectionResults[1];
    const parsedLogoContent = logoResult.parsedData;

    // Étape 3: Optimiser les logos générés
    const optimizedLogos = SvgOptimizerService.optimizeLogos(parsedLogoContent);

    return {
      logos: optimizedLogos,
      colors: colorsTypographyResult.parsedData.colors,
      typography: colorsTypographyResult.parsedData.typography,
    };
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
