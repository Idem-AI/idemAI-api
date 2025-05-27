import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { TargetModelType } from "../../enums/targetModelType.enum"; // Assumes BUSINESS_PLAN will be added
import { BusinessPlanModel } from "../../models/businessPlan.model";

export class BusinessPlanService {
  private repository: IRepository<BusinessPlanModel>;

  constructor() {
    // Using a new TargetModelType.BUSINESS_PLAN which should map to 'businessPlans' collection
    this.repository = RepositoryFactory.getRepository<BusinessPlanModel>(
      TargetModelType.BUSINESS_PLAN // IMPORTANT: This enum member needs to be added
    );
  }

  async generateBusinessPlan(
    userId: string,
    projectId: string,
    data: Omit<
      BusinessPlanModel,
      "id" | "createdAt" | "updatedAt" | "projectId"
    >
  ): Promise<BusinessPlanModel> {
    const newItemData: Omit<
      BusinessPlanModel,
      "id" | "createdAt" | "updatedAt"
    > = {
      projectId,
      ...data,
    };
    return this.repository.create(newItemData, userId);
  }

  async getBusinessPlansByProjectId(
    userId: string,
    projectId: string
  ): Promise<BusinessPlanModel[]> {
    const allItems = await this.repository.findAll(userId);
    return allItems.filter(
      (item: BusinessPlanModel) => item.projectId === projectId
    );
  }

  async getBusinessPlanById(
    userId: string,
    itemId: string
  ): Promise<BusinessPlanModel | null> {
    return this.repository.findById(itemId, userId);
  }

  async updateBusinessPlan(
    userId: string,
    itemId: string,
    data: Partial<
      Omit<BusinessPlanModel, "id" | "projectId" | "createdAt" | "updatedAt">
    >
  ): Promise<BusinessPlanModel | null> {
    const updatePayload: Partial<
      Omit<BusinessPlanModel, "id" | "createdAt" | "updatedAt">
    > = data;
    return this.repository.update(itemId, updatePayload, userId);
  }

  async deleteBusinessPlan(userId: string, itemId: string): Promise<void> {
    await this.repository.delete(itemId, userId);
  }
}
