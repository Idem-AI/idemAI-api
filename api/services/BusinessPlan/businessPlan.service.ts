import { LLMProvider, PromptConfig, PromptService } from "../prompt.service";
import { ProjectModel } from "../../models/project.model";
import logger from "../../config/logger";
import { BusinessPlanModel } from "../../models/businessPlan.model";
import { GenericService, IPromptStep } from "../common/generic.service";
import { SectionModel } from "../../models/section.model";
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
  constructor(promptService: PromptService) {
    super(promptService);
    logger.info("BusinessPlanService initialized.");
  }

  async generateBusinessPlan(
    userId: string,
    projectId: string
  ): Promise<ProjectModel | null> {
    logger.info(
      `Generating business plan for userId: ${userId}, projectId: ${projectId}`
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
        {
          promptConstant: `${projectDescription}\n${AGENT_PRODUCTS_SERVICES_PROMPT}\n\nBRAND CONTEXT:\n${brandContext}`,
          stepName: "Products and Services",
          hasDependencies: false,
        },
        {
          promptConstant: `${projectDescription}\n${AGENT_MARKETING_SALES_PROMPT}\n\nBRAND CONTEXT:\n${brandContext}`,
          stepName: "Marketing and Sales",
          hasDependencies: false,
        },
        {
          promptConstant: `${projectDescription}\n${AGENT_FINANCIAL_PLAN_PROMPT}\n\nBRAND CONTEXT:\n${brandContext}`,
          stepName: "Financial Plan",
          hasDependencies: false,
        },
        {
          promptConstant: `${projectDescription}\n${AGENT_GOAL_PLANNING_PROMPT}\n\nBRAND CONTEXT:\n${brandContext}`,
          stepName: "Goal Planning",
          hasDependencies: false,
        },
        {
          promptConstant: `${projectDescription}\n${AGENT_APPENDIX_PROMPT}\n\nBRAND CONTEXT:\n${brandContext}`,
          stepName: "Appendix",
          hasDependencies: false,
        },
      ];
      const promptConfig: PromptConfig = {
        provider: LLMProvider.CHATGPT,
        modelName: "gpt-4.1-2025-04-14",
        llmOptions: {
          temperature: 0.5,
          maxOutputTokens: 4096,
        },
      };
      // Process all steps and get results
      const sectionResults = await this.processSteps(
        steps,
        project,
        promptConfig
      );

      // Map sections from results
      const sections: SectionModel[] = sectionResults.map((result) => ({
        name: result.name,
        type: result.type,
        data: result.data,
        summary: result.summary,
      }));

      // Update the project with the business plan sections
      const updatedProject = await this.updateProjectWithSections(
        projectId,
        userId,
        "businessPlan",
        sections
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
      // No cleanup needed - in-memory context is automatically garbage collected
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
}
