import { Router } from "express";
import {
  generateBusinessPlanController,
  getBusinessPlanByIdController,
  updateBusinessPlanController,
  deleteBusinessPlanController,
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
businessPlanRoutes.post(
  `/${resourceName}/:projectId`,
  authenticate,
  checkQuota,
  generateBusinessPlanController
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
