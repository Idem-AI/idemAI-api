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
import { GLOBAL_CSS_PROMPT } from "./prompts/06_global-css-section.prompt";
import { BRAND_FOOTER_SECTION_PROMPT } from "./prompts/07_brand-footer-section.prompt";
import logger from "../../config/logger";
import { SectionModel } from "../../models/section.model";
import { GenericService, IPromptStep } from "../common/generic.service";
import { LogoModel } from "../../models/logo.model";
import { COLORS_TYPOGRAPHY_GENERATION_PROMPT } from "./prompts/singleGenerations/colors-typography-generation.prompt";

export class BrandingService extends GenericService {
  constructor(promptService: PromptService) {
    super(promptService);
    logger.info("BrandingService initialized");
  }

  async generateBranding(
    userId: string,
    projectId: string
  ): Promise<ProjectModel | null> {
    logger.info(
      `Generating branding for userId: ${userId}, projectId: ${projectId}`
    );

    // Initialize temp file
    await this.initTempFile(projectId, "branding");

    // Get project
    const project = await this.getProject(projectId, userId);
    if (!project) {
      return null;
    }

    // Extract and add project description to context
    const projectDescription = this.extractProjectDescription(project);
    await this.addDescriptionToContext(
      "Here is the project description: " + projectDescription
    );
    await this.addDescriptionToContext(
      "Here is the project branding: " +
        JSON.stringify(project.analysisResultModel.branding)
    );
    await this.addDescriptionToContext(
      "Here is the project branding colors: " +
        JSON.stringify(project.analysisResultModel.branding.colors)
    );
    await this.addDescriptionToContext(
      "Here is the project branding typography: " +
        JSON.stringify(project.analysisResultModel.branding.typography)
    );
    await this.addDescriptionToContext(
      "Here is the project branding logo: " +
        JSON.stringify(project.analysisResultModel.branding.logo)
    );

    try {
      // Define branding steps
      const steps: IPromptStep[] = [
        {
          promptConstant: BRAND_HEADER_SECTION_PROMPT,
          stepName: "Brand Header",
        },
        {
          promptConstant: LOGO_SYSTEM_SECTION_PROMPT,
          stepName: "Logo System",
        },
        {
          promptConstant: COLOR_PALETTE_SECTION_PROMPT,
          stepName: "Color Palette",
        },
        {
          promptConstant: TYPOGRAPHY_SECTION_PROMPT,
          stepName: "Typography",
        },
        {
          promptConstant: USAGE_GUIDELINES_SECTION_PROMPT,
          stepName: "Usage Guidelines",
        },
        {
          promptConstant: VISUAL_EXAMPLES_SECTION_PROMPT,
          stepName: "Visual Examples",
        },
        {
          promptConstant: BRAND_FOOTER_SECTION_PROMPT,
          stepName: "Brand Footer",
        },
        {
          promptConstant: GLOBAL_CSS_PROMPT,
          stepName: "Global CSS",
        },
      ];

      // Process all steps and get results. Each step's modelParser (this.parseSection) returns a SectionModel.
      // We assume processSteps places the modelParser's output into a 'parsedData' field for each result.
      const stepResults = await this.processSteps(steps, project);

      // Map sections from results
      const sections: SectionModel[] = stepResults.map((result) => ({
        name: result.name,
        type: result.type,
        data: result.data,
        summary: result.summary,
      }));

      // Get the existing project to prepare for update
      const oldProject = await this.projectRepository.findById(
        projectId,
        userId
      );
      if (!oldProject) {
        logger.warn(
          `Original project not found with ID: ${projectId} for user: ${userId} before updating with diagrams.`
        );
        return null;
      }

      // Filter out diagrams that need to be updated
      const existingDiagrams =
        oldProject.analysisResultModel?.branding?.sections || [];
      const updatedDiagrams = [
        ...existingDiagrams.filter(
          (d: SectionModel) => !sections.some((s) => s.name === d.name)
        ),
        ...sections,
      ];

      // Create updated project with new diagram sections
      const newProject = {
        ...oldProject,
        analysisResultModel: {
          ...oldProject.analysisResultModel,
          branding: {
            ...oldProject.analysisResultModel?.branding,
            sections: updatedDiagrams,
            id: `branding_${projectId}_${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      // Update the project in the database
      const updatedProject = await this.projectRepository.update(
        projectId,
        newProject,
        userId
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
      try {
        logger.info(
          `Attempting to remove temporary file: ${this.tempFilePath}`
        );
        // Clean up the temporary file
        await this.cleanup();
      } catch (cleanupError) {
        logger.error(
          `Error removing temporary file ${this.tempFilePath}:`,
          cleanupError
        );
      }
    }
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
    await this.initTempFile(project.id!, "branding");
    if (!project.id) {
      throw new Error(`Project not found with ID: ${project.id}`);
    }

    const projectDescription = this.extractProjectDescription(project);
    await this.addDescriptionToContext(projectDescription);

    const steps: IPromptStep[] = [
      {
        promptConstant: COLORS_TYPOGRAPHY_GENERATION_PROMPT,
        stepName: "Colors and Typography Generation",
        modelParser: (content) =>
          this.parseSection(
            content,
            "Colors and Typography Generation",
            project.id!
          ),
      },
      {
        promptConstant: LOGO_GENERATION_PROMPT,
        stepName: "Logo Generation",
        modelParser: (content) =>
          this.parseSection(content, "Logo Generation", project.id!),
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
    const project = await this.projectRepository.findById(projectId, userId);
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

    const project = await this.projectRepository.findById(projectId, userId);
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
      userId
    );
    logger.info(`Successfully updated branding for projectId: ${projectId}`);
    return result;
  }

  async deleteBranding(userId: string, projectId: string): Promise<boolean> {
    logger.info(
      `Removing branding for userId: ${userId}, projectId: ${projectId}`
    );

    const project = await this.projectRepository.findById(projectId, userId);
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

    await this.projectRepository.update(projectId, project, userId);
    logger.info(`Successfully reset branding for projectId: ${projectId}`);
    return true;
  }
}
