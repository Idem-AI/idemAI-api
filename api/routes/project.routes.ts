import { Router } from "express";
import { projectController } from "../controllers/project.controller";
import { authenticate } from "../services/auth.service";

export const projectRoutes = Router();

// Create a new project
projectRoutes.post("/create", projectController.createProject);

// Get all projects for the authenticated user
projectRoutes.get("/getAll", authenticate, projectController.getAllProjects);

// Get a specific project by ID
projectRoutes.get(
  "/get/:projectId",
  authenticate,
  projectController.getProjectById
);

// Update a specific project by ID
projectRoutes.put("/:projectId", authenticate, projectController.updateProject);

// Delete a specific project by ID
projectRoutes.delete(
  "/delete/:projectId",
  authenticate,
  projectController.deleteProject
);
