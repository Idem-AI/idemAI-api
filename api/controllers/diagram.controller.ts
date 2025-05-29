import { Response } from "express";
import logger from "../config/logger";
import { DiagramService } from "../services/Diagrams/diagram.service";
import { CustomRequest } from "../interfaces/express.interface";

const diagramService = new DiagramService();

export const generateDiagramController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { projectId } = req.params;
  logger.info(
    `generateDiagramController called - UserId: ${userId}, ProjectId: ${projectId}`
  );
  try {
    if (!userId) {
      logger.warn("User not authenticated for generateDiagramController");
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    if (!projectId) {
      logger.warn("Project ID is required for generateDiagramController");
      res.status(400).json({ message: "Project ID is required" });
      return;
    }
    const diagram = await diagramService.generateDiagram(
      userId!,
      projectId,
      req.body
    );
    logger.info(
      `Diagram generated successfully - UserId: ${userId}, ProjectId: ${projectId}, DiagramId: ${diagram.id}`
    );
    res.status(201).json(diagram);
  } catch (error: any) {
    logger.error(
      `Error in generateDiagramController - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack, body: req.body }
    );
    res
      .status(500)
      .json({ message: "Error generating diagram", error: error.message });
  }
};

export const getDiagramsByProjectController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { projectId } = req.params;
  logger.info(
    `getDiagramsByProjectController called - UserId: ${userId}, ProjectId: ${projectId}`
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
    const diagrams = await diagramService.getDiagramsByProjectId(
      userId!,
      projectId
    );
    logger.info(
      `Diagrams fetched successfully for project - UserId: ${userId}, ProjectId: ${projectId}, Count: ${diagrams.length}`
    );
    res.status(200).json(diagrams);
  } catch (error: any) {
    logger.error(
      `Error in getDiagramsByProjectController - UserId: ${userId}, ProjectId: ${projectId}: ${error.message}`,
      { stack: error.stack }
    );
    res
      .status(500)
      .json({ message: "Error fetching diagrams", error: error.message });
  }
};

export const getDiagramByIdController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { diagramId } = req.params;
  logger.info(
    `getDiagramByIdController called - UserId: ${userId}, DiagramId: ${diagramId}`
  );
  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const diagram = await diagramService.getDiagramById(userId!, diagramId);
    if (diagram) {
      logger.info(
        `Diagram fetched successfully - UserId: ${userId}, DiagramId: ${diagram.id}`
      );
      res.status(200).json(diagram);
    } else {
      logger.warn(
        `Diagram not found - UserId: ${userId}, DiagramId: ${diagramId}`
      );
      res.status(404).json({ message: "Diagram not found" });
    }
  } catch (error: any) {
    logger.error(
      `Error in getDiagramByIdController - UserId: ${userId}, DiagramId: ${diagramId}: ${error.message}`,
      { stack: error.stack }
    );
    res
      .status(500)
      .json({ message: "Error fetching diagram", error: error.message });
  }
};

export const updateDiagramController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { diagramId } = req.params;
  logger.info(
    `updateDiagramController called - UserId: ${userId}, DiagramId: ${diagramId}`
  );
  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const diagram = await diagramService.updateDiagram(
      userId!,
      diagramId,
      req.body
    );
    if (diagram) {
      logger.info(
        `Diagram updated successfully - UserId: ${userId}, DiagramId: ${diagram.id}`
      );
      res.status(200).json(diagram);
    } else {
      logger.warn(
        `Diagram not found for update - UserId: ${userId}, DiagramId: ${diagramId}`
      );
      res.status(404).json({ message: "Diagram not found for update" });
    }
  } catch (error: any) {
    logger.error(
      `Error in updateDiagramController - UserId: ${userId}, DiagramId: ${diagramId}: ${error.message}`,
      { stack: error.stack, body: req.body }
    );
    res
      .status(500)
      .json({ message: "Error updating diagram", error: error.message });
  }
};

export const deleteDiagramController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  const { diagramId } = req.params;
  logger.info(
    `deleteDiagramController called - UserId: ${userId}, DiagramId: ${diagramId}`
  );
  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    await diagramService.deleteDiagram(userId!, diagramId);
    logger.info(
      `Diagram deleted successfully - UserId: ${userId}, DiagramId: ${diagramId}`
    );
    res.status(204).send();
  } catch (error: any) {
    logger.error(
      `Error in deleteDiagramController - UserId: ${userId}, DiagramId: ${diagramId}: ${error.message}`,
      { stack: error.stack }
    );
    res
      .status(500)
      .json({ message: "Error deleting diagram", error: error.message });
  }
};
