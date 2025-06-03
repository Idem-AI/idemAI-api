import { PromptService } from "../prompt.service";
import { FAISABILITY_PROMPT } from "./prompts/01_faisability.prompt";
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

    // Initialize temp file
    await this.initTempFile(projectId, "business_plan");

    // Get project
    const project = await this.getProject(projectId, userId);
    if (!project) {
      return null;
    }

    try {
      // Define business plan steps
      const steps: IPromptStep[] = [
        {
          promptConstant: PROJECT_DESCRIPTION_PROMPT,
          stepName: "Project Description",
        },
        {
          promptConstant: FAISABILITY_PROMPT,
          stepName: "Feasibility Study",
        },
        {
          promptConstant: RISK_ANALYSIS_PROMPT,
          stepName: "Risk Analysis",
        },
        {
          promptConstant: SMART_OBJECTIVES_PROMPT,
          stepName: "SMART Objectives",
        },
        {
          promptConstant: REQUIREMENTS_PROMPT,
          stepName: "Detailed Requirements",
        },
        {
          promptConstant: STAKEHOLDER_MEETINGS_PROMPT,
          stepName: "Stakeholder Meeting Plan",
        },
        {
          promptConstant: USE_CASE_MODELING_PROMPT,
          stepName: "Use Case Modeling",
        },
      ];

      // Process all steps and get results
      const sectionResults = await this.processSteps(steps, project);

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

  async getBusinessPlansByProjectId(
    userId: string,
    projectId: string
  ): Promise<BusinessPlanModel | null> {
    logger.info(
      `Fetching business plan for projectId: ${projectId}, userId: ${userId}`
    );
    const project = await this.projectRepository.findById(projectId, userId);
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
      const project = await this.projectRepository.findById(itemId, userId);
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
      const project = await this.projectRepository.findById(itemId, userId);
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
