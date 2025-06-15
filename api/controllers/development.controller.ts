import { Response } from "express";
import logger from "../config/logger";
import { DevelopmentService } from "../services/Development/development.service";
import { CustomRequest } from "../interfaces/express.interface";
import { CreateWebContainerRequest, UpdateWebContainerRequest } from "../models/webcontainer.model";
import { PromptService } from "../services/prompt.service";

const promptService = new PromptService();
const developmentService = new DevelopmentService(promptService);

/**
 * Create a new WebContainer
 */
export const createWebContainerController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const createRequest: CreateWebContainerRequest = req.body;
  
  logger.info(`createWebContainerController called - UserId: ${userId}, ProjectId: ${createRequest?.projectId}`);

  try {
    if (!userId) {
      logger.warn("User not authenticated for createWebContainerController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!createRequest.projectId || !createRequest.name) {
      logger.warn("Missing required fields for createWebContainerController", { 
        projectId: createRequest?.projectId, 
        name: createRequest?.name 
      });
      res.status(400).json({ message: "Project ID and name are required" });
      return;
    }

    // Log incoming file information if present
    if (createRequest.metadata?.files && createRequest.metadata.files.length > 0) {
      logger.info(`createWebContainerController - Incoming files for userId: ${userId}`, {
        files: createRequest.metadata.files,
        fileCount: createRequest.metadata.files.length,
        hasFileContents: !!createRequest.metadata.fileContents && Object.keys(createRequest.metadata.fileContents).length > 0,
        fileContentsCount: createRequest.metadata.fileContents ? Object.keys(createRequest.metadata.fileContents).length : 0
      });
    }

    const webContainer = await developmentService.createWebContainer(userId, createRequest);

    logger.info(`WebContainer created successfully - UserId: ${userId}, WebContainerId: ${webContainer.id}`);
    res.status(201).json(webContainer);
    return;
  } catch (error) {
    logger.error(`Error in createWebContainerController - UserId: ${userId}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestBody: createRequest
    });
    res.status(500).json({ message: "Failed to create webcontainer" });
    return;
  }
};

/**
 * Update a WebContainer
 */
export const updateWebContainerController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { webContainerId } = req.params;
  const updateRequest: UpdateWebContainerRequest = req.body;
  
  logger.info(`updateWebContainerController called - UserId: ${userId}, WebContainerId: ${webContainerId}`);

  try {
    if (!userId) {
      logger.warn("User not authenticated for updateWebContainerController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!webContainerId) {
      logger.warn("WebContainer ID is required for updateWebContainerController");
      res.status(400).json({ message: "WebContainer ID is required" });
      return;
    }

    // Log incoming file updates if present
    if (updateRequest.metadata?.files !== undefined) {
      logger.info(`updateWebContainerController - Incoming file updates for userId: ${userId}, webContainerId: ${webContainerId}`, {
        files: updateRequest.metadata.files,
        fileCount: updateRequest.metadata.files?.length || 0
      });
    }
    
    if (updateRequest.metadata?.fileContents !== undefined) {
      const fileContentKeys = Object.keys(updateRequest.metadata.fileContents);
      logger.info(`updateWebContainerController - Incoming file content updates for userId: ${userId}, webContainerId: ${webContainerId}`, {
        updatedFiles: fileContentKeys,
        updatedFileCount: fileContentKeys.length
      });
    }

    const updatedWebContainer = await developmentService.updateWebContainer(
      userId,
      webContainerId,
      updateRequest
    );

    if (!updatedWebContainer) {
      logger.warn(`WebContainer not found - UserId: ${userId}, WebContainerId: ${webContainerId}`);
      res.status(404).json({ message: "WebContainer not found" });
      return;
    }

    logger.info(`WebContainer updated successfully - UserId: ${userId}, WebContainerId: ${webContainerId}`);
    res.status(200).json(updatedWebContainer);
    return;
  } catch (error) {
    logger.error(`Error in updateWebContainerController - UserId: ${userId}, WebContainerId: ${webContainerId}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestBody: updateRequest
    });
    res.status(500).json({ message: "Failed to update webcontainer" });
    return;
  }
};

