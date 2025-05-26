import { Router } from 'express';
import {
  generatePlanningItemController,
  getPlanningItemsByProjectController,
  getPlanningItemByIdController,
  updatePlanningItemController,
  deletePlanningItemController,
} from '../controllers/projectPlanningItem.controller';
import { authenticate } from '../services/auth.service';

export const projectPlanningItemRoutes = Router();

const resourceName = 'plannings'; // Corresponds to TargetModelType.PLANNING

// Generate a new planning item for a project
projectPlanningItemRoutes.post(`/projects/:projectId/${resourceName}`, authenticate, generatePlanningItemController);

// Get all planning items for a specific project
projectPlanningItemRoutes.get(`/projects/:projectId/${resourceName}`, authenticate, getPlanningItemsByProjectController);

// Get a specific planning item by its ID
projectPlanningItemRoutes.get(`/${resourceName}/:itemId`, authenticate, getPlanningItemByIdController);

// Update a specific planning item by its ID
projectPlanningItemRoutes.put(`/${resourceName}/:itemId`, authenticate, updatePlanningItemController);

// Delete a specific planning item by its ID
projectPlanningItemRoutes.delete(`/${resourceName}/:itemId`, authenticate, deletePlanningItemController);
