import { Router } from "express";
import {
  generateBrandingController,
  getBrandingsByProjectController,
  getBrandingByIdController,
  updateBrandingController,
  deleteBrandingController,
  generateLogoColorsAndTypographyController,
} from "../controllers/branding.controller";
import { authenticate } from "../services/auth.service"; // Updated import path

export const brandingRoutes = Router();

const resourceName = "brandings";

// All routes are protected and project-specific where applicable

// Generate a new branding for a project
brandingRoutes.post(
  `/${resourceName}/generate/:projectId`,
  authenticate,
  generateBrandingController
);

// Generate logo, colors, and typography for a project
brandingRoutes.post(
  `/${resourceName}/genColorsAndTypography/:projectId`,
  authenticate,
  generateLogoColorsAndTypographyController
);

// Get all brandings for a specific project
brandingRoutes.get(
  `/${resourceName}/getAll/:projectId`,
  authenticate,
  getBrandingsByProjectController
);

// Get a specific branding by its ID
brandingRoutes.get(
  `/${resourceName}/get/:brandingId`,
  authenticate,
  getBrandingByIdController
);

// Update a specific branding by its ID
brandingRoutes.put(
  `/${resourceName}/update/:brandingId`,
  authenticate,
  updateBrandingController
);

// Delete a specific branding by its ID
brandingRoutes.delete(
  `/${resourceName}/delete/:brandingId`,
  authenticate,
  deleteBrandingController
);
