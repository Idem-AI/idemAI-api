import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { TargetModelType } from "../../enums/targetModelType.enum";
import { BrandIdentityModel } from "../../models/brand-identity.model";
import { ProjectModel } from "../../models/project.model";
import { PromptService, LLMProvider } from "../prompt.service";
import { LogoModel } from "../../models/logo.model";
import { LandingModel } from "../../models/landing.model";
import { LOGO_GENERATION_PROMPT } from "./prompts/00_logo-generation-section.prompt";
import { BRAND_IDENTITY_SECTION_PROMPT } from "./prompts/01_brand-identity-section.prompt";
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

      // Generate logo first
      const logoResponseContent = await runStepAndAppend(
        LOGO_GENERATION_PROMPT,
        "Logo Design"
      );

      // Then generate brand identity sections
      const brandIdentityResponseContent = await runStepAndAppend(
        BRAND_IDENTITY_SECTION_PROMPT,
        "Brand Identity"
      );

      // Parse the JSON responses
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

      let brandIdentityData: any = {};

      try {
        brandIdentityData = JSON.parse(brandIdentityResponseContent);
        logger.info(
          `Successfully parsed brand identity JSON data for projectId: ${projectId}`
        );
      } catch (parseError) {
        logger.error(`Error parsing brand identity JSON data: ${parseError}`);
        brandIdentityData = [];
      }

      // Prepare brand identity sections
      const brandIdentitySections: SectionModel[] = Array.isArray(
        brandIdentityData
      )
        ? brandIdentityData
        : [
            {
              name: "Brand Identity",
              type: "text/markdown",
              data: brandIdentityResponseContent,
              summary: "Brand identity guidelines",
            },
          ];

      const oldProject = await this.projectRepository.findById(
        projectId,
        userId
      );
      if (!oldProject) {
        logger.warn(
          `Original project not found with ID: ${projectId} for user: ${userId} before updating with branding.`
        );
        return null;
      }

      // Update project with new branding
      const newProject = {
        ...oldProject,
        analysisResultModel: {
          ...oldProject.analysisResultModel,
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
