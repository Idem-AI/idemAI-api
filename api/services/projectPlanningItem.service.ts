import { IRepository } from '../repository/IRepository';
import { RepositoryFactory } from '../repository/RepositoryFactory';
import { ProjectPlanningItemModel } from '../models/projectPlanningItem.model';
import { TargetModelType } from '../enums/targetModelType.enum';

export class ProjectPlanningItemService {
  private repository: IRepository<ProjectPlanningItemModel>;

  constructor() {
    // Using TargetModelType.PLANNING which should map to 'plannings' collection
    this.repository = RepositoryFactory.getRepository<ProjectPlanningItemModel>(TargetModelType.PLANNING);
  }

  async generatePlanningItem(userId: string, projectId: string, data: Omit<ProjectPlanningItemModel, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>): Promise<ProjectPlanningItemModel> {
    const newItemData: Omit<ProjectPlanningItemModel, 'id' | 'createdAt' | 'updatedAt'> = {
      projectId,
      ...data,
    };
    return this.repository.create(newItemData, userId);
  }

  async getPlanningItemsByProjectId(userId: string, projectId: string): Promise<ProjectPlanningItemModel[]> {
    const allItems = await this.repository.findAll(userId);
    return allItems.filter((item: ProjectPlanningItemModel) => item.projectId === projectId);
  }

  async getPlanningItemById(userId: string, itemId: string): Promise<ProjectPlanningItemModel | null> {
    return this.repository.findById(itemId, userId);
  }

  async updatePlanningItem(userId: string, itemId: string, data: Partial<Omit<ProjectPlanningItemModel, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>): Promise<ProjectPlanningItemModel | null> {
    const updatePayload: Partial<Omit<ProjectPlanningItemModel, 'id' | 'createdAt' | 'updatedAt'>> = data;
    return this.repository.update(itemId, updatePayload, userId);
  }

  async deletePlanningItem(userId: string, itemId: string): Promise<void> {
    await this.repository.delete(itemId, userId);
  }
}
