import { Router } from "express";
import { projectController } from "../controllers/project.controller";
import { authenticate } from "../services/auth.service";

export const projectRoutes = Router();

// Create a new project
projectRoutes.post("/", authenticate, projectController.createProject);

// Get all projects for the authenticated user
projectRoutes.get("/", authenticate, projectController.getAllProjects);

// Get a specific project by ID
projectRoutes.get("/:projectId", projectController.getProjectById);

// Update a specific project by ID
projectRoutes.put("/:projectId", authenticate, projectController.updateProject);

// Delete a specific project by ID
projectRoutes.delete(
  "/:projectId",
  authenticate,
  projectController.deleteProject
);
