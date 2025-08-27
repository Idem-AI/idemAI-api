import { Router } from "express";
import {
  getBusinessPlanByIdController,
  updateBusinessPlanController,
  deleteBusinessPlanController,
  generateBusinessPlanStreamingController,
  generateBusinessPlanPdfController,
  generateBusinessPlanWithAdditionalInfosController,
} from "../controllers/businessPlan.controller";
import { authenticate } from "../services/auth.service";
import { checkQuota } from "../middleware/quota.middleware";
import multer from "multer";

export const businessPlanRoutes = Router();

const resourceName = "businessPlans";

// Configuration multer pour l'upload d'images des team members
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 20, // Max 20 files (team members)
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Generate a new business plan for a project (streaming with optional additional infos)
/**
 * @openapi
 * /businessPlans/generate/{projectId}:
 *   get:
 *     tags:
 *       - Business Plans
 *     summary: Generate a business plan with real-time streaming (supports optional additional infos via multipart)
 *     description: Creates a business plan with streaming progress. Optionally supports additional company information and team member images via multipart/form-data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project for which to generate the business plan
 *     requestBody:
 *       description: Optional additional company information and team member images
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Company contact email (if provided, teamMembers is required)
 *               phone:
 *                 type: string
 *                 description: Company phone number
 *               address:
 *                 type: string
 *                 description: Company address
 *               city:
 *                 type: string
 *                 description: Company city
 *               country:
 *                 type: string
 *                 description: Company country
 *               zipCode:
 *                 type: string
 *                 description: Company zip code
 *               teamMembers:
 *                 type: string
 *                 description: JSON string containing team members information (required if email provided)
 *               teamMemberImage_0:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture for team member at index 0
 *               teamMemberImage_1:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture for team member at index 1
 *     responses:
 *       '200':
 *         description: Server-Sent Events stream with business plan generation progress
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: SSE stream with JSON messages containing step progress and final result with optional uploaded images
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
businessPlanRoutes.get(
  `/${resourceName}/generate/:projectId`,
  authenticate,
  checkQuota,
  upload.any(), // Support multipart pour les additional infos optionnelles
  generateBusinessPlanStreamingController
);

// Get a specific business plan by its project ID
/**
 * @openapi
 * /businessPlans/{projectId}:
 *   get:
 *     tags:
 *       - Business Plans
 *     summary: Retrieve a specific business plan by its project ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business plan to retrieve.
 *     responses:
 *       '200':
 *         description: Details of the business plan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessPlanModel'
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Business plan not found.
 *       '500':
 *         description: Internal server error.
 */
businessPlanRoutes.get(
  `/${resourceName}/:projectId`,
  authenticate,
  getBusinessPlanByIdController
);

// Update a specific business plan by its project ID
/**
 * @openapi
 * /businessPlans/{projectId}:
 *   put:
 *     tags:
 *       - Business Plans
 *     summary: Update an existing business plan by its project ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business plan to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBusinessPlanDto'
 *     responses:
 *       '200':
 *         description: Business plan updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessPlanModel'
 *       '400':
 *         description: Bad request (e.g., validation error).
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Business plan not found.
 *       '500':
 *         description: Internal server error.
 */
businessPlanRoutes.put(
  `/${resourceName}/:projectId`,
  authenticate,
  updateBusinessPlanController
);

// Delete a specific business plan by its project ID
/**
 * @openapi
 * /businessPlans/{projectId}:
 *   delete:
 *     tags:
 *       - Business Plans
 *     summary: Delete a business plan by its project ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the business plan to delete.
 *     responses:
 *       '200':
 *         description: Business plan deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business plan deleted successfully.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Business plan not found.
 *       '500':
 *         description: Internal server error.
 */
businessPlanRoutes.delete(
  `/${resourceName}/:projectId`,
  authenticate,
  deleteBusinessPlanController
);

// Generate PDF from business plan sections
/**
 * @openapi
 * /businessPlans/pdf/{projectId}:
 *   get:
 *     tags:
 *       - Business Plans
 *     summary: Generate and download a PDF document from business plan sections
 *     description: Creates a PDF document containing all business plan sections for a project in A4 format
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project whose business plan sections will be converted to PDF
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
 *               example: 'attachment; filename="business-plan-{projectId}.pdf"'
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
 *         description: Project not found or no business plan sections available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No business plan sections found for project {projectId}"
 *       '500':
 *         description: Internal server error during PDF generation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error generating business plan PDF"
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

businessPlanRoutes.get(
  `/${resourceName}/pdf/:projectId`,
  authenticate,
  pdfTimeout,
  generateBusinessPlanPdfController
);

// Generate business plan with additional informations (non-streaming)
/**
 * @openapi
 * /businessPlans/with-infos/{projectId}:
 *   post:
 *     tags:
 *       - Business Plans
 *     summary: Generate a business plan with additional company informations and team member images
 *     description: Creates a business plan including additional company details and uploads team member profile pictures
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project for which to generate the business plan
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Company contact email
 *               phone:
 *                 type: string
 *                 description: Company phone number
 *               address:
 *                 type: string
 *                 description: Company address
 *               city:
 *                 type: string
 *                 description: Company city
 *               country:
 *                 type: string
 *                 description: Company country
 *               zipCode:
 *                 type: string
 *                 description: Company zip code
 *               teamMembers:
 *                 type: string
 *                 description: JSON string containing team members information (without images)
 *                 example: '[{"name":"John Doe","role":"CEO","email":"john@example.com","bio":"Experienced leader","socialLinks":{"linkedin":"https://linkedin.com/in/johndoe"}}]'
 *               teamMemberImage_0:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture for team member at index 0
 *               teamMemberImage_1:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture for team member at index 1
 *             required:
 *               - email
 *               - teamMembers
 *     responses:
 *       '201':
 *         description: Business plan generated successfully with additional informations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerateBusinessPlanResponse'
 *       '400':
 *         description: Bad request - Missing required fields or invalid format
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
businessPlanRoutes.post(
  `/${resourceName}/with-infos/:projectId`,
  authenticate,
  checkQuota,
  upload.any(), // Accept multiple files with any field names
  generateBusinessPlanWithAdditionalInfosController
);

