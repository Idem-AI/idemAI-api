import { Request, Response, NextFunction } from "express";
import { projectService } from "../services/project.service";
import { ProjectModel } from "../models/project.model"; // Assuming ProjectModel is an interface/type
import logger from "../config/logger";

class ProjectController {
  async createProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    logger.info(`Attempting to create project. UserID from body: ${req.body.userId}`);
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const projectData: Omit<
        ProjectModel,
        "id" | "createdAt" | "updatedAt" | "userId"
      > = req.body;
      if (!projectData.name || !projectData.description) { // userId check is already done above
        logger.warn(`Create project attempt failed for userId ${userId}: Missing required fields (name or description).`);
        res.status(400).json({
          message: "Missing required project fields: name, description",
        });
        return;
      }
      const projectId = await projectService.createUserProject(
        userId,
        projectData
      );
      logger.info(`Project created successfully for userId ${userId} with projectId: ${projectId}`);
      res
        .status(201)
        .json({ message: "Project created successfully", projectId });
    } catch (error: any) {
      logger.error(`Error in createProject controller for userId ${req.body.userId}: ${error.message}`, { stack: error.stack, details: error });
      next(error);
    }
  }

  async getAllProjects(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    logger.info(`Attempting to get all projects for userId from params: ${req.params.userId}`);
    try {
      
      const { userId } = req.params;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const projects = await projectService.getAllUserProjects(userId);
      logger.info(`Successfully fetched ${projects.length} projects for userId ${userId}.`);
      res.status(200).json(projects);
    } catch (error: any) {
      logger.error(`Error in getAllProjects controller for userId ${req.params.userId}: ${error.message}`, { stack: error.stack, details: error });
      next(error);
    }
  }

  async getProjectById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    logger.info(`Attempting to get project by ID. ProjectId: ${req.params.projectId}, UserId: ${req.params.userId}`);
    try {
      const { projectId, userId } = req.params;
      if (!projectId || !userId) {
        logger.warn('Get project by ID failed: Project ID or User ID missing in params.');
        res
          .status(400)
          .json({ message: "Project ID and User ID are required" });
        return;
      }
      const project = await projectService.getUserProjectById(
        userId,
        projectId
      );
      if (!project) {
        logger.warn(`Get project by ID: Project ${projectId} not found for user ${userId}.`);
        res.status(404).json({ message: "Project not found" });
        return;
      }
      logger.info(`Successfully fetched project ${projectId} for user ${userId}.`);
      res.status(200).json(project);
    } catch (error: any) {
      logger.error(`Error in getProjectById controller for projectId ${req.params.projectId}, userId ${req.params.userId}: ${error.message}`, { stack: error.stack, details: error });
      next(error);
    }
  }

  async updateProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    logger.info(`Attempting to update project. ProjectId: ${req.params.projectId}, UserId from body: ${req.body.userId}`);
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const { projectId } = req.params;
      const updatedData: Partial<
        Omit<ProjectModel, "id" | "createdAt" | "updatedAt" | "userId">
      > = req.body;
      if (!projectId) {
        res.status(400).json({ message: "Project ID is required" });
        return;
      }
      if (Object.keys(updatedData).length === 0 || (Object.keys(updatedData).length === 1 && Object.keys(updatedData).includes('userId'))) {
        logger.warn(`Update project attempt failed for projectId ${projectId}, userId ${userId}: No update data provided.`);
        res.status(400).json({ message: "No update data provided" });
        return;
      }
      await projectService.editUserProject(userId, projectId, updatedData);
      logger.info(`Project ${projectId} updated successfully for userId ${userId}.`);
      res.status(200).json({ message: "Project updated successfully" });
    } catch (error: any) {
      logger.error(`Error in updateProject controller for projectId ${req.params.projectId}, userId ${req.body.userId}: ${error.message}`, { stack: error.stack, details: error });
      next(error);
    }
  }

  async deleteProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    logger.info(`Attempting to delete project. ProjectId: ${req.params.projectId}, UserId from body: ${req.body.userId}`);
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const { projectId } = req.params;
      if (!projectId) {
        res.status(400).json({ message: "Project ID is required" });
        return;
      }
      await projectService.deleteUserProject(userId, projectId);
      logger.info(`Project ${projectId} deleted successfully for userId ${userId}.`);
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error: any) {
      logger.error(`Error in deleteProject controller for projectId ${req.params.projectId}, userId ${req.body.userId}: ${error.message}`, { stack: error.stack, details: error });
      next(error);
    }
  }

  // Method to generate agentic zip (restored and with logging)
  async generateProjectAgenticZip(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { projectId } = req.params;
    // @ts-ignore check for user property from auth middleware
    const userId = req.user?.uid || req.body.userId; 

    logger.info(
      `Attempting to generate agentic zip for projectId: ${projectId}, userId: ${userId}`
    );

    if (!userId) {
      logger.warn(
        `Generate agentic zip failed for projectId ${projectId}: User not authenticated.`
      );
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    try {
      const zipBuffer = await projectService.generateAgenticZip(
        userId,
        projectId
      );

      if (!zipBuffer) {
        logger.warn(
          `Agentic zip generation failed for projectId ${projectId}, userId: ${userId} - no zip buffer returned.`
        );
        res.status(404).json({ message: "Project not found or unable to generate ZIP." });
        return;
      }

      logger.info(
        `Successfully generated agentic zip for projectId: ${projectId}, userId: ${userId}`
      );
      res.setHeader("Content-Disposition", `attachment; filename=${projectId}_agentic_structure.zip`);
      res.setHeader("Content-Type", "application/zip");
      res.send(zipBuffer);
    } catch (error: any) {
      logger.error(
        `Error in generateProjectAgenticZip controller for projectId ${projectId}, userId ${userId}: ${error.message}`,
        { stack: error.stack, details: error }
      );
      next(error);
    }
  }
}

export const projectController = new ProjectController();
