import { LLMProvider, PromptConfig, PromptService } from "../prompt.service";
import { ProjectModel } from "../../models/project.model";
import logger from "../../config/logger";
import { BusinessPlanModel } from "../../models/businessPlan.model";
import {
  GenericService,
  IPromptStep,
  ISectionResult,
} from "../common/generic.service";
import { SectionModel } from "../../models/section.model";
import { PdfService } from "../pdf.service";
import { GLOBAL_CSS_PROMPT } from "./prompts/07_global-css-section.prompt";
import { AGENT_COVER_PROMPT } from "./prompts/agent-cover.prompt";
import { AGENT_COMPANY_SUMMARY_PROMPT } from "./prompts/agent-company-summary.prompt";
import { AGENT_OPPORTUNITY_PROMPT } from "./prompts/agent-opportunity.prompt";
import { AGENT_TARGET_AUDIENCE_PROMPT } from "./prompts/agent-target-audience.prompt";
import { AGENT_PRODUCTS_SERVICES_PROMPT } from "./prompts/agent-products-services.prompt";
import { AGENT_MARKETING_SALES_PROMPT } from "./prompts/agent-marketing-sales.prompt";
import { AGENT_FINANCIAL_PLAN_PROMPT } from "./prompts/agent-financial-plan.prompt";
import { AGENT_GOAL_PLANNING_PROMPT } from "./prompts/agent-goal-planning.prompt";
import { AGENT_APPENDIX_PROMPT } from "./prompts/agent-appendix.prompt";

export class BusinessPlanService extends GenericService {
  private pdfService: PdfService;

  constructor(promptService: PromptService) {
    super(promptService);
    this.pdfService = new PdfService();
    logger.info("BusinessPlanService initialized.");
  }

