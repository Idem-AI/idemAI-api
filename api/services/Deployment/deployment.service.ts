import { DeploymentModel } from "../../models/deployment.model";
import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { TargetModelType } from "../../enums/targetModelType.enum";
import {
  GitRepository,
  EnvironmentVariable,
  ChatMessage,
  ArchitectureTemplate,
} from "../../models/deployment.model";
import logger from "../../config/logger";

export class DeploymentService {
  private repository: IRepository<DeploymentModel>;

  constructor() {
    logger.info("DeploymentService initialized.");
    this.repository = RepositoryFactory.getRepository<DeploymentModel>(
      TargetModelType.DEPLOYMENT
    );
  }

  async generateDeployment(
    userId: string,
    projectId: string,
    data: Pick<DeploymentModel, "name" | "environment"> // Essential fields at creation
  ): Promise<DeploymentModel> {
    logger.info(
      `generateDeployment called for userId: ${userId}, projectId: ${projectId}, name: ${data.name}`
    );
    try {
      const newDeploymentData: Omit<
        DeploymentModel,
        "id" | "createdAt" | "updatedAt"
      > = {
        projectId,
        name: data.name,
        environment: data.environment,
        status: "configuring", // Initial status
        gitRepository: undefined,
        environmentVariables: [],
        chatMessages: [],
        architectureTemplates: [],
        cloudComponents: [],
        architectureComponents: [],
        pipeline: {
          currentStage: "Initial Configuration",
          steps: [],
          startedAt: undefined,
          estimatedCompletionTime: undefined,
        },
        staticCodeAnalysis: undefined,
        costEstimation: undefined,
        url: undefined,
        version: undefined,
        logs: undefined,
        deployedAt: undefined,
        rollbackVersions: [],
        lastSuccessfulDeployment: undefined,
      };
      const deployment = await this.repository.create(
        newDeploymentData,
        userId
      );
      logger.info(
        `Deployment generated successfully for projectId: ${projectId}, deploymentId: ${deployment.id}, status: ${deployment.status}`
      );
      return deployment;
    } catch (error: any) {
      logger.error(
        `Error in generateDeployment for projectId ${projectId}: ${error.message}`,
        { stack: error.stack, userId, data }
      );
      throw error;
    }
  }

  async getDeploymentsByProjectId(
    userId: string,
    projectId: string
  ): Promise<DeploymentModel[]> {
    logger.info(
      `getDeploymentsByProjectId called for userId: ${userId}, projectId: ${projectId}`
    );
    try {
      const allDeployments = await this.repository.findAll(userId);
      // Ensure filtering by projectId if findAll doesn't inherently do it by user context alone
      // This assumes findAll might return more than just a specific project's items if not scoped by repository implementation
      const filteredDeployments = allDeployments.filter(
        (deployment: DeploymentModel) => deployment.projectId === projectId
      );
      logger.info(
        `Found ${filteredDeployments.length} deployments for projectId: ${projectId}`
      );
      return filteredDeployments;
    } catch (error: any) {
      logger.error(
        `Error in getDeploymentsByProjectId for projectId ${projectId}: ${error.message}`,
        { stack: error.stack, userId }
      );
      throw error;
    }
  }

