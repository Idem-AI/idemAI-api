import { Response } from "express";
import logger from "../config/logger";
import { DeploymentService } from "../services/Deployment/deployment.service";
import { CustomRequest } from "../interfaces/express.interface";

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
    const deployment = await deploymentService.generateDeployment(
      userId!,
      projectId,
      req.body
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