  async generateBusinessPlanWithStreaming(
    userId: string,
    projectId: string,
    streamCallback?: (sectionResult: ISectionResult) => Promise<void>
  ): Promise<ProjectModel | null> {
    logger.info(
      `Generating business plan with streaming for userId: ${userId}, projectId: ${projectId}`
    );

    // Get project
    const project = await this.getProject(projectId, userId);
    if (!project) {
      return null;
    }

    // Extract branding information
    const brandName = project.name || "Startup";
    const logoSvg = project.analysisResultModel?.branding?.logo?.svg || "";
    const brandColors = project.analysisResultModel?.branding?.colors || {
      primary: "#007bff",
      secondary: "#6c757d",
    };
    const typography = project.analysisResultModel?.branding?.typography || {
      primary: "Arial, sans-serif",
    };
    const language = "fr";

    // Create brand context for all agents
    const brandContext = `Brand: ${brandName}\nLogo SVG: ${logoSvg}\nBrand Colors: ${JSON.stringify(
      brandColors
    )}\nTypography: ${JSON.stringify(typography)}\nLanguage: ${language}`;
    const projectDescription = this.extractProjectDescription(project);
    try {
      // Define business plan steps with specialized agents
      const steps: IPromptStep[] = [
        {
          promptConstant: GLOBAL_CSS_PROMPT,
          stepName: "Global CSS",
          hasDependencies: false,
        },
        {
          promptConstant: `${projectDescription}\n${AGENT_COVER_PROMPT}\n\nBRAND CONTEXT:\n${brandContext}`,
          stepName: "Cover Page",
          hasDependencies: false,
        },
        {
          promptConstant: `${projectDescription}\n${AGENT_COMPANY_SUMMARY_PROMPT}\n\nBRAND CONTEXT:\n${brandContext}`,
          stepName: "Company Summary",
          hasDependencies: false,
        },
        {
          promptConstant: `${projectDescription}\n${AGENT_OPPORTUNITY_PROMPT}\n\nBRAND CONTEXT:\n${brandContext}`,
          stepName: "Opportunity",
          hasDependencies: false,
        },
        {
          promptConstant: `${projectDescription}\n${AGENT_TARGET_AUDIENCE_PROMPT}\n\nBRAND CONTEXT:\n${brandContext}`,
          stepName: "Target Audience",
          hasDependencies: false,
        },
      ];
      const promptConfig: PromptConfig = {
        provider: LLMProvider.GEMINI,
        modelName: "gemini-2.5-flash",
      };

      // Initialize empty sections array to collect results as they come in
      let sectionResults: SectionModel[] = [];

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
              sectionResults.push(section);
            }

            // Call the provided callback
            await streamCallback(result);
          },
          promptConfig,
          "business_plan",
          userId
        );
      } else {
        // Fallback to non-streaming processing
        const stepResults = await this.processSteps(
          steps,
          project,
          promptConfig
        );
        sectionResults = stepResults.map((result) => ({
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
          `Original project not found with ID: ${projectId} for user: ${userId} before updating with business plan.`
        );
        return null;
      }

      // Create the new project with updated business plan
      const newProject = {
        ...oldProject,
        analysisResultModel: {
          ...oldProject.analysisResultModel,
          businessPlan: {
            sections: sectionResults,
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
          `Successfully updated project with ID: ${projectId} with business plan`
        );
      }
      return updatedProject;
    } catch (error) {
      logger.error(
        `Error generating business plan for projectId ${projectId}:`,
        error
      );
      throw error;
    } finally {
      logger.info(
        `Completed business plan generation for projectId ${projectId}`
      );
    }
  }

  async getBusinessPlansByProjectId(
    userId: string,
    projectId: string
  ): Promise<BusinessPlanModel | null> {
    logger.info(
      `Fetching business plan for projectId: ${projectId}, userId: ${userId}`
    );
    const project = await this.projectRepository.findById(
      projectId,
      `users/${userId}/projects`
    );
    console.log("project", project);
    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId} when fetching business plan.`
      );
      return null;
    }
    logger.info(
      `Successfully fetched business plan for projectId: ${projectId}`
    );

    return project.analysisResultModel.businessPlan!;
  }

  async updateBusinessPlan(
    userId: string,
    itemId: string,
    data: Partial<
      Omit<ProjectModel, "id" | "projectId" | "createdAt" | "updatedAt">
    >
  ): Promise<BusinessPlanModel | null> {
    logger.info(
      `Attempting to update business plan for itemId: ${itemId}, userId: ${userId}`
    );
    try {
      const project = await this.projectRepository.findById(
        itemId,
        `users/${userId}/projects`
      );
      if (!project) {
        logger.warn(
          `Project not found with ID: ${itemId} for user: ${userId} when attempting to update business plan.`
        );
        return null;
      }

      const updatedProject = await this.projectRepository.update(
        itemId,
        data,
        userId
      );
      if (!updatedProject) {
        logger.warn(
          `Failed to update project or extract business plan for itemId: ${itemId}`
        );
        return null;
      }
      logger.info(`Successfully updated business plan for itemId: ${itemId}`);
      return updatedProject.analysisResultModel.businessPlan!;
    } catch (error: any) {
      logger.error(
        `Error updating business plan for itemId ${itemId}: ${error.message}`,
        { stack: error.stack, userId }
      );
      throw error; // Or return null depending on desired error handling
    }
  }

  async deleteBusinessPlan(userId: string, itemId: string): Promise<void> {
    logger.info(
      `Attempting to delete business plan for itemId: ${itemId}, userId: ${userId}`
    );
    try {
      const project = await this.projectRepository.findById(
        itemId,
        `users/${userId}/projects`
      );
      if (!project) {
        logger.warn(
          `Project not found with ID: ${itemId} for user: ${userId} when attempting to delete business plan.`
        );
        return;
      }
      project.analysisResultModel.businessPlan = undefined;
      await this.projectRepository.update(itemId, project, userId);
      logger.info(`Successfully deleted business plan for itemId: ${itemId}`);
    } catch (error: any) {
      logger.error(
        `Error deleting business plan for itemId ${itemId}: ${error.message}`,
        { stack: error.stack, userId }
      );
      throw error; // Or return depending on desired error handling
    }
  }

  /**
   * Génère un PDF à partir des sections de business plan d'un projet
   * @param userId - ID de l'utilisateur
   * @param projectId - ID du projet
   * @returns Chemin vers le fichier PDF temporaire généré
   */
  async generateBusinessPlanPdf(
    userId: string,
    projectId: string
  ): Promise<string> {
    logger.info(
      `Generating PDF for business plan sections - projectId: ${projectId}, userId: ${userId}`
    );

    // Récupérer le projet et ses données de business plan
    const project = await this.projectRepository.findById(
      projectId,
      `users/${userId}/projects`
    );

    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId} when generating business plan PDF.`
      );
      throw new Error(`Project not found with ID: ${projectId}`);
    }

    const businessPlan = project.analysisResultModel.businessPlan;
    if (!businessPlan || !businessPlan.sections || businessPlan.sections.length === 0) {
      logger.warn(
        `No business plan sections found for project ${projectId} when generating PDF.`
      );
      throw new Error(`No business plan sections found for project ${projectId}`);
    }

    // Utiliser le PdfService pour générer le PDF
    return await this.pdfService.generatePdf({
      title: "Business Plan",
      projectName: project.name || "Projet Sans Nom",
      projectDescription: project.description || "",
      sections: businessPlan.sections,
      sectionDisplayOrder: [
        "Global CSS",
        "Cover Page",
        "Company Summary",
        "Opportunity",
        "Target Audience",
        "Products Services",
        "Marketing Sales",
        "Financial Plan",
        "Goal Planning",
        "Appendix",
      ],
      footerText: "Generated by Idem",
    });
  }
}
