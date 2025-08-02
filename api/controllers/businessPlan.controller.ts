import { Response } from "express";
import { CustomRequest } from "../interfaces/express.interface";
import { BusinessPlanService } from "../services/BusinessPlan/businessPlan.service";
import { PromptService } from "../services/prompt.service";
import logger from "../config/logger";
import { userService } from "../services/user.service";
import { ISectionResult } from "../services/common/generic.service";

// Create instances of the services
const promptService = new PromptService();
const businessPlanService = new BusinessPlanService(promptService);

export const generateBusinessPlanController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { projectId } = req.params;
  logger.info(
    `generateBusinessPlanController called - UserId (from token): ${userId}, ProjectId: ${projectId}`
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for generateBusinessPlanController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!projectId) {
      logger.warn("Project ID is required for generateBusinessPlanController");
      res.status(400).json({ message: "Project ID is required" });
      return;
    }
    const item = await businessPlanService.generateBusinessPlanWithStreaming(
      userId, // Use userId from token
      projectId
    );
    if (item) {
      logger.info(
        `Business plan generated successfully (Project updated) - UserId: ${userId}, ProjectId: ${projectId}, UpdatedProjectId: ${item.id}`
      );
      userService.incrementUsage(userId,1);
      res.status(201).json(item);
    } else {
      logger.warn(
        `Business plan generation returned null (Project not updated) - UserId: ${userId}, ProjectId: ${projectId}`
      );
      res.status(500).json({
        message: "Failed to generate business plan and update project",
      });
    }
  } catch (error: any) {
    logger.error(
      `Error in generateBusinessPlanController - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
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
      logger.warn(
        "User not authenticated for getBusinessPlansByProjectController"
      );
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!projectId) {
      logger.warn(
        "Project ID is required for getBusinessPlansByProjectController"
      );
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
      res
        .status(404)
        .json({ message: "Business plan not found for the project" });
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
  const { projectId } = req.params;
  logger.info(
    `getBusinessPlanByIdController (acting as getByProjectId) called - UserId: ${userId}, ProjectId: ${projectId}`
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for getBusinessPlanByIdController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const businessPlan = await businessPlanService.getBusinessPlansByProjectId(
      userId,
      projectId
    );
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

export const generateBusinessPlanStreamingController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { projectId } = req.params;
  const userId = req.user?.uid;
  logger.info(
    `generateBusinessPlanStreamingController called - UserId: ${userId}, ProjectId: ${projectId}`
  );

  try {
    if (!userId) {
      logger.warn(
        "User not authenticated for generateBusinessPlanStreamingController"
      );
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!projectId) {
      logger.warn(
        "Project ID is required for generateBusinessPlanStreamingController"
      );
      res.status(400).json({ message: "Project ID is required" });
      return;
    }

    // Configuration pour SSE (Server-Sent Events)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Pour Nginx

    // Fonction de callback pour envoyer chaque résultat d'étape
    const streamCallback = async (stepResult: ISectionResult) => {
      try {
        // Déterminer le type d'événement
        const eventType = stepResult.parsedData?.status || "progress";

        // Créer un message structuré pour le frontend
        const message = {
          type: eventType, // 'started', 'completed', 'progress'
          stepName: stepResult.name,
          data: stepResult.data,
          summary: stepResult.summary,
          timestamp: new Date().toISOString(),
          ...(stepResult.parsedData && { parsedData: stepResult.parsedData }),
        };

        // Formatage du message SSE
        res.write(`data: ${JSON.stringify(message)}\n\n`);
        // On force l'envoi immédiat si la fonction flush est disponible
        (res as any).flush?.();

        logger.info(
          `Streamed step ${eventType} - UserId: ${userId}, ProjectId: ${projectId}, Step: ${stepResult.name}`
        );
      } catch (error: any) {
        logger.error(
          `Error streaming step result - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
          { stack: error.stack }
        );
      }
    };

    // Appel au service avec le callback de streaming
    const updatedProject = await businessPlanService.generateBusinessPlanWithStreaming(
      userId,
      projectId,
      streamCallback // Passer le callback de streaming
    );

    if (!updatedProject) {
      logger.warn(
        `Failed to generate business plan - UserId: ${userId}, ProjectId: ${projectId}`
      );
      res.write(
        `data: ${JSON.stringify({ error: "Failed to generate business plan" })}\n\n`
      );
      res.end();
      return;
    }

    // Obtenir le business plan du projet mis à jour
    const newBusinessPlan = updatedProject.analysisResultModel?.businessPlan;

    logger.info(
      `Business plan generation completed - UserId: ${userId}, ProjectId: ${projectId}`
    );
    userService.incrementUsage(userId, 1);

    // Envoyer un événement de fin
    res.write(
      `data: ${JSON.stringify({ type: "complete", businessPlan: newBusinessPlan })}\n\n`
    );
    res.end();
  } catch (error: any) {
    logger.error(
      `Error in generateBusinessPlanStreamingController - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack, body: req.body }
    );

    // Envoyer une erreur et terminer le stream
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};
