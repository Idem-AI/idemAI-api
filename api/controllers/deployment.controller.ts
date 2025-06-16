import { Response } from "express";
import logger from "../config/logger";
import { DeploymentService } from "../services/Deployment/deployment.service";
import { CustomRequest } from "../interfaces/express.interface";
import {
  GitRepository,
  EnvironmentVariable,
  DeploymentModel,
} from "../models/deployment.model";

const deploymentService = new DeploymentService();

export const generateDeploymentController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `generateDeploymentController called - UserId: ${userId}, ProjectId: ${projectId}`
  );
  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!projectId) {
      res.status(400).json({ message: "Project ID is required" });
      return;
    }
    const { name, environment } = req.body as Pick<
      DeploymentModel,
      "name" | "environment"
    >;
    if (!name || !environment) {
      res
        .status(400)
        .json({ message: "Deployment name and environment are required" });
      return;
    }
    const deployment = await deploymentService.generateDeployment(
      userId!,
      projectId,
      { name, environment }
    );
    logger.info(
      `Deployment generated successfully - UserId: ${userId}, ProjectId: ${projectId}, DeploymentId: ${deployment.id}`
    );
    res.status(201).json(deployment);
  } catch (error: any) {
    logger.error(
      `Error in generateDeploymentController - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack, body: req.body }
    );
    res
      .status(500)
      .json({ message: "Error generating deployment", error: error.message });
  }
};

export const getDeploymentsByProjectController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `getDeploymentsByProjectController called - UserId: ${userId}, ProjectId: ${projectId}`
  );
  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!projectId) {
      res.status(400).json({ message: "Project ID is required" });
      return;
    }
    const deployments = await deploymentService.getDeploymentsByProjectId(
      userId!,
      projectId
    );
    logger.info(
      `Deployments fetched successfully for project - UserId: ${userId}, ProjectId: ${projectId}, Count: ${deployments.length}`
    );
    res.status(200).json(deployments);
  } catch (error: any) {
    logger.error(
      `Error in getDeploymentsByProjectController - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack }
    );
    res
      .status(500)
      .json({ message: "Error fetching deployments", error: error.message });
  }
};

export const getDeploymentByIdController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { deploymentId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `getDeploymentByIdController called - UserId: ${userId}, DeploymentId: ${deploymentId}`
  );
  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const deployment = await deploymentService.getDeploymentById(
      userId!,
      deploymentId
    );
    if (deployment) {
      logger.info(
        `Deployment fetched successfully - UserId: ${userId}, DeploymentId: ${deployment.id}`
      );
      res.status(200).json(deployment);
    } else {
      logger.warn(
        `Deployment not found - UserId: ${userId}, DeploymentId: ${deploymentId}`
      );
      res.status(404).json({ message: "Deployment not found" });
    }
  } catch (error: any) {
    logger.error(
      `Error in getDeploymentByIdController - UserId: ${userId}, DeploymentId: ${deploymentId}: ${error.message}`,
      { stack: error.stack }
    );
    res
      .status(500)
      .json({ message: "Error fetching deployment", error: error.message });
  }
};

export const updateDeploymentController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { deploymentId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `updateDeploymentController called - UserId: ${userId}, DeploymentId: ${deploymentId}`
  );
  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const deployment = await deploymentService.updateDeployment(
      userId!,
      deploymentId,
      req.body
    );
    if (deployment) {
      logger.info(
        `Deployment updated successfully - UserId: ${userId}, DeploymentId: ${deployment.id}`
      );
      res.status(200).json(deployment);
    } else {
      logger.warn(
        `Deployment not found for update - UserId: ${userId}, DeploymentId: ${deploymentId}`
      );
      res.status(404).json({ message: "Deployment not found for update" });
    }
  } catch (error: any) {
    logger.error(
      `Error in updateDeploymentController - UserId: ${userId}, DeploymentId: ${deploymentId}: ${error.message}`,
      { stack: error.stack, body: req.body }
    );
    res
      .status(500)
      .json({ message: "Error updating deployment", error: error.message });
  }
};

