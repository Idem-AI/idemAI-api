import { Router } from "express";
import {
  generateDiagramController,
  getDiagramsByProjectController,
  getDiagramByIdController,
  updateDiagramController,
  deleteDiagramController,
} from "../controllers/diagram.controller";
import { authenticate } from "../services/auth.service"; // Updated import path

export const diagramRoutes = Router();

const resourceName = "diagrams";

// All routes are protected and project-specific where applicable

// Generate a new diagram for a project
diagramRoutes.post(
  `/${resourceName}/generate/:projectId`,
  authenticate,
  generateDiagramController
);

// Get all diagrams for a specific project
diagramRoutes.get(
  `/${resourceName}/getAll/:projectId`,
  authenticate,
  getDiagramsByProjectController
);

// Get a specific diagram by its ID
diagramRoutes.get(
  `/${resourceName}/get/:diagramId`,
  authenticate,
  getDiagramByIdController
);

// Update a specific diagram by its ID
diagramRoutes.put(
  `/${resourceName}/update/:diagramId`,
  authenticate,
  updateDiagramController
);

// Delete a specific diagram by its ID
diagramRoutes.delete(
  `/${resourceName}/delete/:diagramId`,
  authenticate,
  deleteDiagramController
);
