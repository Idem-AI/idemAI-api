import { LLMProvider, PromptConfig, PromptService } from "../prompt.service";
import { FEASABILITY_PROMPT } from "./prompts/01_faisability.prompt";
import { ProjectModel } from "../../models/project.model";
import { RISK_ANALYSIS_PROMPT } from "./prompts/02_risk-analylsis.prompt";
import { REQUIREMENTS_PROMPT } from "./prompts/04_requirements.prompt";
import { SMART_OBJECTIVES_PROMPT } from "./prompts/03_smart-objectives.prompt";
import { STAKEHOLDER_MEETINGS_PROMPT } from "./prompts/05_stakeholder-meetings.model";
import { USE_CASE_MODELING_PROMPT } from "./prompts/06_use-case-modeling.prompt";
import logger from "../../config/logger";
import { BusinessPlanModel } from "../../models/businessPlan.model";
import { PROJECT_DESCRIPTION_PROMPT } from "./prompts/00_projectDescription.prompt";
import { GenericService, IPromptStep } from "../common/generic.service";
import { SectionModel } from "../../models/section.model";
import { GLOBAL_CSS_PROMPT } from "./prompts/07_global-css-section.prompt";

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
    const projectDescription = this.extractProjectDescription(project);
    try {
      // Define business plan steps
      const steps: IPromptStep[] = [
        {
          promptConstant: projectDescription + PROJECT_DESCRIPTION_PROMPT,
          stepName: "Project Description",
          hasDependencies: false,
        },

        {
          promptConstant: FEASABILITY_PROMPT,
          stepName: "Feasibility Study",
          requiresSteps: ["Project Description"],
        },
        {
          promptConstant: RISK_ANALYSIS_PROMPT,
          stepName: "Risk Analysis",
          requiresSteps: ["Project Description"],
        },
        {
          promptConstant: SMART_OBJECTIVES_PROMPT,
          stepName: "SMART Objectives",
          requiresSteps: ["Project Description"],
        },
        {
          promptConstant: REQUIREMENTS_PROMPT,
          stepName: "Detailed Requirements",
          requiresSteps: ["Project Description"],
        },
        {
          promptConstant: STAKEHOLDER_MEETINGS_PROMPT,
          stepName: "Stakeholder Meeting Plan",
          requiresSteps: ["Project Description"],
        },
        {
          promptConstant: USE_CASE_MODELING_PROMPT,
          stepName: "Use Case Modeling",
          requiresSteps: ["Project Description"],
        },
        {
          promptConstant: GLOBAL_CSS_PROMPT,
          stepName: "Global CSS",
          hasDependencies: false,
        },
      ];
      const promptConfig: PromptConfig = {
        provider: LLMProvider.CHATGPT,
        modelName: "gpt-4o",
        llmOptions: {
          temperature: 0.2,
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
