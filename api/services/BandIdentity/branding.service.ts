import logger from "../../config/logger";
import { ProjectModel } from "../../models/project.model";
import { PromptService } from "../prompt.service";
import {
  BrandIdentityModel,
  ColorModel,
  TypographyModel,
} from "../../models/brand-identity.model";
import { LOGO_GENERATION_PROMPT } from "./prompts/singleGenerations/00_logo-generation-section.prompt";
import { BRAND_HEADER_SECTION_PROMPT } from "./prompts/00_brand-header-section.prompt";
import { LOGO_SYSTEM_SECTION_PROMPT } from "./prompts/01_logo-system-section.prompt";
import { COLOR_PALETTE_SECTION_PROMPT } from "./prompts/02_color-palette-section.prompt";
import { TYPOGRAPHY_SECTION_PROMPT } from "./prompts/03_typography-section.prompt";
import { USAGE_GUIDELINES_SECTION_PROMPT } from "./prompts/04_usage-guidelines-section.prompt";
import { VISUAL_EXAMPLES_SECTION_PROMPT } from "./prompts/05_visual-examples-section.prompt";
import { BRAND_FOOTER_SECTION_PROMPT } from "./prompts/07_brand-footer-section.prompt";
import { SectionModel } from "../../models/section.model";
import {
  GenericService,
  IPromptStep,
  ISectionResult,
} from "../common/generic.service";
import { LogoModel } from "../../models/logo.model";
import { COLORS_TYPOGRAPHY_GENERATION_PROMPT } from "./prompts/singleGenerations/colors-typography-generation.prompt";
import { PdfService } from "../pdf.service";

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

    // Extract and add project description to context
    const projectDescription =
      this.extractProjectDescription(project) +
      "\n\nHere is the project branding colors: " +
      JSON.stringify(project.analysisResultModel.branding.colors) +
      "\n\nHere is the project branding typography: " +
      JSON.stringify(project.analysisResultModel.branding.typography) +
      "\n\nHere is the project branding logo: " +
      JSON.stringify(project.analysisResultModel.branding.logo);

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

            // Convert result to section model
            const section: SectionModel = {
              name: result.name,
              type: result.type,
              data: result.data,
              summary: result.summary,
            };

            // Add to sections array
            if (
              result.data !== "steps_in_progress" &&
              result.data !== "all_steps_completed"
            ) {
              sections.push(section);
            }

            // Call the provided callback
            await streamCallback(result);
          },
          undefined, // promptConfig
          "branding", // promptType
          userId
        );
      } else {
        // Fallback to non-streaming processing
        const stepResults = await this.processSteps(steps, project);
        sections = stepResults.map((result) => ({
          name: result.name,
          type: result.type,
          data: result.data,
          summary: result.summary,
        }));
      }

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
              oldProject.analysisResultModel.branding.generatedTypography || [],
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
      }
      return updatedProject;
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
  }> {
    logger.info(
      `Generating colors and typography for userId: ${userId}, projectId: ${project.id}`
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
    ];
    const sectionResults = await this.processSteps(steps, project);
    const colorsTypographyResult = sectionResults[0];

    return {
      colors: colorsTypographyResult.parsedData.colors,
      typography: colorsTypographyResult.parsedData.typography,
    };
  }

  async generateLogos(
    userId: string,
    project: ProjectModel,
    colors: ColorModel,
    typography: TypographyModel
  ): Promise<{
    logos: LogoModel[];
  }> {
    logger.info(
      `Generating logos for userId: ${userId}, projectId: ${project.id}`
    );

    if (!project.id) {
      throw new Error(`Project not found with ID: ${project.id}`);
    }

    let projectDescription = this.extractProjectDescription(project);
    projectDescription += `Colors: ${JSON.stringify(
      colors
    )} Typography: ${JSON.stringify(typography)}`;

    const steps: IPromptStep[] = [
      {
        promptConstant: projectDescription + LOGO_GENERATION_PROMPT,
        stepName: "Logo Generation",
        modelParser: (content) =>
          this.parseSection(content, "Logo Generation", project.id!),
        hasDependencies: false,
      },
    ];
    const sectionResults = await this.processSteps(steps, project);
    const logoResult = sectionResults[0];
    const parsedLogoContent = logoResult.parsedData;

    return {
      logos: parsedLogoContent,
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
        stepName: "Logo Generation",
        modelParser: (content) =>
          this.parseSection(content, "Logo Generation", project.id!),
        hasDependencies: false,
      },
    ];
    const sectionResults = await this.processSteps(steps, project);
    const colorsTypographyResult = sectionResults[0];
    const logoResult = sectionResults[1];
    const parsedLogoContent = logoResult.parsedData;

    return {
      logos: parsedLogoContent,
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
      throw new Error(`No branding sections found for project ${projectId}`);
    }

    // Utiliser le PdfService pour générer le PDF
    return await this.pdfService.generatePdf({
      title: "Branding",
      projectName: project.name || "Projet Sans Nom",
      projectDescription: project.description || "",
      sections: branding.sections,
      sectionDisplayOrder: [
        "Brand Header",
        "Logo System",
        "Color Palette",
        "Typography",
        // "Usage Guidelines",
        "Brand Footer",
      ],
      footerText: "Generated by Idem",
    });
  }

}
