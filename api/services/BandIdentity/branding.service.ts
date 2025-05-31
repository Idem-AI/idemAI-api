import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { TargetModelType } from "../../enums/targetModelType.enum";
import { BrandIdentityModel } from "../../models/brand-identity.model";
import { ProjectModel } from "../../models/project.model";
import { PromptService, LLMProvider } from "../prompt.service";
import { LogoModel } from "../../models/logo.model";
import { LandingModel } from "../../models/landing.model";
import { LOGO_GENERATION_PROMPT } from "./prompts/00_logo-generation-section.prompt";
import { COLOR_PALETTE_SECTION_PROMPT } from "./prompts/02_color-palette-section.prompt";
import { TYPOGRAPHY_SECTION_PROMPT } from "./prompts/03_typography-section.prompt";
import { USAGE_GUIDELINES_SECTION_PROMPT } from "./prompts/04_usage-guidelines-section.prompt";
import { VISUAL_EXAMPLES_SECTION_PROMPT } from "./prompts/05_visual-examples-section.prompt";
import { GLOBAL_CSS_PROMPT } from "./prompts/06_global-css-section.prompt";
import { VISUAL_IDENTITY_SYNTHESIZER_PROMPT } from "./prompts/07_visual-identity-synthesizer-section.prompt";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";
import logger from "../../config/logger";
import { SectionModel } from "../../models/section.model";

export class BrandingService {
  private projectRepository: IRepository<ProjectModel>;

  constructor(private promptService: PromptService) {
    logger.info("BrandingService initialized");
    this.projectRepository = RepositoryFactory.getRepository<ProjectModel>(
      TargetModelType.PROJECT
    );
  }

