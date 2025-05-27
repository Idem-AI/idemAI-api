import { Response } from "express";
import { BusinessPlanService } from "../services/BusinessPlan/businessPlan.service";
import { CustomRequest } from "../interfaces/express.interface";

const businessPlanService = new BusinessPlanService();

export const generateBusinessPlanController = async (
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
    const item = await businessPlanService.generateBusinessPlan(
      userId,
      projectId,
      req.body
    );
    res.status(201).json(item);
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: "Error generating business plan",
        error: error.message,
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
    res
      .status(500)
      .json({ message: "Error fetching business plans", error: error.message });
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
    const item = await businessPlanService.getBusinessPlanById(userId, itemId);
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Business plan not found" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching business plan", error: error.message });
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
      res.status(404).json({ message: "Business plan not found for update" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error updating business plan", error: error.message });
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
    res
      .status(500)
      .json({ message: "Error deleting business plan", error: error.message });
  }
};
