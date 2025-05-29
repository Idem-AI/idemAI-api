import { Request, Response, NextFunction } from "express";
import { projectService } from "../services/project.service";
import { ProjectModel } from "../models/project.model"; // Assuming ProjectModel is an interface/type

class ProjectController {
  async createProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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
      if (!projectData.name || !projectData.description || !userId) {
        res.status(400).json({
          message: "Missing required project fields: name, description",
        });
        return;
      }
      const projectId = await projectService.createUserProject(
        userId,
        projectData
      );
      res
        .status(201)
        .json({ message: "Project created successfully", projectId });
    } catch (error) {
      console.error("Error in createProject controller:", error);
      next(error);
    }
  }

  async getAllProjects(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log("getAllProjects controller called");
      const { userId } = req.params;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const projects = await projectService.getAllUserProjects(userId);
      res.status(200).json(projects);
    } catch (error) {
      console.error("Error in getAllProjects controller:", error);
      next(error);
    }
  }

  async getProjectById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { projectId, userId } = req.params;
      if (!projectId || !userId) {
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
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.status(200).json(project);
    } catch (error) {
      console.error("Error in getProjectById controller:", error);
      next(error);
    }
  }

  async updateProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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
      if (Object.keys(updatedData).length === 0) {
        res.status(400).json({ message: "No update data provided" });
        return;
      }
      await projectService.editUserProject(userId, projectId, updatedData);
      res.status(200).json({ message: "Project updated successfully" });
    } catch (error) {
      console.error("Error in updateProject controller:", error);
      next(error);
    }
  }

  async deleteProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error in deleteProject controller:", error);
      next(error);
    }
  }
}

export const projectController = new ProjectController();
