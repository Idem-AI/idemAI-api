import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { TargetModelType } from "../../enums/targetModelType.enum";
import { DeploymentModel } from "../../models/deployment.model";
import logger from "../../config/logger";

export class DeploymentService {
  private repository: IRepository<DeploymentModel>;

  constructor() {
    logger.info('DeploymentService initialized.');
    this.repository = RepositoryFactory.getRepository<DeploymentModel>(
      TargetModelType.DEPLOYMENT
    );
  }

  async generateDeployment(
    userId: string,
    projectId: string,
    data: Omit<DeploymentModel, "id" | "createdAt" | "updatedAt" | "projectId">
  ): Promise<DeploymentModel> {
    logger.info(`generateDeployment called for userId: ${userId}, projectId: ${projectId}`);
    try {
    const newDeploymentData: Omit<
      DeploymentModel,
      "id" | "createdAt" | "updatedAt"
    > = {
      projectId,
      ...data,
    };
    const deployment = await this.repository.create(newDeploymentData, userId);
    logger.info(`Deployment generated successfully for projectId: ${projectId}, deploymentId: ${deployment.id}`);
    return deployment;
    } catch (error: any) {
      logger.error(`Error in generateDeployment for projectId ${projectId}: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async getDeploymentsByProjectId(
    userId: string,
    projectId: string
  ): Promise<DeploymentModel[]> {
    logger.info(`getDeploymentsByProjectId called for userId: ${userId}, projectId: ${projectId}`);
    try {
    const allDeployments = await this.repository.findAll(userId);
    // Ensure filtering by projectId if findAll doesn't inherently do it by user context alone
    // This assumes findAll might return more than just a specific project's items if not scoped by repository implementation
    const filteredDeployments = allDeployments.filter(
      (deployment: DeploymentModel) => deployment.projectId === projectId
    );
    logger.info(`Found ${filteredDeployments.length} deployments for projectId: ${projectId}`);
    return filteredDeployments;
    } catch (error: any) {
      logger.error(`Error in getDeploymentsByProjectId for projectId ${projectId}: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async getDeploymentById(
    userId: string,
    deploymentId: string
  ): Promise<DeploymentModel | null> {
    logger.info(`getDeploymentById called for userId: ${userId}, deploymentId: ${deploymentId}`);
    try {
    const deployment = await this.repository.findById(deploymentId, userId);
    if (!deployment) {
      logger.warn(`Deployment not found with deploymentId: ${deploymentId} for userId: ${userId}`);
      return null;
    }
    logger.info(`Deployment found successfully with deploymentId: ${deploymentId}`);
    return deployment;
    } catch (error: any) {
      logger.error(`Error in getDeploymentById for deploymentId ${deploymentId}: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async updateDeployment(
    userId: string,
    deploymentId: string,
    data: Partial<
      Omit<DeploymentModel, "id" | "projectId" | "createdAt" | "updatedAt">
    >
  ): Promise<DeploymentModel | null> {
    logger.info(`updateDeployment called for userId: ${userId}, deploymentId: ${deploymentId}`);
    try {
    const updatePayload: Partial<
      Omit<DeploymentModel, "id" | "createdAt" | "updatedAt">
    > = data;
    const updatedDeployment = await this.repository.update(deploymentId, updatePayload, userId);
    if (!updatedDeployment) {
      logger.warn(`Deployment not found or failed to update for deploymentId: ${deploymentId}`);
      return null;
    }
    logger.info(`Deployment updated successfully for deploymentId: ${deploymentId}`);
    return updatedDeployment;
    } catch (error: any) {
      logger.error(`Error in updateDeployment for deploymentId ${deploymentId}: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async deleteDeployment(userId: string, deploymentId: string): Promise<void> {
    logger.info(`deleteDeployment called for userId: ${userId}, deploymentId: ${deploymentId}`);
    try {
    const result = await this.repository.delete(deploymentId, userId);
    if (!result) {
       logger.warn(`Deployment not found or failed to delete for deploymentId: ${deploymentId}, userId: ${userId}`);
       // Depending on repository.delete contract, you might throw an error or just log
       // For now, just logging as a warning.
       return; // Or throw new Error('Deletion failed');
    }
    logger.info(`Deployment deleted successfully for deploymentId: ${deploymentId}`);
    } catch (error: any) {
      logger.error(`Error in deleteDeployment for deploymentId ${deploymentId}: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }
}