  async getDeploymentById(
    userId: string,
    deploymentId: string
  ): Promise<DeploymentModel | null> {
    logger.info(
      `getDeploymentById called for userId: ${userId}, deploymentId: ${deploymentId}`
    );
    try {
      const deployment = await this.repository.findById(deploymentId, userId);
      if (!deployment) {
        logger.warn(
          `Deployment not found with deploymentId: ${deploymentId} for userId: ${userId}`
        );
        return null;
      }
      logger.info(
        `Deployment found successfully with deploymentId: ${deploymentId}`
      );
      return deployment;
    } catch (error: any) {
      logger.error(
        `Error in getDeploymentById for deploymentId ${deploymentId}: ${error.message}`,
        { stack: error.stack, userId }
      );
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
    logger.info(
      `updateDeployment called for userId: ${userId}, deploymentId: ${deploymentId}`
    );
    try {
      const updatePayload: Partial<
        Omit<DeploymentModel, "id" | "createdAt" | "updatedAt">
      > = data;
      const updatedDeployment = await this.repository.update(
        deploymentId,
        updatePayload,
        userId
      );
      if (!updatedDeployment) {
        logger.warn(
          `Deployment not found or failed to update for deploymentId: ${deploymentId}`
        );
        return null;
      }
      logger.info(
        `Deployment updated successfully for deploymentId: ${deploymentId}`
      );
      return updatedDeployment;
    } catch (error: any) {
      logger.error(
        `Error in updateDeployment for deploymentId ${deploymentId}: ${error.message}`,
        { stack: error.stack, userId }
      );
      throw error;
    }
  }

  async deleteDeployment(userId: string, deploymentId: string): Promise<void> {
    logger.info(
      `deleteDeployment called for userId: ${userId}, deploymentId: ${deploymentId}`
    );
    try {
      const result = await this.repository.delete(deploymentId, userId);
      if (!result) {
        logger.warn(
          `Deployment not found or failed to delete for deploymentId: ${deploymentId}, userId: ${userId}`
        );
        // Depending on repository.delete contract, you might throw an error or just log
        // For now, just logging as a warning.
        return; // Or throw new Error('Deletion failed');
      }
      logger.info(
        `Deployment deleted successfully for deploymentId: ${deploymentId}`
      );
    } catch (error: any) {
      logger.error(
        `Error in deleteDeployment for deploymentId ${deploymentId}: ${error.message}`,
        { stack: error.stack, userId }
      );
      throw error;
    }
  }

  async updateGitRepositoryConfig(
    userId: string,
    deploymentId: string,
    gitConfig: GitRepository
  ): Promise<DeploymentModel | null> {
    try {
      return await this.repository.update(
        deploymentId,
        { gitRepository: gitConfig },
        userId
      );
    } catch (error: any) {
      logger.error(`Error updating git config: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async updateEnvironmentVariables(
    userId: string,
    deploymentId: string,
    envVars: EnvironmentVariable[]
  ): Promise<DeploymentModel | null> {
    try {
      return await this.repository.update(
        deploymentId,
        { environmentVariables: envVars },
        userId
      );
    } catch (error: any) {
      logger.error(`Error updating env vars: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async updateChatMessages(
    userId: string,
    deploymentId: string,
    messages: ChatMessage[]
  ): Promise<DeploymentModel | null> {
    try {
      return await this.repository.update(
        deploymentId,
        { chatMessages: messages },
        userId
      );
    } catch (error: any) {
      logger.error(`Error updating chat messages: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async updateArchitectureTemplates(
    userId: string,
    deploymentId: string,
    templates: ArchitectureTemplate[]
  ): Promise<DeploymentModel | null> {
    try {
      return await this.repository.update(
        deploymentId,
        { architectureTemplates: templates },
        userId
      );
    } catch (error: any) {
      logger.error(`Error updating architecture templates: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async updateCloudComponents(
    userId: string,
    deploymentId: string,
    components: any[]
  ): Promise<DeploymentModel | null> {
    try {
      return await this.repository.update(
        deploymentId,
        { cloudComponents: components },
        userId
      );
    } catch (error: any) {
      logger.error(`Error updating cloud components: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async updateArchitectureComponents(
    userId: string,
    deploymentId: string,
    components: any[]
  ): Promise<DeploymentModel | null> {
    try {
      return await this.repository.update(
        deploymentId,
        { architectureComponents: components },
        userId
      );
    } catch (error: any) {
      logger.error(`Error updating architecture components: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async updateDeploymentStatusAndStep(
    userId: string,
    deploymentId: string,
    newStatus: DeploymentModel["status"],
    stepDetails?: {
      name: string;
      status: any["status"];
      message?: string;
      logs?: string;
      aiRecommendation?: string;
    }
  ): Promise<DeploymentModel | null> {
    logger.info(
      `updateDeploymentStatusAndStep called for deploymentId: ${deploymentId}, newStatus: ${newStatus}`
    );
    try {
      const deployment = await this.repository.findById(deploymentId, userId);
      if (!deployment) {
        logger.warn(`Deployment not found for status update: ${deploymentId}`);
        return null;
      }

      const updatePayload: Partial<DeploymentModel> = { status: newStatus };

      if (stepDetails && deployment.pipeline) {
        const now = new Date();
        let stepUpdated = false;
        const updatedSteps = deployment.pipeline.steps.map((step) => {
          if (step.name === stepDetails.name) {
            stepUpdated = true;
            return {
              ...step,
              status: stepDetails.status,
              finishedAt:
                stepDetails.status === "succeeded" ||
                stepDetails.status === "failed"
                  ? now
                  : undefined,
              logs: stepDetails.logs || step.logs,
              errorMessage:
                stepDetails.status === "failed"
                  ? stepDetails.message
                  : undefined,
              aiRecommendation:
                stepDetails.aiRecommendation || step.aiRecommendation,
            };
          }
          return step;
        });

        if (!stepUpdated) {
          updatedSteps.push({
            name: stepDetails.name,
            status: stepDetails.status,
            startedAt: now,
            finishedAt:
              stepDetails.status === "succeeded" ||
              stepDetails.status === "failed"
                ? now
                : undefined,
            logs: stepDetails.logs,
            errorMessage:
              stepDetails.status === "failed" ? stepDetails.message : undefined,
            aiRecommendation: stepDetails.aiRecommendation,
          });
        }

        updatePayload.pipeline = {
          ...deployment.pipeline,
          steps: updatedSteps,
          currentStage: stepDetails.name, // Update current stage to the name of the step being processed
        };
      } else if (stepDetails) {
        // Handle case where pipeline might not be initialized (should not happen with new generateDeployment)
        logger.warn(
          `Pipeline object not found for deployment ${deploymentId}, initializing.`
        );
        const now = new Date();
        updatePayload.pipeline = {
          currentStage: stepDetails.name,
          steps: [
            {
              name: stepDetails.name,
              status: stepDetails.status,
              startedAt: now,
              finishedAt:
                stepDetails.status === "succeeded" ||
                stepDetails.status === "failed"
                  ? now
                  : undefined,
              logs: stepDetails.logs,
              errorMessage:
                stepDetails.status === "failed"
                  ? stepDetails.message
                  : undefined,
              aiRecommendation: stepDetails.aiRecommendation,
            },
          ],
        };
      }

      const updatedDeployment = await this.repository.update(
        deploymentId,
        updatePayload,
        userId
      );
      if (!updatedDeployment) {
        logger.warn(
          `Failed to update status/step for deploymentId: ${deploymentId}`
        );
        return null;
      }
      logger.info(
        `Deployment status/step updated for deploymentId: ${deploymentId} to status ${newStatus}, currentStage: ${updatedDeployment.pipeline?.currentStage}`
      );
      return updatedDeployment;
    } catch (error: any) {
      logger.error(
        `Error in updateDeploymentStatusAndStep for deploymentId ${deploymentId}: ${error.message}`,
        { stack: error.stack, userId }
      );
      throw error;
    }
  }

  async startDeploymentPipeline(
    userId: string,
    deploymentId: string
  ): Promise<DeploymentModel | null> {
    logger.info(
      `Attempting to start deployment pipeline for deploymentId: ${deploymentId}, userId: ${userId}`
    );

    let deployment = await this.getDeploymentById(userId, deploymentId);
    if (!deployment) {
      logger.warn(
        `startDeploymentPipeline: Deployment not found: ${deploymentId}`
      );
      return null;
    }

    // Allow starting from 'configuring' (if all configs are set), 'pending', or re-running 'failed' deployments
    if (!["configuring", "pending", "failed"].includes(deployment.status)) {
      logger.warn(
        `startDeploymentPipeline: Deployment ${deploymentId} is not in a startable state. Current status: ${deployment.status}`
      );
      return deployment;
    }

    // Validate all required configurations are present
    if (
      !deployment.gitRepository ||
      !deployment.environmentVariables ||
      !deployment.chatMessages ||
      !deployment.architectureTemplates ||
      !deployment.cloudComponents ||
      !deployment.architectureComponents
    ) {
      logger.warn(
        `startDeploymentPipeline: Deployment ${deploymentId} is missing required configurations.`
      );
      const updatedDeploymentState = await this.updateDeploymentStatusAndStep(
        userId,
        deploymentId,
        "failed",
        {
          name: "Pre-flight Check",
          status: "failed",
          message:
            "Missing critical deployment configurations. Please ensure Git, Environment Variables, Chat Messages, Architecture Templates, Cloud Components, and Architecture Components settings are complete.",
        }
      );
      return updatedDeploymentState;
    }

    // Update status to 'building' and add initial pipeline step
    deployment = await this.updateDeploymentStatusAndStep(
      userId,
      deploymentId,
      "building",
      {
        name: "Pipeline Initiated",
        status: "in-progress",
      }
    );
    if (!deployment) return null;

    logger.info(
      `Deployment pipeline initiated for deploymentId: ${deploymentId}. Status: ${deployment.status}`
    );

    // Placeholder for actual asynchronous pipeline orchestration
    // In a real system, this would trigger a workflow manager or a series of async tasks.
    // For demonstration, we'll simulate a few steps with timeouts.
    // This is NOT how it would work in production.
    (async () => {
      try {
        // Simulate Static Code Analysis
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
        deployment = await this.updateDeploymentStatusAndStep(
          userId,
          deploymentId,
          "building",
          {
            name: "Static Code Analysis",
            status: "succeeded",
            logs: "SAST scan completed. No critical issues found.",
          }
        );
        if (!deployment || deployment.status === "failed")
          throw new Error("SAST failed or deployment changed state.");

        // Simulate Docker Image Build & Push
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay
        deployment = await this.updateDeploymentStatusAndStep(
          userId,
          deploymentId,
          "building",
          {
            name: "Docker Image Build & Push",
            status: "succeeded",
            logs: "Docker image myapp:latest built and pushed successfully to registry.",
          }
        );
        if (!deployment || deployment.status === "failed")
          throw new Error(
            "Docker build/push failed or deployment changed state."
          );

        // Simulate Terraform Plan Generation
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
        deployment = await this.updateDeploymentStatusAndStep(
          userId,
          deploymentId,
          "infrastructure-provisioning",
          {
            name: "Terraform Plan Generation",
            status: "succeeded",
            logs: "Terraform plan generated. Review required before apply.",
            // Next status could be 'pending-approval' or directly 'infrastructure-provisioning' if auto-approved
          }
        );
        if (!deployment || deployment.status === "failed")
          throw new Error("Terraform plan failed or deployment changed state.");

        logger.info(
          `Simulated pipeline steps completed for ${deploymentId}. Further steps (Terraform Apply, App Deploy) would follow.`
        );
        // Next: Terraform Apply (after approval), Application Deploy, Post-Deploy Tests, etc.
      } catch (pipelineError: any) {
        logger.error(
          `Error during simulated pipeline execution for ${deploymentId}: ${pipelineError.message}`,
          { stack: pipelineError.stack }
        );
        // Ensure the deployment is marked as failed if any step fails critically
        const currentDeploymentState = await this.getDeploymentById(
          userId,
          deploymentId
        );
        if (
          currentDeploymentState &&
          currentDeploymentState.status !== "failed"
        ) {
          await this.updateDeploymentStatusAndStep(
            userId,
            deploymentId,
            "failed",
            {
              name: deployment?.pipeline?.currentStage || "Pipeline Error", // Use last known stage
              status: "failed",
              message: `Pipeline execution failed: ${pipelineError.message}`,
            }
          );
        }
      }
    })(); // Self-invoking async function for simulation

    return deployment; // Return the deployment in its current state (pipeline initiated)
  }
}
