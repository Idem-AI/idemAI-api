import { Router } from "express";
import {
  generateDeploymentController,
  getDeploymentsByProjectController,
  getDeploymentByIdController,
  updateDeploymentController,
  deleteDeploymentController,
} from "../controllers/deployment.controller";
import { authenticate } from "../services/auth.service";

export const deploymentRoutes = Router();

const resourceName = "deployments"; // Corresponds to TargetModelType.DEPLOYMENT

// Generate a new deployment for a project
deploymentRoutes.post(
  `${resourceName}/generate/:projectId`,
  authenticate,
  generateDeploymentController
);

// Get all deployments for a specific project
deploymentRoutes.get(
  `${resourceName}/getAll/:projectId`,
  authenticate,
  getDeploymentsByProjectController
);

// Get a specific deployment by its ID
deploymentRoutes.get(
  `${resourceName}/get/:deploymentId`,
  authenticate,
  getDeploymentByIdController
);

// Update a specific deployment by its ID
deploymentRoutes.put(
  `${resourceName}/update/:deploymentId`,
  authenticate,
  updateDeploymentController
);

// Delete a specific deployment by its ID
deploymentRoutes.delete(
  `${resourceName}/delete/:deploymentId`,
  authenticate,
  deleteDeploymentController
);
