import { Response } from "express";
import { CustomRequest } from "../interfaces/express.interface";
import { BusinessPlanService } from "../services/BusinessPlan/businessPlan.service";
import { PromptService } from "../services/prompt.service";
import logger from "../config/logger";

// Create instances of the services
const promptService = new PromptService();
const businessPlanService = new BusinessPlanService(promptService);

export const generateBusinessPlanController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { projectId, userId: paramUserId } = req.params; // paramUserId to distinguish from req.user.uid if needed elsewhere
  logger.info(
    `generateBusinessPlanController called - UserId (from params): ${paramUserId}, ProjectId: ${projectId}`
  );
  try {
    if (!paramUserId) {
      logger.warn("User ID from params is required for generateBusinessPlanController");
      res.status(401).json({ message: "User ID from params is required" });
      return;
    }
    if (!projectId) {
      logger.warn("Project ID is required for generateBusinessPlanController");
      res.status(400).json({ message: "Project ID is required" });
      return;
    }
    const item = await businessPlanService.generateBusinessPlan(
      paramUserId,
      projectId
    );
    if (item) {
      logger.info(
        `Business plan generated successfully (Project updated) - UserId: ${paramUserId}, ProjectId: ${projectId}, UpdatedProjectId: ${item.id}`
      );
      res.status(201).json(item);
    } else {
      logger.warn(
        `Business plan generation returned null (Project not updated) - UserId: ${paramUserId}, ProjectId: ${projectId}`
      );
      res.status(500).json({ message: "Failed to generate business plan and update project" });
    }
  } catch (error: any) {
    logger.error(
      `Error in generateBusinessPlanController - UserId: ${paramUserId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack, params: req.params }
    );
    res.status(500).json({
      message: error.message || "Failed to generate business plan item",
    });
  }
};

export const getBusinessPlansByProjectController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { projectId } = req.params;
  logger.info(
    `getBusinessPlansByProjectController called - UserId: ${userId}, ProjectId: ${projectId}`
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for getBusinessPlansByProjectController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!projectId) {
      logger.warn("Project ID is required for getBusinessPlansByProjectController");
      res.status(400).json({ message: "Project ID is required" });
      return;
    }
    const businessPlan = await businessPlanService.getBusinessPlansByProjectId(
      userId,
      projectId
    );
    if (businessPlan) {
      logger.info(
        `Business plan fetched successfully for project - UserId: ${userId}, ProjectId: ${projectId}`
      );
      res.status(200).json(businessPlan);
    } else {
      logger.warn(
        `Business plan not found for project - UserId: ${userId}, ProjectId: ${projectId}`
      );
      res.status(404).json({ message: "Business plan not found for the project" });
    }
  } catch (error: any) {
    logger.error(
      `Error in getBusinessPlansByProjectController - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack, params: req.params }
    );
    res.status(500).json({
      message: error.message || "Failed to retrieve business plan items",
    });
  }
};

export const getBusinessPlanByIdController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { itemId: projectId } = req.params; // Assuming itemId from route is the projectId
  logger.info(
    `getBusinessPlanByIdController (acting as getByProjectId) called - UserId: ${userId}, ProjectId: ${projectId}`
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for getBusinessPlanByIdController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const businessPlan = await businessPlanService.getBusinessPlansByProjectId(userId, projectId);
    if (businessPlan) {
      logger.info(
        `Business plan fetched successfully - UserId: ${userId}, ProjectId: ${projectId}`
      );
      res.status(200).json(businessPlan);
    } else {
      logger.warn(
        `Business plan not found - UserId: ${userId}, ProjectId: ${projectId}`
      );
      res.status(404).json({ message: "Business plan not found" });
    }
  } catch (error: any) {
    logger.error(
      `Error in getBusinessPlanByIdController (acting as getByProjectId) - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack, params: req.params }
    );
    res.status(500).json({
      message: error.message || "Failed to retrieve business plan item",
    });
  }
};

export const updateBusinessPlanController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { itemId } = req.params;
  logger.info(
    `updateBusinessPlanController called - UserId: ${userId}, ItemId: ${itemId}`,
    { body: req.body }
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for updateBusinessPlanController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const item = await businessPlanService.updateBusinessPlan(
      userId,
      itemId,
      req.body
    );
    if (item) {
      logger.info(
        `Business plan updated successfully - UserId: ${userId}, ItemId: ${itemId}`
      );
      res.status(200).json(item);
    } else {
      logger.warn(
        `Business plan item not found for update - UserId: ${userId}, ItemId: ${itemId}`
      );
      res.status(404).json({ message: "Business plan item not found" });
    }
  } catch (error: any) {
    logger.error(
      `Error in updateBusinessPlanController - UserId: ${userId}, ItemId: ${itemId}: ${error.message}`,
      { stack: error.stack, body: req.body, params: req.params }
    );
    res.status(500).json({
      message: error.message || "Failed to update business plan item",
    });
  }
};

export const deleteBusinessPlanController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { itemId } = req.params;
  logger.info(
    `deleteBusinessPlanController called - UserId: ${userId}, ItemId: ${itemId}`
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for deleteBusinessPlanController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    await businessPlanService.deleteBusinessPlan(userId, itemId);
    logger.info(
      `Business plan deleted successfully - UserId: ${userId}, ItemId: ${itemId}`
    );
    res.status(204).send();
  } catch (error: any) {
    logger.error(
      `Error in deleteBusinessPlanController - UserId: ${userId}, ItemId: ${itemId}: ${error.message}`,
      { stack: error.stack, params: req.params }
    );
    res.status(500).json({
      message: error.message || "Failed to delete business plan item",
    });
  }
};
