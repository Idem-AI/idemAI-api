import { Router } from "express";
import {
  getBrandingsByProjectController,
  getBrandingByIdController,
  updateBrandingController,
  deleteBrandingController,
  generateColorsAndTypographyController,
  generateLogoConceptsController,
  generateLogoVariationsController,
  generateBrandingStreamingController,
  generateBrandingPdfController,
} from "../controllers/branding.controller";
import { authenticate } from "../services/auth.service"; // Updated import path
import { checkQuota } from "../middleware/quota.middleware";
import { checkPolicyAcceptance } from "../middleware/policyCheck.middleware";

export const brandingRoutes = Router();

const resourceName = "brandings";

// All routes are protected and project-specific where applicable

// Generate a new branding for a project
/**
 * @openapi
 * /brandings/generate/{projectId}:
 *   post:
 *     tags:
 *       - Branding
 *     summary: Generate a new branding identity for a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project for which to generate branding.
 *     requestBody:
 *       description: Optional initial data for branding generation.
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Optional initial name for the branding.
 *               description:
 *                 type: string
 *                 description: Optional initial description for the branding.
 *     responses:
 *       '201':
 *         description: Branding identity generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrandIdentityModel'
 *       '400':
 *         description: Bad request.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Project not found.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.post(
  "/generate/:projectId",
  authenticate,
  checkPolicyAcceptance,
  checkQuota,
  generateBrandingStreamingController
);

// Generate logo, colors, and typography for a project
/**
 * @openapi
 * /colors-typography:
 *   post:
 *     tags:
 *       - Branding
 *     summary: Generate logo, colors, and typography based on project and theme
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: The ID of the project to generate assets for.
 *               themeDescription:
 *                 type: string
 *                 description: A description of the theme or keywords to guide generation.
 *                 nullable: true
 *               brandingId:
 *                  type: string
 *                  description: Optional ID of an existing branding to associate with or update.
 *                  nullable: true
 *     responses:
 *       '200':
 *         description: Logo, colors, and typography generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LogoModel'
 *                 colors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ColorModel'
 *                 typography:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TypographyModel'
 *       '400':
 *         description: Bad request.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Project or Branding not found.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.post(
  "/colors-typography",
  authenticate,
  checkPolicyAcceptance,
  checkQuota,
  generateColorsAndTypographyController
);

// Étape 1: Generate logo concepts only (new 3-step approach)
/**
 * @openapi
 * /logo-concepts/{projectId}:
 *   post:
 *     tags:
 *       - Branding
 *     summary: Generate 4 logo concepts for a project (Step 1 of 3)
 *     description: Generates 4 main logo concepts with text, without variations. Part of the new 3-step logo generation process.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project.
 *     requestBody:
 *       description: Project data for logo concept generation.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project:
 *                 type: object
 *                 description: Project object containing project details.
 *               colors:
 *                 type: object
 *                 description: Color palette for the project.
 *               typography:
 *                 type: object
 *                 description: Typography settings for the project.
 *     responses:
 *       '200':
 *         description: Logo concepts generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LogoModel'
 *       '400':
 *         description: Bad request.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.post(
  "/logo-concepts/:projectId",
  authenticate,
  checkPolicyAcceptance,
  checkQuota,
  generateLogoConceptsController
);

// Étape 2: Generate logo variations for selected logo
/**
 * @openapi
 * /logo-variations:
 *   post:
 *     tags:
 *       - Branding
 *     summary: Generate variations for a selected logo (Step 2 of 3)
 *     description: Generates lightBackground, darkBackground, and monochrome variations for a selected logo SVG.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Selected logo SVG for variation generation.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selectedLogoSvg:
 *                 type: string
 *                 description: The SVG content of the selected logo.
 *     responses:
 *       '200':
 *         description: Logo variations generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 variations:
 *                   type: object
 *                   properties:
 *                     lightBackground:
 *                       type: string
 *                       description: SVG optimized for light backgrounds.
 *                     darkBackground:
 *                       type: string
 *                       description: SVG optimized for dark backgrounds.
 *                     monochrome:
 *                       type: string
 *                       description: Monochrome SVG version.
 *       '400':
 *         description: Bad request.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.post(
  "/logo-variations",
  authenticate,
  checkPolicyAcceptance,
  checkQuota,
  generateLogoVariationsController
);



// Get all brandings for a specific project
/**
 * @openapi
 * /brandings/getAll/{projectId}:
 *   get:
 *     tags:
 *       - Branding
 *     summary: Retrieve all branding identities for a specific project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project whose brandings are to be retrieved.
 *     responses:
 *       '200':
 *         description: A list of branding identities.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BrandIdentityModel'
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Project not found.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.get(
  `/${resourceName}/getAll/:projectId`,
  authenticate,
  getBrandingsByProjectController
);

// Get a specific branding by its ID
/**
 * @openapi
 * /brandings/get/{projectId}:
 *   get:
 *     tags:
 *       - Branding
 *     summary: Retrieve a specific branding identity by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the branding identity to retrieve.
 *     responses:
 *       '200':
 *         description: Details of the branding identity.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrandIdentityModel'
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Branding identity not found.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.get(
  `/${resourceName}/get/:projectId`,
  authenticate,
  getBrandingByIdController
);

// Update a specific branding by its ID
/**
 * @openapi
 * /brandings/update/{projectId}:
 *   put:
 *     tags:
 *       - Branding
 *     summary: Update an existing branding identity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the branding identity to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBrandingDto'
 *     responses:
 *       '200':
 *         description: Branding identity updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrandIdentityModel'
 *       '400':
 *         description: Bad request (e.g., validation error).
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Branding identity not found.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.put(
  `/${resourceName}/update/:projectId`,
  authenticate,
  updateBrandingController
);

// Delete a specific branding by its ID
/**
 * @openapi
 * /brandings/delete/{projectId}:
 *   delete:
 *     tags:
 *       - Branding
 *     summary: Delete a branding identity by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the branding identity to delete.
 *     responses:
 *       '200':
 *         description: Branding identity deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branding identity deleted successfully.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Branding identity not found.
 *       '500':
 *         description: Internal server error.
 */
brandingRoutes.delete(
  `/${resourceName}/delete/:projectId`,
  authenticate,
  deleteBrandingController
);

// Generate PDF from branding sections
/**
 * @openapi
 * /brandings/pdf/{projectId}:
 *   get:
 *     tags:
 *       - Branding
 *     summary: Generate and download a PDF document from branding sections
 *     description: Creates a PDF document containing all branding sections for a project in A4 format
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project whose branding sections will be converted to PDF
 *     responses:
 *       '200':
 *         description: PDF generated and returned successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: Attachment with filename
 *             schema:
 *               type: string
 *               example: 'attachment; filename="branding-{projectId}.pdf"'
 *           Content-Type:
 *             description: MIME type of the response
 *             schema:
 *               type: string
 *               example: 'application/pdf'
 *       '400':
 *         description: Bad request - Project ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project ID is required"
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not authenticated"
 *       '404':
 *         description: Project not found or no branding sections available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No branding sections found for project {projectId}"
 *       '500':
 *         description: Internal server error during PDF generation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error generating branding PDF"
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
// Middleware pour augmenter le timeout pour la génération PDF
const pdfTimeout = (req: any, res: any, next: any) => {
  req.setTimeout(180000); // 3 minutes
  res.setTimeout(180000); // 3 minutes
  next();
};

brandingRoutes.get(
  `/${resourceName}/pdf/:projectId`,
  authenticate,
  pdfTimeout,
  generateBrandingPdfController
);
