import { Request, Response, NextFunction } from "express";
import { projectService } from "../services/project.service";
import { ProjectModel } from "../models/project.model"; // Assuming ProjectModel is an interface/type

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
  };
}

class ProjectController {
  async createProject(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      const projectData: Omit<
        ProjectModel,
        "id" | "createdAt" | "updatedAt" | "userId"
      > = req.body;
      if (!projectData.name || !projectData.description) {
        res
          .status(400)
          .json({
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
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.uid;
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
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // const userId = req.user?.uid;
      // if (!userId) {
      //   res.status(401).json({ message: 'User not authenticated' });
      //   return;
      // }
      const { projectId } = req.params;
      if (!projectId) {
        res.status(400).json({ message: "Project ID is required" });
        return;
      }
      const project = await projectService.getUserProjectById(
        "sA6ZeSlrP9Ri8tCNAncPNKi83Nz2",
        "5ULCb6EwpVWYGIUivAc0"
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
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.uid;
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
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.uid;
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
