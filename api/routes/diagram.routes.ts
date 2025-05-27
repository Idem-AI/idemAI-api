import { Router } from "express";
import {
  generateDiagramController,
  getDiagramsByProjectController,
  getDiagramByIdController,
  updateDiagramController,
  deleteDiagramController,
} from "../controllers/diagram.controller";
import { authenticate } from "../services/auth.service";

export const diagramRoutes = Router();

// Generate a new diagram for a project
diagramRoutes.post(
  "/projects/:projectId/diagrams",
  authenticate,
  generateDiagramController
);

// Get all diagrams for a specific project
diagramRoutes.get(
  "/projects/:projectId/diagrams",
  authenticate,
  getDiagramsByProjectController
);

// Get a specific diagram by its ID
diagramRoutes.get(
  "/diagrams/:diagramId",
  authenticate,
  getDiagramByIdController
);

// Update a specific diagram by its ID
diagramRoutes.put(
  "/diagrams/:diagramId",
  authenticate,
  updateDiagramController
);

// Delete a specific diagram by its ID
diagramRoutes.delete(
  "/diagrams/:diagramId",
  authenticate,
  deleteDiagramController
);
