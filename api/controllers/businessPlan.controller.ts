import { Response } from "express";
import { CustomRequest } from "../interfaces/express.interface";
import { BusinessPlanService } from "../services/BusinessPlan/businessPlan.service";
import { PromptService } from "../services/prompt.service";

// Create instances of the services
const promptService = new PromptService();
const businessPlanService = new BusinessPlanService(promptService);

export const generateBusinessPlanController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { projectId, userId } = req.params;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!projectId) {
      res.status(400).json({ message: "Project ID is required" });
      return;
    }
    const item = await businessPlanService.generateBusinessPlan(
      userId,
      projectId
    );
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to generate business plan item",
    });
  }
};

export const getBusinessPlansByProjectController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { projectId } = req.params;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!projectId) {
      res.status(400).json({ message: "Project ID is required" });
      return;
    }
    const items = await businessPlanService.getBusinessPlansByProjectId(
      userId,
      projectId
    );
    res.status(200).json(items);
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to retrieve business plan items",
    });
  }
};

export const getBusinessPlanByIdController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { itemId } = req.params;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const item = await businessPlanService.getBusinessPlansByProjectId(
      userId,
      itemId
    );
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Business plan item not found" });
    }
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to retrieve business plan item",
    });
  }
};

export const updateBusinessPlanController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { itemId } = req.params;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const item = await businessPlanService.updateBusinessPlan(
      userId,
      itemId,
      req.body
    );
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Business plan item not found" });
    }
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to update business plan item",
    });
  }
};

export const deleteBusinessPlanController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { itemId } = req.params;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    await businessPlanService.deleteBusinessPlan(userId, itemId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to delete business plan item",
    });
  }
};
