import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { TargetModelType } from "../../enums/targetModelType.enum";
import { DeploymentModel } from "../../models/deployment.model";

export class DeploymentService {
  private repository: IRepository<DeploymentModel>;

  constructor() {
    this.repository = RepositoryFactory.getRepository<DeploymentModel>(
      TargetModelType.DEPLOYMENT
    );
  }

  async generateDeployment(
    userId: string,
    projectId: string,
    data: Omit<DeploymentModel, "id" | "createdAt" | "updatedAt" | "projectId">
  ): Promise<DeploymentModel> {
    const newDeploymentData: Omit<
      DeploymentModel,
      "id" | "createdAt" | "updatedAt"
    > = {
      projectId,
      ...data,
    };
    return this.repository.create(newDeploymentData, userId);
  }

  async getDeploymentsByProjectId(
    userId: string,
    projectId: string
  ): Promise<DeploymentModel[]> {
    const allDeployments = await this.repository.findAll(userId);
    // Ensure filtering by projectId if findAll doesn't inherently do it by user context alone
    // This assumes findAll might return more than just a specific project's items if not scoped by repository implementation
    return allDeployments.filter(
      (deployment: DeploymentModel) => deployment.projectId === projectId
    );
  }

  async getDeploymentById(
    userId: string,
    deploymentId: string
  ): Promise<DeploymentModel | null> {
    return this.repository.findById(deploymentId, userId);
  }

  async updateDeployment(
    userId: string,
    deploymentId: string,
    data: Partial<
      Omit<DeploymentModel, "id" | "projectId" | "createdAt" | "updatedAt">
    >
  ): Promise<DeploymentModel | null> {
    const updatePayload: Partial<
      Omit<DeploymentModel, "id" | "createdAt" | "updatedAt">
    > = data;
    return this.repository.update(deploymentId, updatePayload, userId);
  }

  async deleteDeployment(userId: string, deploymentId: string): Promise<void> {
    await this.repository.delete(deploymentId, userId);
  }
}
