import { Request, Response } from "express";
import { BrandingService } from "../services/BandIdentity/branding.service";
import { CustomRequest } from "../interfaces/express.interface";
import logger from "../config/logger";

const brandingService = new BrandingService();

export const generateBrandingController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `generateBrandingController called - UserId: ${userId}, ProjectId: ${projectId}`,
    { body: req.body }
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for generateBrandingController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!projectId) {
      logger.warn("Project ID is required for generateBrandingController");
      res.status(400).json({ message: "Project ID is required" });
      return;
    }
    const branding = await brandingService.generateBranding(
      userId,
      projectId,
      req.body
    );
    logger.info(
      `Branding generated successfully - UserId: ${userId}, ProjectId: ${projectId}, BrandingId: ${branding.id}`
    );
    res.status(201).json(branding);
  } catch (error: any) {
    logger.error(
      `Error in generateBrandingController - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack, body: req.body, params: req.params }
    );
    res
      .status(500)
      .json({ message: "Error generating branding", error: error.message });
  }
};

export const getBrandingsByProjectController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `getBrandingsByProjectController called - UserId: ${userId}, ProjectId: ${projectId}`
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for getBrandingsByProjectController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!projectId) {
      logger.warn("Project ID is required for getBrandingsByProjectController");
      res.status(400).json({ message: "Project ID is required" });
      return;
    }
    const brandings = await brandingService.getBrandingsByProjectId(
      userId,
      projectId
    );
    logger.info(
      `Brandings fetched successfully for project - UserId: ${userId}, ProjectId: ${projectId}, Count: ${brandings.length}`
    );
    res.status(200).json(brandings);
  } catch (error: any) {
    logger.error(
      `Error in getBrandingsByProjectController - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack, params: req.params }
    );
    res
      .status(500)
      .json({ message: "Error fetching brandings", error: error.message });
  }
};

export const getBrandingByIdController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { brandingId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `getBrandingByIdController called - UserId: ${userId}, BrandingId: ${brandingId}`
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for getBrandingByIdController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const branding = await brandingService.getBrandingById(userId, brandingId);
    if (branding) {
      logger.info(
        `Branding fetched successfully - UserId: ${userId}, BrandingId: ${brandingId}`
      );
      res.status(200).json(branding);
    } else {
      logger.warn(
        `Branding not found - UserId: ${userId}, BrandingId: ${brandingId}`
      );
      res.status(404).json({ message: "Branding not found" });
    }
  } catch (error: any) {
    logger.error(
      `Error in getBrandingByIdController - UserId: ${userId}, BrandingId: ${brandingId}: ${error.message}`,
      { stack: error.stack, params: req.params }
    );
    res
      .status(500)
      .json({ message: "Error fetching branding", error: error.message });
  }
};

export const updateBrandingController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { brandingId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `updateBrandingController called - UserId: ${userId}, BrandingId: ${brandingId}`,
    { body: req.body }
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for updateBrandingController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const branding = await brandingService.updateBranding(
      userId,
      brandingId,
      req.body
    );
    if (branding) {
      logger.info(
        `Branding updated successfully - UserId: ${userId}, BrandingId: ${brandingId}`
      );
      res.status(200).json(branding);
    } else {
      logger.warn(
        `Branding not found for update - UserId: ${userId}, BrandingId: ${brandingId}`
      );
      res.status(404).json({ message: "Branding not found for update" });
    }
  } catch (error: any) {
    logger.error(
      `Error in updateBrandingController - UserId: ${userId}, BrandingId: ${brandingId}: ${error.message}`,
      { stack: error.stack, body: req.body, params: req.params }
    );
    res
      .status(500)
      .json({ message: "Error updating branding", error: error.message });
  }
};

export const deleteBrandingController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { brandingId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `deleteBrandingController called - UserId: ${userId}, BrandingId: ${brandingId}`
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for deleteBrandingController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    await brandingService.deleteBranding(userId, brandingId);
    logger.info(
      `Branding deleted successfully - UserId: ${userId}, BrandingId: ${brandingId}`
    );
    res.status(204).send();
  } catch (error: any) {
    logger.error(
      `Error in deleteBrandingController - UserId: ${userId}, BrandingId: ${brandingId}: ${error.message}`,
      { stack: error.stack, params: req.params }
    );
    res
      .status(500)
      .json({ message: "Error deleting branding", error: error.message });
  }
};
