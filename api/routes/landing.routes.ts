import { Router } from 'express';
import {
  generateLandingController,
  getLandingsByProjectController,
  getLandingByIdController,
  updateLandingController,
  deleteLandingController,
} from '../controllers/landing.controller';
import { authenticate } from '../services/auth.service';

export const landingRoutes = Router();

// Generate new landing page data for a project
landingRoutes.post('/projects/:projectId/landings', authenticate, generateLandingController);

// Get all landing page data for a specific project
landingRoutes.get('/projects/:projectId/landings', authenticate, getLandingsByProjectController);

// Get specific landing page data by its ID
landingRoutes.get('/landings/:landingId', authenticate, getLandingByIdController);

// Update specific landing page data by its ID
landingRoutes.put('/landings/:landingId', authenticate, updateLandingController);

// Delete specific landing page data by its ID
landingRoutes.delete('/landings/:landingId', authenticate, deleteLandingController);
