import { ProjectModel } from "../../models/project.model";
import { PromptService } from "../prompt.service";
import {
  BrandIdentityModel,
  ColorModel,
  TypographyModel,
} from "../../models/brand-identity.model";
import { LOGO_GENERATION_PROMPT } from "./prompts/00_logo-generation-section.prompt";
import { COLOR_PALETTE_SECTION_PROMPT } from "./prompts/02_color-palette-section.prompt";
import { TYPOGRAPHY_SECTION_PROMPT } from "./prompts/03_typography-section.prompt";
import { USAGE_GUIDELINES_SECTION_PROMPT } from "./prompts/04_usage-guidelines-section.prompt";
import { VISUAL_EXAMPLES_SECTION_PROMPT } from "./prompts/05_visual-examples-section.prompt";
import { GLOBAL_CSS_PROMPT } from "./prompts/06_global-css-section.prompt";
import { VISUAL_IDENTITY_SYNTHESIZER_PROMPT } from "./prompts/07_visual-identity-synthesizer-section.prompt";
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
    await this.addDescriptionToContext(projectDescription);

    try {
      // Define branding steps
      const steps: IPromptStep[] = [
        {
          promptConstant: USAGE_GUIDELINES_SECTION_PROMPT,
          stepName: "Usage Guidelines",
          modelParser: (content) =>
            this.parseSection(content, "Usage Guidelines", projectId),
        },
        // color palette
        {
          promptConstant: COLOR_PALETTE_SECTION_PROMPT,
          stepName: "Color Palette",
          modelParser: (content) =>
            this.parseSection(content, "Color Palette", projectId),
        },
        // typography
        {
          promptConstant: TYPOGRAPHY_SECTION_PROMPT,
          stepName: "Typography",
          modelParser: (content) =>
            this.parseSection(content, "Typography", projectId),
        },
        {
          promptConstant: VISUAL_EXAMPLES_SECTION_PROMPT,
          stepName: "Visual Examples",
          modelParser: (content) =>
            this.parseSection(content, "Visual Examples", projectId),
        },
        {
          promptConstant: GLOBAL_CSS_PROMPT,
          stepName: "Global CSS",
          modelParser: (content) =>
            this.parseSection(content, "Global CSS", projectId),
        },
        {
          promptConstant: VISUAL_IDENTITY_SYNTHESIZER_PROMPT,
          stepName: "Visual Identity Synthesis",
          modelParser: (content) =>
            this.parseSection(content, "Visual Identity Synthesis", projectId),
        },
      ];

      // Process all steps and get results
      const sectionResults = await this.processSteps(steps, project);

      // Extract the parsed data from results
      const logoResult = sectionResults[0];
      const colorPaletteResult = sectionResults[1];
      const typographyResult = sectionResults[2];
      const usageGuidelinesResult = sectionResults[3];
      const visualExamplesResult = sectionResults[4];
      const globalCssResult = sectionResults[5];
      const visualIdentitySynthesisResult = sectionResults[6];

      const parsedUsageGuidelinesContent = usageGuidelinesResult.parsedData || {
        guidelines: ["Use logo consistently", "Maintain color integrity"],
        explanation: "Standard usage guidelines",
      };

      const parsedVisualExamplesContent = visualExamplesResult.parsedData || {
        examples: ["Business card design", "Website mockup"],
        description: "Standard visual examples",
      };

      const parsedGlobalCssContent = globalCssResult.parsedData || {
        css: "/* Default CSS */\nbody { font-family: Arial; }",
        explanation: "Standard CSS variables",
      };

      const parsedVisualIdentitySynthesisContent =
        visualIdentitySynthesisResult.parsedData || {
          summary: "Standard visual identity",
          recommendations: ["Maintain consistent branding"],
        };

      // Create sections from all branding components
      // Helper function to create a section if data content isn't already in array format
      const createSection = (
        name: string,
        data: any,
        type = "text/html"
      ): SectionModel => {
        return {
          name,
          type,
          data:
            typeof data.content === "string"
              ? data.content
              : JSON.stringify(data.content),
          summary: data.summary || `${name} section`,
        };
      };

      // Prepare all sections for the brand identity
      const brandIdentitySections: SectionModel[] = [];

      // Add other sections
      brandIdentitySections.push(createSection("Typography", typographyResult));
      brandIdentitySections.push(
        createSection("Usage Guidelines", parsedUsageGuidelinesContent)
      );
      brandIdentitySections.push(
        createSection("Visual Examples", parsedVisualExamplesContent)
      );
      brandIdentitySections.push(
        createSection("Global CSS", parsedGlobalCssContent)
      );
      brandIdentitySections.push(
        createSection("Visual Identity", parsedVisualIdentitySynthesisContent)
      );

      // Update the project with the new branding data
      const newProject: Partial<ProjectModel> = {
        ...project,
        analysisResultModel: {
          ...project.analysisResultModel,
        },
      };

      // Update project with new branding data
      const updatedProject = await this.projectRepository.update(
        projectId,
        newProject,
        userId
      );

      logger.info(
        `Successfully generated and updated branding for projectId: ${projectId}`
      );
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
      brandIdentity: [],
    };

    await this.projectRepository.update(projectId, project, userId);
    logger.info(`Successfully reset branding for projectId: ${projectId}`);
    return true;
  }
}
