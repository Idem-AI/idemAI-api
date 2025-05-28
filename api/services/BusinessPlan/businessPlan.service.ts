import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { TargetModelType } from "../../enums/targetModelType.enum";
import { LLMProvider, PromptService } from "../prompt.service";
import { FAISABILITY_PROMPT } from "./prompts/01_faisability.prompt";
import { ProjectModel } from "../../models/project.model";
import { BusinessPlanModel } from "../../models/businessPlan.model";
import { RISK_ANALYSIS_PROMPT } from "./prompts/02_risk-analylsis.prompt";
import { REQUIREMENTS_PROMPT } from "./prompts/04_requirements.prompt";
import { SMART_OBJECTIVES_PROMPT } from "./prompts/03_smart-objectives.prompt";
import { STAKEHOLDER_MEETINGS_PROMPT } from "./prompts/05_stakeholder-meetings.model";
import { USE_CASE_MODELING_PROMPT } from "./prompts/06_use-case-modeling.prompt";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";

export class BusinessPlanService {
  private projectRepository: IRepository<ProjectModel>;

  constructor(private promptService: PromptService) {
    this.projectRepository = RepositoryFactory.getRepository<ProjectModel>(
      TargetModelType.PROJECT
    );
  }

  async generateBusinessPlan(
    userId: string,
    projectId: string,
    data: Omit<ProjectModel, "id" | "createdAt" | "updatedAt" | "projectId">
  ): Promise<ProjectModel | null> {
    const tempFileName = `business_plan_context_${projectId}_${Date.now()}.txt`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    try {
      await fs.writeFile(tempFilePath, "", "utf-8");

      const runStepAndAppend = async (
        promptConstant: string,
        stepName: string
      ) => {
        let currentStepPrompt = `You are generating a business plan section by section.
          The previously generated sections of the business plan are available in the attached text file.
          Please review the attached file for context.

          CURRENT TASK: Generate the '${stepName}' section.

          PROJECT DETAILS (from input 'data' object):
${JSON.stringify(data, null, 2)}

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
        const stepSpecificContent = this.promptService.getCleanAIText(response);

        const sectionOutputToFile = `\n\n## ${stepName}\n\n${stepSpecificContent}\n\n---\n`;
        await fs.appendFile(tempFilePath, sectionOutputToFile, "utf-8");
        return stepSpecificContent;
      };

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

      const finalBusinessPlanText = await fs.readFile(tempFilePath, "utf-8");

      const updatePayload: Partial<ProjectModel> = {
        ...(data as Partial<ProjectModel>),
        feasibilityStudy: faisbilityResponseContent,
        riskAnalysis: riskanalysisResponseContent,
        smartObjectives: smartObjectivesResponseContent,
        detailedRequirements: detailedRequirementsResponseContent,
        stakeholderMeetingPlan: stakeholdersMeetingResponseContent,
        useCaseModeling: useCaseModelingResponseContent,
        businessPlanFullText: finalBusinessPlanText,
      };

      return this.projectRepository.update(projectId, updatePayload, userId);
    } catch (error) {
      console.error(
        `Error generating business plan for projectId ${projectId}:`,
        error
      );
      throw error;
    } finally {
      try {
        if (await fs.pathExists(tempFilePath)) {
          await fs.remove(tempFilePath);
        }
      } catch (cleanupError) {
        console.error(
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
    const project = await this.projectRepository.findById(projectId, userId);
    if (!project) {
      return null;
    }
    return project.analysisResultModel.businessPlan!;
  }

  async updateBusinessPlan(
    userId: string,
    itemId: string,
    data: Partial<
      Omit<ProjectModel, "id" | "projectId" | "createdAt" | "updatedAt">
    >
  ): Promise<BusinessPlanModel | null> {
    const project = await this.projectRepository.findById(itemId, userId);
    if (!project) {
      return null;
    }

    const updatedProject = await this.projectRepository.update(
      itemId,
      data,
      userId
    );
    if (!updatedProject) {
      return null;
    }
    return updatedProject.analysisResultModel.businessPlan!;
  }

  async deleteBusinessPlan(userId: string, itemId: string): Promise<void> {
    const project = await this.projectRepository.findById(itemId, userId);
    if (!project) {
      return;
    }
    project.analysisResultModel.businessPlan = undefined;
    await this.projectRepository.update(itemId, project, userId);
  }
}
