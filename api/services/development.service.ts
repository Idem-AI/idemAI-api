import { IRepository } from '../repository/IRepository';
import { RepositoryFactory } from '../repository/RepositoryFactory';
import { DevelopmentModel } from '../models/development.model';
import { TargetModelType } from '../enums/targetModelType.enum';

export class DevelopmentService {
  private repository: IRepository<DevelopmentModel>;

  constructor() {
    this.repository = RepositoryFactory.getRepository<DevelopmentModel>(TargetModelType.DEVELOPMENT);
  }

  async generateDevelopment(userId: string, projectId: string, data: Omit<DevelopmentModel, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>): Promise<DevelopmentModel> {
    const newDevelopmentData: Omit<DevelopmentModel, 'id' | 'createdAt' | 'updatedAt'> = {
      projectId,
      ...data,
    };
    return this.repository.create(newDevelopmentData, userId);
  }

  async getDevelopmentsByProjectId(userId: string, projectId: string): Promise<DevelopmentModel[]> {
    const allDevelopments = await this.repository.findAll(userId);
    return allDevelopments.filter((dev: DevelopmentModel) => dev.projectId === projectId);
  }

  async getDevelopmentById(userId: string, developmentId: string): Promise<DevelopmentModel | null> {
    return this.repository.findById(developmentId, userId);
  }

  async updateDevelopment(userId: string, developmentId: string, data: Partial<Omit<DevelopmentModel, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>): Promise<DevelopmentModel | null> {
    const updatePayload: Partial<Omit<DevelopmentModel, 'id' | 'createdAt' | 'updatedAt'>> = data;
    return this.repository.update(developmentId, updatePayload, userId);
  }

  async deleteDevelopment(userId: string, developmentId: string): Promise<void> {
    await this.repository.delete(developmentId, userId);
  }
}
