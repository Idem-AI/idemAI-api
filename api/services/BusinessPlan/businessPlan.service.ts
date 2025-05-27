import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { TargetModelType } from "../../enums/targetModelType.enum"; // Assumes BUSINESS_PLAN will be added
import { LLMProvider, PromptService } from "../prompt.service";
import { FAISABILITY_PROMPT } from "./prompts/01_faisability.prompt";
import { ProjectModel } from "../../models/project.model";
import { BusinessPlanModel } from "../../models/businessPlan.model";

export class BusinessPlanService {
  private projectRepository: IRepository<ProjectModel>;

  constructor(private promptService: PromptService) {
    // Using a new TargetModelType.BUSINESS_PLAN which should map to 'businessPlans' collection
    this.projectRepository = RepositoryFactory.getRepository<ProjectModel>(
      TargetModelType.PROJECT // IMPORTANT: This enum member needs to be added
    );
  }

  async generateBusinessPlan(
    userId: string,
    projectId: string,
    data: Omit<ProjectModel, "id" | "createdAt" | "updatedAt" | "projectId">
  ): Promise<ProjectModel | null> {
    let project = await this.projectRepository.findById(projectId, userId);
    const response = await this.promptService.runPrompt({
      provider: LLMProvider.GEMINI,
      modelName: "gemini-2.0-flash-exp",
      messages: [
        {
          role: "user",
          content: FAISABILITY_PROMPT,
        },
      ],
    });

    const newItemData: Omit<ProjectModel, "id" | "createdAt" | "updatedAt"> = {
      ...data,
    };
    return this.projectRepository.update(projectId, newItemData, userId);
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
