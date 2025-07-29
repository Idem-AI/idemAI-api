import { Request, Response } from "express";
import { BrandingService } from "../services/BandIdentity/branding.service";
import { PromptService } from "../services/prompt.service";
import { CustomRequest } from "../interfaces/express.interface";
import logger from "../config/logger";
import { userService } from "../services/user.service";
// Create instances of the services
const promptService = new PromptService();
const brandingService = new BrandingService(promptService);

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
    const updatedProject = await brandingService.generateBranding(
      userId,
      projectId
    );

    if (!updatedProject) {
      logger.warn(
        `Failed to generate branding - UserId: ${userId}, ProjectId: ${projectId}`
      );
      res.status(500).json({ message: "Failed to generate branding" });
      return;
    }

    logger.info(
      `Branding generated successfully - UserId: ${userId}, ProjectId: ${projectId}, ProjectUpdated: ${updatedProject.id}`
    );
    // Return the branding from the updated project
    userService.incrementUsage(userId,1);
    res.status(201).json(updatedProject.analysisResultModel.branding);
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

export const generateLogoColorsAndTypographyController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const project = req.body.project;
  const userId = req.user?.uid;
  console.log("project", project);
  logger.info(
    `generateLogoColorsAndTypographyController called - UserId: ${userId}, ProjectId: ${project.id}`,
    { body: req.body }
  );
  try {
    if (!userId) {
      logger.warn(
        "User not authenticated for generateLogoColorsAndTypographyController"
      );
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!project.id) {
      logger.warn(
        "Project ID is required for generateLogoColorsAndTypographyController"
      );
      res.status(400).json({ message: "Project ID is required" });
      return;
    }

    const updatedProject =
      await brandingService.generateLogoColorsAndTypography(userId, project);

    if (!updatedProject) {
      logger.warn(
        `Failed to generate logo, colors, and typography - UserId: ${userId}, ProjectId: ${project.id}`
      );
      res
        .status(500)
        .json({ message: "Failed to generate logo, colors, and typography" });
      return;
    }

    logger.info(
      `Logo, colors, and typography generated successfully - UserId: ${userId}, ProjectId: ${project.id}`
    );
    // Return the branding from the updated project
    userService.incrementUsage(userId,1);
    res.status(201).json(updatedProject);
  } catch (error: any) {
    logger.error(
      `Error in generateLogoColorsAndTypographyController - UserId: ${userId}, ProjectId: ${project.id}: ${error.message}`,
      { stack: error.stack, body: req.body, params: req.params }
    );
    res.status(500).json({
      message: "Error generating logo, colors, and typography",
      error: error.message,
    });
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
    const branding = await brandingService.getBrandingsByProjectId(
      userId,
      projectId
    );

    if (!branding) {
      logger.info(
        `No branding found - UserId: ${userId}, ProjectId: ${projectId}`
      );
      res.status(404).json({ message: "No branding found for this project" });
      return;
    }

    logger.info(
      `Retrieved branding successfully - UserId: ${userId}, ProjectId: ${projectId}`
    );
    res.status(200).json(branding);
  } catch (error: any) {
    logger.error(
      `Error in getBrandingsByProjectController - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack }
    );
    res.status(500).json({
      message: "Error retrieving branding",
      error: error.message,
    });
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
  const { projectId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `updateBrandingController called - UserId: ${userId}, ProjectId: ${projectId}`,
    { body: req.body }
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for updateBrandingController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!projectId) {
      logger.warn("Project ID is required for updateBrandingController");
      res.status(400).json({ message: "Project ID is required" });
      return;
    }
    const updatedProject = await brandingService.updateBranding(
      userId,
      projectId,
      req.body
    );
    if (!updatedProject) {
      logger.warn(
        `Project not found for branding update - UserId: ${userId}, ProjectId: ${projectId}`
      );
      res.status(404).json({ message: "Project not found" });
      return;
    }
    logger.info(
      `Branding updated successfully - UserId: ${userId}, ProjectId: ${projectId}`
    );
    res.status(200).json(updatedProject.analysisResultModel.branding);
  } catch (error: any) {
    logger.error(
      `Error in updateBrandingController - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack, body: req.body }
    );
    res.status(500).json({
      message: "Error updating branding",
      error: error.message,
    });
  }
};

export const deleteBrandingController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `deleteBrandingController called - UserId: ${userId}, ProjectId: ${projectId}`
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for deleteBrandingController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!projectId) {
      logger.warn("Project ID is required for deleteBrandingController");
      res.status(400).json({ message: "Project ID is required" });
      return;
    }
    const success = await brandingService.deleteBranding(userId, projectId);

    if (!success) {
      logger.warn(
        `Project not found for branding deletion - UserId: ${userId}, ProjectId: ${projectId}`
      );
      res.status(404).json({ message: "Project not found" });
      return;
    }

    logger.info(
      `Branding deleted successfully - UserId: ${userId}, ProjectId: ${projectId}`
    );
    res.status(204).send();
  } catch (error: any) {
    logger.error(
      `Error in deleteBrandingController - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack }
    );
    res.status(500).json({
      message: "Error deleting branding",
      error: error.message,
    });
  }
};
