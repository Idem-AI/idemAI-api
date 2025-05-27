import { Router } from "express";
import {
  generateBrandingController,
  getBrandingsByProjectController,
  getBrandingByIdController,
  updateBrandingController,
  deleteBrandingController,
} from "../controllers/branding.controller";
import { authenticate } from "../services/auth.service"; // Updated import path

export const brandingRoutes = Router();

// All routes are protected and project-specific where applicable

// Generate a new branding for a project
brandingRoutes.post(
  "/projects/:projectId/brandings",
  authenticate,
  generateBrandingController
);

// Get all brandings for a specific project
brandingRoutes.get(
  "/projects/:projectId/brandings",
  authenticate,
  getBrandingsByProjectController
);

// Get a specific branding by its ID
brandingRoutes.get(
  "/brandings/:brandingId",
  authenticate,
  getBrandingByIdController
);

// Update a specific branding by its ID
brandingRoutes.put(
  "/brandings/:brandingId",
  authenticate,
  updateBrandingController
);

// Delete a specific branding by its ID
brandingRoutes.delete(
  "/brandings/:brandingId",
  authenticate,
  deleteBrandingController
);
