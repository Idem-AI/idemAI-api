import { Router } from 'express';
import {
  generateDevelopmentController,
  getDevelopmentsByProjectController,
  getDevelopmentByIdController,
  updateDevelopmentController,
  deleteDevelopmentController,
} from '../controllers/development.controller';
import { authenticate } from '../services/auth.service';

export const developmentRoutes = Router();

// Generate a new development item for a project
developmentRoutes.post('/projects/:projectId/developments', authenticate, generateDevelopmentController);

// Get all development items for a specific project
developmentRoutes.get('/projects/:projectId/developments', authenticate, getDevelopmentsByProjectController);

// Get a specific development item by its ID
developmentRoutes.get('/developments/:developmentId', authenticate, getDevelopmentByIdController);

// Update a specific development item by its ID
developmentRoutes.put('/developments/:developmentId', authenticate, updateDevelopmentController);

// Delete a specific development item by its ID
developmentRoutes.delete('/developments/:developmentId', authenticate, deleteDevelopmentController);
