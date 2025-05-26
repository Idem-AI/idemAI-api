import { IRepository } from '../repository/IRepository';
import { RepositoryFactory } from '../repository/RepositoryFactory';
import { LandingModel } from '../models/landing.model';
import { TargetModelType } from '../enums/targetModelType.enum';

export class LandingService {
  private repository: IRepository<LandingModel>;

  constructor() {
    this.repository = RepositoryFactory.getRepository<LandingModel>(TargetModelType.LANDING);
  }

  async generateLanding(userId: string, projectId: string, data: Omit<LandingModel, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>): Promise<LandingModel> {
    const newLandingData: Omit<LandingModel, 'id' | 'createdAt' | 'updatedAt'> = {
      projectId,
      ...data,
    };
    return this.repository.create(newLandingData, userId);
  }

  async getLandingsByProjectId(userId: string, projectId: string): Promise<LandingModel[]> {
    const allLandings = await this.repository.findAll(userId);
    return allLandings.filter((landing: LandingModel) => landing.projectId === projectId);
  }

  async getLandingById(userId: string, landingId: string): Promise<LandingModel | null> {
    return this.repository.findById(landingId, userId);
  }

  async updateLanding(userId: string, landingId: string, data: Partial<Omit<LandingModel, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>): Promise<LandingModel | null> {
    const updatePayload: Partial<Omit<LandingModel, 'id' | 'createdAt' | 'updatedAt'>> = data;
    return this.repository.update(landingId, updatePayload, userId);
  }

  async deleteLanding(userId: string, landingId: string): Promise<void> {
    await this.repository.delete(landingId, userId);
  }
}