export const deleteDeploymentController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { deploymentId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `deleteDeploymentController called - UserId: ${userId}, DeploymentId: ${deploymentId}`
  );
  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    await deploymentService.deleteDeployment(userId!, deploymentId);
    logger.info(
      `Deployment deleted successfully - UserId: ${userId}, DeploymentId: ${deploymentId}`
    );
    res.status(204).send();
  } catch (error: any) {
    logger.error(
      `Error in deleteDeploymentController - UserId: ${userId}, DeploymentId: ${deploymentId}: ${error.message}`,
      { stack: error.stack }
    );
    res
      .status(500)
      .json({ message: "Error deleting deployment", error: error.message });
  }
};

// New Configuration Update Controllers

export const updateGitRepositoryConfigController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { deploymentId } = req.params;
  const userId = req.user?.uid;
  const gitConfig = req.body as GitRepository;

  logger.info(
    `updateGitRepositoryConfigController called - UserId: ${userId}, DeploymentId: ${deploymentId}`
  );
  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  if (!deploymentId) {
    res.status(400).json({ message: "Deployment ID is required" });
    return;
  }
  if (!gitConfig || !gitConfig.provider || !gitConfig.url || !gitConfig.branch) {
    res.status(400).json({ message: "Invalid Git repository configuration data" });
    return;
  }

  try {
    const updatedDeployment = await deploymentService.updateGitRepositoryConfig(
      userId!,
      deploymentId,
      gitConfig
    );
    if (updatedDeployment) {
      logger.info(
        `GitRepository config updated successfully - UserId: ${userId}, DeploymentId: ${updatedDeployment.id}`
      );
      res.status(200).json(updatedDeployment);
    } else {
      logger.warn(
        `Deployment not found or GitRepository config update failed - UserId: ${userId}, DeploymentId: ${deploymentId}`
      );
      res.status(404).json({ message: "Deployment not found or update failed" });
    }
  } catch (error: any) {
    logger.error(
      `Error in updateGitRepositoryConfigController - UserId: ${userId}, DeploymentId: ${deploymentId}: ${error.message}`,
      { stack: error.stack, body: req.body }
    );
    res.status(500).json({
      message: "Error updating Git repository configuration",
      error: error.message,
    });
  }
};

export const updateEnvironmentVariablesController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { deploymentId } = req.params;
  const userId = req.user?.uid;
  const envVars = req.body as EnvironmentVariable[];

  logger.info(
    `updateEnvironmentVariablesController called - UserId: ${userId}, DeploymentId: ${deploymentId}`
  );
  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  if (!deploymentId) {
    res.status(400).json({ message: "Deployment ID is required" });
    return;
  }
  if (!envVars || !Array.isArray(envVars)) {
    res.status(400).json({ message: "Invalid environment variables data" });
    return;
  }

  try {
    const updatedDeployment = await deploymentService.updateEnvironmentVariables(
      userId!,
      deploymentId,
      envVars
    );
    if (updatedDeployment) {
      logger.info(
        `Environment variables updated successfully - UserId: ${userId}, DeploymentId: ${updatedDeployment.id}`
      );
      res.status(200).json(updatedDeployment);
    } else {
      logger.warn(
        `Deployment not found or environment variables update failed - UserId: ${userId}, DeploymentId: ${deploymentId}`
      );
      res.status(404).json({ message: "Deployment not found or update failed" });
    }
  } catch (error: any) {
    logger.error(
      `Error in updateEnvironmentVariablesController - UserId: ${userId}, DeploymentId: ${deploymentId}: ${error.message}`,
      { stack: error.stack, body: req.body }
    );
    res.status(500).json({
      message: "Error updating environment variables",
      error: error.message,
    });
  }
};

