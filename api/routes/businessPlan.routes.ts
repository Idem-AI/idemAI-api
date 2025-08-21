import { Router } from "express";
import {
  getBusinessPlanByIdController,
  updateBusinessPlanController,
  deleteBusinessPlanController,
  generateBusinessPlanStreamingController,
  generateBusinessPlanPdfController,
} from "../controllers/businessPlan.controller";
import { authenticate } from "../services/auth.service";
import { checkQuota } from "../middleware/quota.middleware";

export const businessPlanRoutes = Router();

const resourceName = "businessPlans";

// Generate a new business plan for a project
/**
 * @openapi
 * /businessPlans/{projectId}:
 *   post:
 *     tags:
 *       - Business Plans
 *     summary: Generate a new business plan for a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project for which to generate the business plan.
 *     requestBody:
 *       description: Optional initial data for business plan generation.
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Optional initial title for the business plan.
 *               templateId:
 *                 type: string
 *                 description: Optional ID of a template to use for generation.
 *                 nullable: true
 *     responses:
 *       '201':
 *         description: Business plan generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessPlanModel'
 *       '400':
 *         description: Bad request.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Project not found.
 *       '500':
 *         description: Internal server error.
 */
businessPlanRoutes.get(
  `/${resourceName}/generate/:projectId`,
  authenticate,
  checkQuota,
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
businessPlanRoutes.get(
  `/${resourceName}/pdf/:projectId`,
  authenticate,
  generateBusinessPlanPdfController
);