  async generateBranding(
    userId: string,
    projectId: string
  ): Promise<ProjectModel | null> {
    logger.info(
      `Generating branding for userId: ${userId}, projectId: ${projectId}`
    );
    const tempFileName = `branding_context_${projectId}_${Date.now()}.txt`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    const project = await this.projectRepository.findById(projectId, userId);
    logger.debug(
      `Project data fetched for branding generation: ${
        project ? JSON.stringify(project.id) : "null"
      }`
    );
    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId} during branding generation.`
      );
      return null;
    }

    // Check if business plan exists to extract project description
    let projectDescription = "";
    if (project.analysisResultModel?.businessPlan?.sections) {
      const descriptionSection =
        project.analysisResultModel.businessPlan.sections.find(
          (section) => section.name === "Project Description"
        );
      if (descriptionSection) {
        projectDescription = descriptionSection.data;
        logger.info(
          `Found project description in business plan for projectId: ${projectId}`
        );
      }
    }

    try {
      await fs.writeFile(tempFilePath, "", "utf-8");
      logger.info(
        `Temporary file created for branding generation: ${tempFilePath}`
      );

      // If we have project description, add it to context file
      if (projectDescription) {
        const descriptionContext = `## Project Description\n\n${projectDescription}\n\n---\n`;
        await fs.appendFile(tempFilePath, descriptionContext, "utf-8");
        logger.info(
          `Added project description from business plan to branding context file`
        );
      }

      const runStepAndAppend = async (
        promptConstant: string,
        stepName: string,
        includeProjectInfo = true
      ) => {
        logger.info(
          `Generating branding section: '${stepName}' for projectId: ${projectId}`
        );

        let currentStepPrompt = `You are generating brand identity materials section by section.
        The previously generated content is available in the attached text file.
        Please review the attached file for context.

        CURRENT TASK: Generate the '${stepName}' section.

        ${
          includeProjectInfo
            ? `PROJECT DETAILS (from input 'data' object):
${JSON.stringify(project, null, 2)}`
            : ""
        }

        SPECIFIC INSTRUCTIONS FOR '${stepName}':
${promptConstant}

        Please generate *only* the content for the '${stepName}' section,
        building upon the context from the attached file.`;

        const response = await this.promptService.runPrompt({
          provider: LLMProvider.GEMINI,
          modelName: "gemini-2.0-flash-exp",
          messages: [
            {
              role: "user",
              content: currentStepPrompt,
            },
          ],
          file: { localPath: tempFilePath, mimeType: "text/plain" },
        });

        logger.debug(
          `LLM response for branding section '${stepName}': ${response}`
        );
        const stepSpecificContent = this.promptService.getCleanAIText(response);
        logger.info(
          `Successfully generated and processed branding section: '${stepName}' for projectId: ${projectId}`
        );

        const sectionOutputToFile = `\n\n## ${stepName}\n\n${stepSpecificContent}\n\n---\n`;
        await fs.appendFile(tempFilePath, sectionOutputToFile, "utf-8");
        logger.info(
          `Appended branding section '${stepName}' to temporary file: ${tempFilePath}`
        );

        return stepSpecificContent;
      };

      // Generate each branding section sequentially
      // 1. Logo Design
      const logoResponseContent = await runStepAndAppend(
        LOGO_GENERATION_PROMPT,
        "Logo Design"
      );

      // 3. Color Palette
      const colorPaletteResponseContent = await runStepAndAppend(
        COLOR_PALETTE_SECTION_PROMPT,
        "Color Palette"
      );

      // 4. Typography System
      const typographyResponseContent = await runStepAndAppend(
        TYPOGRAPHY_SECTION_PROMPT,
        "Typography System"
      );

      // 5. Usage Guidelines
      const usageGuidelinesResponseContent = await runStepAndAppend(
        USAGE_GUIDELINES_SECTION_PROMPT,
        "Usage Guidelines"
      );

      // 6. Visual Examples
      const visualExamplesResponseContent = await runStepAndAppend(
        VISUAL_EXAMPLES_SECTION_PROMPT,
        "Visual Examples"
      );

      // 7. Global CSS
      const globalCssResponseContent = await runStepAndAppend(
        GLOBAL_CSS_PROMPT,
        "Global CSS"
      );

      // 8. Visual Identity Synthesis
      const visualIdentitySynthesisResponseContent = await runStepAndAppend(
        VISUAL_IDENTITY_SYNTHESIZER_PROMPT,
        "Visual Identity Synthesis"
      );

      // Parse the JSON responses for each section
      // 1. Logo
      let parsedLogoContent: any = {};
      try {
        parsedLogoContent = JSON.parse(logoResponseContent);
        // Ensure the parsed content has all required fields
        if (!parsedLogoContent.svg)
          parsedLogoContent.svg = "<svg>Fallback SVG</svg>";
        if (!parsedLogoContent.concept)
          parsedLogoContent.concept = "Minimalist design concept";
        if (!Array.isArray(parsedLogoContent.colors))
          parsedLogoContent.colors = ["#000000", "#ffffff"];
        if (!Array.isArray(parsedLogoContent.fonts))
          parsedLogoContent.fonts = ["Arial", "Helvetica"];
        logger.info(
          `Successfully parsed logo JSON data for projectId: ${projectId}`
        );
      } catch (error) {
        logger.error(
          `Error parsing logo content for project ${projectId}:`,
          error
        );
        parsedLogoContent = {
          svg: "<svg>Fallback SVG</svg>",
          concept: "Minimalist design concept",
          colors: ["#000000", "#ffffff"],
          fonts: ["Arial", "Helvetica"],
        };
      }

      // Helper function to parse section content
      const parseSection = (content: string, sectionName: string): any => {
        try {
          const parsed = JSON.parse(content);
          logger.info(
            `Successfully parsed ${sectionName} for projectId: ${projectId}`
          );
          return parsed;
        } catch (error) {
          logger.error(
            `Error parsing ${sectionName} for project ${projectId}:`,
            error
          );
          // Return a fallback structure with the raw content
          return {
            content: content,
            summary: `Error parsing ${sectionName}`,
          };
        }
      };

      // 3. Color Palette
      const colorPaletteData = parseSection(
        colorPaletteResponseContent,
        "Color Palette"
      );

      // 4. Typography
      const typographyData = parseSection(
        typographyResponseContent,
        "Typography"
      );

      // 5. Usage Guidelines
      const usageGuidelinesData = parseSection(
        usageGuidelinesResponseContent,
        "Usage Guidelines"
      );

      // 6. Visual Examples
      const visualExamplesData = parseSection(
        visualExamplesResponseContent,
        "Visual Examples"
      );

      // 7. Global CSS
      const globalCssData = parseSection(
        globalCssResponseContent,
        "Global CSS"
      );

      // 8. Visual Identity Synthesis
      const visualIdentitySynthesisData = parseSection(
        visualIdentitySynthesisResponseContent,
        "Visual Identity Synthesis"
      );

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
      brandIdentitySections.push(
        createSection("Color Palette", colorPaletteData)
      );
      brandIdentitySections.push(createSection("Typography", typographyData));
      brandIdentitySections.push(
        createSection("Usage Guidelines", usageGuidelinesData)
      );
      brandIdentitySections.push(
        createSection("Visual Examples", visualExamplesData)
      );
      brandIdentitySections.push(createSection("Global CSS", globalCssData));
      brandIdentitySections.push(
        createSection("Visual Identity", visualIdentitySynthesisData)
      );

      // Update the project with the new branding data
      const newProject: Partial<ProjectModel> = {
        ...project,
        analysisResultModel: {
          ...project.analysisResultModel,
          branding: {
            logo: {
              content: parsedLogoContent,
              summary: "Generated logo",
            },
            brandIdentity: brandIdentitySections,
          },
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
        logger.info(`Attempting to remove temporary file: ${tempFilePath}`);
        if (await fs.pathExists(tempFilePath)) {
          await fs.remove(tempFilePath);
          logger.info(`Successfully removed temporary file: ${tempFilePath}`);
        }
      } catch (cleanupError) {
        logger.error(
          `Error removing temporary file ${tempFilePath}:`,
          cleanupError
        );
      }
    }
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

    // Create a default structure for the analysis result model's branding field if not exists
    if (!project.analysisResultModel) {
      project.analysisResultModel = {
        id: undefined,
        architectures: [],
        businessPlan: undefined,
        design: [], // Changed from diagrams to match the model
        development: "", // Empty string instead of undefined
        branding: {
          logo: {
            content: {
              svg: "",
              concept: "",
              colors: [],
              fonts: [],
            },
            summary: "",
          },
          brandIdentity: [],
        },
        landing: {} as LandingModel, // Empty object cast as LandingModel
        testing: "", // Empty string instead of undefined
        createdAt: new Date(),
      };
    } else if (!project.analysisResultModel.branding) {
      project.analysisResultModel.branding = {
        logo: {
          content: {
            svg: "",
            concept: "",
            colors: [],
            fonts: [],
          },
          summary: "",
        },
        brandIdentity: [],
      };
    }

    // Reset branding to empty state rather than removing it completely
    const updatedProject = {
      ...project,
      analysisResultModel: {
        ...project.analysisResultModel,
        branding: {
          logo: {
            content: {
              svg: "",
              concept: "",
              colors: [],
              fonts: [],
            },
            summary: "",
          },
          brandIdentity: [],
        },
      },
    };

    await this.projectRepository.update(projectId, updatedProject, userId);
    logger.info(`Successfully reset branding for projectId: ${projectId}`);
    return true;
  }
}
