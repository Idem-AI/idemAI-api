import { Router } from "express";
import {
  generateBusinessPlanController,
  getBusinessPlansByProjectController,
  getBusinessPlanByIdController,
  updateBusinessPlanController,
  deleteBusinessPlanController,
} from "../controllers/businessPlan.controller";
import { authenticate } from "../services/auth.service";

export const businessPlanRoutes = Router();

const resourceName = "businessPlans";

// Generate a new business plan for a project
businessPlanRoutes.post(
  `/:projectId/${resourceName}`,

  generateBusinessPlanController
);

// Get all business plans for a specific project
businessPlanRoutes.get(
  `/:projectId/${resourceName}`,
  authenticate,
  getBusinessPlansByProjectController
);

// Get a specific business plan by its ID
businessPlanRoutes.get(
  `/${resourceName}/:itemId`,
  authenticate,
  getBusinessPlanByIdController
);

// Update a specific business plan by its ID
businessPlanRoutes.put(
  `/${resourceName}/:itemId`,
  authenticate,
  updateBusinessPlanController
);

// Delete a specific business plan by its ID
businessPlanRoutes.delete(
  `/${resourceName}/:itemId`,
  authenticate,
  deleteBusinessPlanController
);