/**
 * Get a WebContainer by ID
 */
export const getWebContainerByIdController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { webContainerId } = req.params;
  
  logger.info(`getWebContainerByIdController called - UserId: ${userId}, WebContainerId: ${webContainerId}`);

  try {
    if (!userId) {
      logger.warn("User not authenticated for getWebContainerByIdController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!webContainerId) {
      logger.warn("WebContainer ID is required for getWebContainerByIdController");
      res.status(400).json({ message: "WebContainer ID is required" });
      return;
    }

    const webContainer = await developmentService.getWebContainerById(userId, webContainerId);

    if (!webContainer) {
      logger.warn(`WebContainer not found - UserId: ${userId}, WebContainerId: ${webContainerId}`);
      res.status(404).json({ message: "WebContainer not found" });
      return;
    }

    logger.info(`WebContainer retrieved successfully - UserId: ${userId}, WebContainerId: ${webContainerId}`);
    res.status(200).json(webContainer);
    return;
  } catch (error) {
    logger.error(`Error in getWebContainerByIdController - UserId: ${userId}, WebContainerId: ${webContainerId}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ message: "Failed to get webcontainer" });
    return;
  }
};

/**
 * Get all WebContainers for the authenticated user
 */
export const getAllWebContainersController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  
  logger.info(`getAllWebContainersController called - UserId: ${userId}`);

  try {
    if (!userId) {
      logger.warn("User not authenticated for getAllWebContainersController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const webContainers = await developmentService.getAllWebContainers(userId);

    logger.info(`Retrieved ${webContainers.length} webcontainers - UserId: ${userId}`);
    res.status(200).json(webContainers);
    return;
  } catch (error) {
    logger.error(`Error in getAllWebContainersController - UserId: ${userId}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ message: "Failed to get webcontainers" });
    return;
  }
};

/**
 * Get WebContainers by project ID
 */
export const getWebContainersByProjectController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { projectId } = req.params;
  
  logger.info(`getWebContainersByProjectController called - UserId: ${userId}, ProjectId: ${projectId}`);

  try {
    if (!userId) {
      logger.warn("User not authenticated for getWebContainersByProjectController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!projectId) {
      logger.warn("Project ID is required for getWebContainersByProjectController");
      res.status(400).json({ message: "Project ID is required" });
      return;
    }

    const webContainers = await developmentService.getWebContainersByProject(userId, projectId);

    logger.info(`Retrieved ${webContainers.length} webcontainers for project - UserId: ${userId}, ProjectId: ${projectId}`);
    res.status(200).json(webContainers);
    return;
  } catch (error) {
    logger.error(`Error in getWebContainersByProjectController - UserId: ${userId}, ProjectId: ${projectId}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ message: "Failed to get webcontainers for project" });
    return;
  }
};

/**
 * Delete a WebContainer
 */
export const deleteWebContainerController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { webContainerId } = req.params;
  
  logger.info(`deleteWebContainerController called - UserId: ${userId}, WebContainerId: ${webContainerId}`);

  try {
    if (!userId) {
      logger.warn("User not authenticated for deleteWebContainerController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!webContainerId) {
      logger.warn("WebContainer ID is required for deleteWebContainerController");
      res.status(400).json({ message: "WebContainer ID is required" });
      return;
    }

    const success = await developmentService.deleteWebContainer(userId, webContainerId);

    if (!success) {
      logger.warn(`WebContainer not found for deletion - UserId: ${userId}, WebContainerId: ${webContainerId}`);
      res.status(404).json({ message: "WebContainer not found" });
      return;
    }

    logger.info(`WebContainer deleted successfully - UserId: ${userId}, WebContainerId: ${webContainerId}`);
    res.status(200).json({ message: "WebContainer deleted successfully" });
    return;
  } catch (error) {
    logger.error(`Error in deleteWebContainerController - UserId: ${userId}, WebContainerId: ${webContainerId}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ message: "Failed to delete webcontainer" });
    return;
  }
};