export const updateChatMessagesController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { deploymentId } = req.params;
  const userId = req.user?.uid;
  const messages = req.body;

  logger.info(
    `updateChatMessagesController called - UserId: ${userId}, DeploymentId: ${deploymentId}`
  );
  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  if (!deploymentId) {
    res.status(400).json({ message: "Deployment ID is required" });
    return;
  }
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ message: "Invalid chat messages data" });
    return;
  }

  try {
    const updatedDeployment = await deploymentService.updateDeployment(
      userId!,
      deploymentId,
      { chatMessages: messages }
    );
    if (updatedDeployment) {
      logger.info(
        `Chat messages updated successfully - UserId: ${userId}, DeploymentId: ${updatedDeployment.id}`
      );
      res.status(200).json(updatedDeployment);
    } else {
      logger.warn(
        `Deployment not found or chat messages update failed - UserId: ${userId}, DeploymentId: ${deploymentId}`
      );
      res.status(404).json({ message: "Deployment not found or update failed" });
    }
  } catch (error: any) {
    logger.error(
      `Error in updateChatMessagesController - UserId: ${userId}, DeploymentId: ${deploymentId}: ${error.message}`,
      { stack: error.stack, body: req.body }
    );
    res.status(500).json({
      message: "Error updating chat messages",
      error: error.message,
    });
  }
};

export const updateArchitectureTemplatesController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { deploymentId } = req.params;
  const userId = req.user?.uid;
  const templates = req.body;

  logger.info(
    `updateArchitectureTemplatesController called - UserId: ${userId}, DeploymentId: ${deploymentId}`
  );
  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  if (!deploymentId) {
    res.status(400).json({ message: "Deployment ID is required" });
    return;
  }
  if (!templates || !Array.isArray(templates)) {
    res.status(400).json({ message: "Invalid architecture templates data" });
    return;
  }

  try {
    const updatedDeployment = await deploymentService.updateDeployment(
      userId!,
      deploymentId,
      { architectureTemplates: templates }
    );
    if (updatedDeployment) {
      logger.info(
        `Architecture templates updated successfully - UserId: ${userId}, DeploymentId: ${updatedDeployment.id}`
      );
      res.status(200).json(updatedDeployment);
    } else {
      logger.warn(
        `Deployment not found or architecture templates update failed - UserId: ${userId}, DeploymentId: ${deploymentId}`
      );
      res.status(404).json({ message: "Deployment not found or update failed" });
    }
  } catch (error: any) {
    logger.error(
      `Error in updateArchitectureTemplatesController - UserId: ${userId}, DeploymentId: ${deploymentId}: ${error.message}`,
      { stack: error.stack, body: req.body }
    );
    res.status(500).json({
      message: "Error updating architecture templates",
      error: error.message,
    });
  }
};

// Pipeline Control

export const startDeploymentPipelineController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { deploymentId } = req.params;
  const userId = req.user?.uid;

  logger.info(
    `startDeploymentPipelineController called - UserId: ${userId}, DeploymentId: ${deploymentId}`
  );
  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  if (!deploymentId) {
    res.status(400).json({ message: "Deployment ID is required" });
    return;
  }

  try {
    const deployment = await deploymentService.startDeploymentPipeline(
      userId!,
      deploymentId
    );
    if (deployment) {
      logger.info(
        `Deployment pipeline initiated/status retrieved - UserId: ${userId}, DeploymentId: ${deployment.id}, Status: ${deployment.status}`
      );
      res.status(200).json(deployment); // Or 202 if it's a long-running async process started
    } else {
      logger.warn(
        `Deployment not found or pipeline could not be started - UserId: ${userId}, DeploymentId: ${deploymentId}`
      );
      // The service might return null if deployment not found, or the deployment itself if it's in a non-startable state but found.
      // Check service logic for exact return on non-startable state.
      res
        .status(404)
        .json({
          message:
            "Deployment not found or pipeline could not be started (check status or configuration)",
        });
    }
  } catch (error: any) {
    logger.error(
      `Error in startDeploymentPipelineController - UserId: ${userId}, DeploymentId: ${deploymentId}: ${error.message}`,
      { stack: error.stack }
    );
    res
      .status(500)
      .json({
        message: "Error starting deployment pipeline",
        error: error.message,
      });
  }
};
