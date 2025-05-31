import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { TargetModelType } from "../../enums/targetModelType.enum";
import { LLMProvider, PromptService } from "../prompt.service";
import { FAISABILITY_PROMPT } from "./prompts/01_faisability.prompt";
import { ProjectModel } from "../../models/project.model";
import { RISK_ANALYSIS_PROMPT } from "./prompts/02_risk-analylsis.prompt";
import { REQUIREMENTS_PROMPT } from "./prompts/04_requirements.prompt";
import { SMART_OBJECTIVES_PROMPT } from "./prompts/03_smart-objectives.prompt";
import { STAKEHOLDER_MEETINGS_PROMPT } from "./prompts/05_stakeholder-meetings.model";
import { USE_CASE_MODELING_PROMPT } from "./prompts/06_use-case-modeling.prompt";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";
import logger from "../../config/logger";
import { BusinessPlanModel } from "../../models/businessPlan.model";
import { PROJECT_DESCRIPTION_PROMPT } from "./prompts/00_projectDescription.prompt";

export class BusinessPlanService {
  private projectRepository: IRepository<ProjectModel>;

  constructor(private promptService: PromptService) {
    logger.info("BusinessPlanService initialized.");
    this.projectRepository = RepositoryFactory.getRepository<ProjectModel>(
      TargetModelType.PROJECT
    );
  }

  async generateBusinessPlan(
    userId: string,
    projectId: string
  ): Promise<ProjectModel | null> {
    logger.info(
      `Generating business plan for userId: ${userId}, projectId: ${projectId}`
    );
    const tempFileName = `business_plan_context_${projectId}_${Date.now()}.txt`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    const project = await this.projectRepository.findById(projectId, userId);
    logger.debug(
      `Project data fetched for business plan generation: ${
        project ? JSON.stringify(project.id) : "null"
      }`
    );
    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId} during business plan generation.`
      );
      return null;
    }

    try {
      await fs.writeFile(tempFilePath, "", "utf-8");
      logger.info(
        `Temporary file created for business plan generation: ${tempFilePath}`
      );

      const runStepAndAppend = async (
        promptConstant: string,
        stepName: string
      ) => {
        logger.info(
          `Generating section: '${stepName}' for projectId: ${projectId}`
        );
        let currentStepPrompt = `You are generating a business plan section by section.
          The previously generated sections of the business plan are available in the attached text file.
          Please review the attached file for context.

          CURRENT TASK: Generate the '${stepName}' section.

          PROJECT DETAILS (from input 'data' object):
${JSON.stringify(project, null, 2)}

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
        logger.debug(`LLM response for section '${stepName}': ${response}`);
        const stepSpecificContent = this.promptService.getCleanAIText(response);
        logger.info(
          `Successfully generated and processed section: '${stepName}' for projectId: ${projectId}`
        );

        const sectionOutputToFile = `\n\n## ${stepName}\n\n${stepSpecificContent}\n\n---\n`;
        await fs.appendFile(tempFilePath, sectionOutputToFile, "utf-8");
        logger.info(
          `Appended section '${stepName}' to temporary file: ${tempFilePath}`
        );
        return stepSpecificContent;
      };

      const completeDescription = await runStepAndAppend(
        PROJECT_DESCRIPTION_PROMPT,
        "Project Description"
      );

      const faisbilityResponseContent = await runStepAndAppend(
        FAISABILITY_PROMPT,
        "Feasibility Study"
      );
      const riskanalysisResponseContent = await runStepAndAppend(
        RISK_ANALYSIS_PROMPT,
        "Risk Analysis"
      );
      const smartObjectivesResponseContent = await runStepAndAppend(
        SMART_OBJECTIVES_PROMPT,
        "SMART Objectives"
      );
      const detailedRequirementsResponseContent = await runStepAndAppend(
        REQUIREMENTS_PROMPT,
        "Detailed Requirements"
      );
      const stakeholdersMeetingResponseContent = await runStepAndAppend(
        STAKEHOLDER_MEETINGS_PROMPT,
        "Stakeholder Meeting Plan"
      );
      const useCaseModelingResponseContent = await runStepAndAppend(
        USE_CASE_MODELING_PROMPT,
        "Use Case Modeling"
      );

      const oldProject = await this.projectRepository.findById(
        projectId,
        userId
      );
      if (!oldProject) {
        logger.warn(
          `Original project not found with ID: ${projectId} for user: ${userId} before updating with business plan.`
        );
        return null;
      }
      const newProject = {
        ...oldProject,
        analysisResultModel: {
          ...oldProject.analysisResultModel,
          businessPlan: {
            sections: [
              {
                name: "Feasibility Study",
                type: "text/markdown",
                data: faisbilityResponseContent,
                summary: "Feasibility Study for Business Plan",
              },
              {
                name: "Risk Analysis",
                type: "text/markdown",
                data: riskanalysisResponseContent,
                summary: "Risk Analysis for Business Plan",
              },
              {
                name: "SMART Objectives",
                type: "text/markdown",
                data: smartObjectivesResponseContent,
                summary: "SMART Objectives for Business Plan",
              },
              {
                name: "Detailed Requirements",
                type: "text/markdown",
                data: detailedRequirementsResponseContent,
                summary: "Detailed Requirements for Business Plan",
              },
              {
                name: "Stakeholder Meeting Plan",
                type: "text/markdown",
                data: stakeholdersMeetingResponseContent,
                summary: "Stakeholder Meeting Plan for Business Plan",
              },
              {
                name: "Use Case Modeling",
                type: "text/markdown",
                data: useCaseModelingResponseContent,
                summary: "Use Case Modeling for Business Plan",
              },
              {
                name: "Project Description",
                type: "text/markdown",
                data: completeDescription,
                summary: "Project Description for Business Plan",
              },
            ],
          },
        },
      };

      const updatedProject = await this.projectRepository.update(
        projectId,
        newProject,
        userId
      );
      logger.info(
        `Successfully generated and updated business plan for projectId: ${projectId}`
      );
      return updatedProject;
    } catch (error) {
      logger.error(
        `Error generating business plan for projectId ${projectId}:`,
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
