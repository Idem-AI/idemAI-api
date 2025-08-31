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
   * Étape 1: Génère 4 concepts de logos principaux (sans variations)
   */
  async generateLogoConcepts(
    userId: string,
    projectId: string,
    colors: ColorModel,
    typography: TypographyModel
  ): Promise<{
    logos: LogoModel[];
  }> {
    logger.info(
      `Generating logo concepts for userId: ${userId}, projectId: ${projectId}`
    );

    // Récupérer le projet depuis le cache d'abord
    const projectCacheKey = `project_${userId}_${projectId}`;
    let project = await cacheService.get<ProjectModel>(projectCacheKey, {
      prefix: "project",
    });

    // Si pas en cache, récupérer depuis la base de données
    if (!project) {
      logger.info(
        `Project not found in cache, fetching from database - ProjectId: ${projectId}, UserId: ${userId}`
      );
      project = await this.projectRepository.findById(
        projectId,
        `users/${userId}/projects`
      );
      if (!project) {
        logger.error(
          `Project not found with ID: ${projectId} for user: ${userId}`
        );
        throw new Error(`Project not found with ID: ${projectId}`);
      }

      // Mettre le projet en cache pour les prochaines utilisations
      try {
        await cacheService.set(projectCacheKey, project, {
          prefix: "project",
          ttl: 3600, // 1 heure
        });
        logger.info(
          `Project cached after database fetch - ProjectId: ${projectId}`
        );
      } catch (error) {
        logger.error(`Error caching project after fetch`, error);
      }
    } else {
      logger.info(
        `Project retrieved from cache - ProjectId: ${projectId}, UserId: ${userId}`
      );
    }

    let projectDescription = this.extractProjectDescription(project);
    projectDescription += `Colors: ${JSON.stringify(
      colors
    )} Typography: ${JSON.stringify(typography)}`;

    const steps: IPromptStep[] = [
      {
        promptConstant: projectDescription + LOGO_GENERATION_PROMPT,
        stepName: "Logo Concepts Generation",
        modelParser: (content) =>
          this.parseSection(content, "Logo Concepts Generation", project.id!),
        hasDependencies: false,
      },
    ];
    const sectionResults = await this.processSteps(steps, project);
    const logoResult = sectionResults[0];
    const parsedLogoContent = logoResult.parsedData;

    // Étape 3: Optimiser les SVG générés (maintenant avec iconSvg déjà fourni par l'IA)
    const optimizedLogos = SvgOptimizerService.optimizeLogos(parsedLogoContent);

    // Plus besoin d'extraire les icônes car l'IA les génère directement
    // Les logos ont maintenant les champs svg et iconSvg séparés

    // Étape 5: Mettre à jour le projet avec les concepts de logo et sauvegarder en DB
    try {
      // Ajouter les logos au projet
      if (!project.analysisResultModel) {
        project.analysisResultModel = AnalysisResultBuilder.createEmpty();
      }
      if (!project.analysisResultModel.branding) {
        project.analysisResultModel.branding = BrandIdentityBuilder.createEmpty();
      }
      if (!project.analysisResultModel.branding.generatedLogos) {
        project.analysisResultModel.branding.generatedLogos = [];
      }

      project.analysisResultModel.branding.generatedLogos = optimizedLogos;

      // Sauvegarder le projet mis à jour en base de données
      const updatedProject = await this.projectRepository.update(
        project.id!,
        project,
        `users/${userId}/projects`
      );

      // Mettre à jour le cache du projet
      await cacheService.set(projectCacheKey, updatedProject, {
        prefix: "project",
        ttl: 3600, // 1 heure
      });

      logger.info(
        `Project updated with logo concepts - ProjectId: ${project.id}, LogoCount: ${optimizedLogos.length}`
      );
    } catch (error) {
      logger.error(`Error updating project with logo concepts`, error);
      throw new Error("Failed to save logo concepts to project");
    }

    // Étape 6: Sauvegarder chaque logo dans le cache avec son ID comme clé
    try {
      for (const logo of optimizedLogos) {
        const logoCacheKey = `logo_concept_${userId}_${logo.id}`;
        await cacheService.set(logoCacheKey, logo, {
          prefix: "logo",
          ttl: 3600, // 1 heure
        });
        logger.info(
          `Logo concept cached with ID: ${logo.id} for userId: ${userId}`
        );
      }
    } catch (error) {
      logger.error(`Error caching logo concepts for userId: ${userId}`, error);
      // Continue without failing - cache is not critical
    }

    return {
      logos: optimizedLogos,
    };
  }

  /**
   * Étape 2: Génère les variations d'un logo sélectionné
   */
  async generateLogoVariations(
    userId: string,
    project: ProjectModel,
    logoId: string
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
      `Generating logo variations for userId: ${userId}, projectId: ${project.id}, logoId: ${logoId}`
    );
    const logoCacheKey = `logo_concept_${userId}_${logoId}`;
    const cachedLogo = await cacheService.get<LogoModel>(logoCacheKey, {
      prefix: "logo",
    });

    if (!cachedLogo) {
      logger.error(
        `Logo not found in cache with ID: ${logoId} for userId: ${userId}`
      );
      throw new Error(`Logo concept not found in cache with ID: ${logoId}`);
    }

    logger.info(`Retrieved logo from cache: ${logoId} for userId: ${userId}`);

    // Utiliser le SVG du logo récupéré du cache
    const selectedLogoSvg = cachedLogo.svg;
    const selectedIconSvg = cachedLogo.iconSvg;

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

    // Étape 5: Supprimer le logo du cache après génération des variations
    try {
      await cacheService.delete(logoCacheKey, { prefix: "logo" });
      logger.info(
        `Deleted logo concept from cache: ${logoId} for userId: ${userId}`
      );
    } catch (error) {
      logger.error(`Error deleting logo from cache: ${logoId}`, error);
      // Continue without failing - cache cleanup is not critical
    }

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
