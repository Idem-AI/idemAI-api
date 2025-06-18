import { Router } from "express";
import { authenticate } from "../services/auth.service";
import {
  CreateDeploymentController,
  GetDeploymentsByProjectController,
  GetDeploymentByIdController,
  UpdateDeploymentController,
  DeleteDeploymentController,
  UpdateGitConfigController,
  UpdateEnvironmentVariablesController,
  UpdateArchitectureComponentsController,
  AddChatMessageController,
  StartPipelineController,
  GetPipelineStatusController,
  EstimateCostController,
  GenerateDeploymentController,
} from "../controllers/deployment.controller";

export const deploymentRoutes = Router();
const resourceName = "/deployments";

// Core CRUD Routes
/**
 * @openapi
 * /deployments/generate:
 *   post:
 *     tags:
 *       - Deployments
 *     summary: Generate a new deployment configuration
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Optional initial data for the deployment.
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Optional initial name for the deployment.
 *               description:
 *                 type: string
 *                 description: Optional description for the deployment.
 *     responses:
 *       '201':
 *         description: Deployment configuration generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeploymentModel'
 *       '400':
 *         description: Bad request.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Project not found.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.post(
  `${resourceName}/generate`,
  authenticate,
  GenerateDeploymentController
);

/**
 * @openapi
 * /deployments/getByProject/{projectId}:
 *   get:
 *     tags:
 *       - Deployments
 *     summary: Retrieve all deployments for a specific project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project whose deployments are to be retrieved.
 *     responses:
 *       '200':
 *         description: A list of deployments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeploymentModel'
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Project not found.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.get(
  `${resourceName}/getByProject/:projectId`,
  authenticate,
  GetDeploymentsByProjectController
);

/**
 * @openapi
 * /deployments/get/{deploymentId}:
 *   get:
 *     tags:
 *       - Deployments
 *     summary: Retrieve a specific deployment by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to retrieve.
 *     responses:
 *       '200':
 *         description: Details of the deployment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeploymentModel'
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Deployment not found.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.get(
  `${resourceName}/get/:deploymentId`,
  authenticate,
  GetDeploymentByIdController
);

/**
 * @openapi
 * /deployments/update/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments
 *     summary: Update an existing deployment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDeploymentDto' # Assuming UpdateDeploymentDto exists
 *     responses:
 *       '200':
 *         description: Deployment updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeploymentModel'
 *       '400':
 *         description: Bad request (e.g., validation error).
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Deployment not found.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.put(
  `${resourceName}/update/:deploymentId`,
  authenticate,
  UpdateDeploymentController
);

/**
 * @openapi
 * /deployments/delete/{deploymentId}:
 *   delete:
 *     tags:
 *       - Deployments
 *     summary: Delete a deployment by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to delete.
 *     responses:
 *       '200':
 *         description: Deployment deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deployment deleted successfully.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Deployment not found.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.delete(
  `${resourceName}/delete/:deploymentId`,
  authenticate,
  DeleteDeploymentController
);

// Configuration Update Routes
/**
 * @openapi
 * /deployments/updateGitConfig/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments Configuration
 *     summary: Update Git repository configuration
 *     description: Updates the Git repository settings for a specific deployment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGitRepositoryConfigDto'
 *     responses:
 *       '200':
 *         description: Git repository configuration updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Git repository configuration updated successfully.'
 *                 deployment:
 *                   $ref: '#/components/schemas/DeploymentModel' # Assuming you'll define DeploymentModel schema
 *       '400':
 *         description: Bad request (e.g., validation error).
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Deployment not found.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.put(
  `${resourceName}/updateGitConfig/:deploymentId`,
  authenticate,
  UpdateGitConfigController
);

/**
 * @openapi
 * /deployments/updateEnvVars/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments Configuration
 *     summary: Update environment variables
 *     description: Updates the environment variables for a specific deployment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEnvironmentVariablesDto'
 *     responses:
 *       '200':
 *         description: Environment variables updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Environment variables updated successfully.'
 *                 deployment:
 *                   $ref: '#/components/schemas/DeploymentModel'
 *       '400':
 *         description: Bad request (e.g., validation error).
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Deployment not found.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.put(
  `${resourceName}/updateEnvVars/:deploymentId`,
  authenticate,
  UpdateEnvironmentVariablesController
);

/**
 * @openapi
 * /deployments/updateChatMessages/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments Configuration
 *     summary: Update chat messages
 *     description: Updates the chat messages for a specific deployment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateChatMessagesDto'
 *     responses:
 *       '200':
 *         description: Chat messages updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Chat messages updated successfully.'
 *                 deployment:
 *                   $ref: '#/components/schemas/DeploymentModel'
 *       '400':
 *         description: Bad request (e.g., validation error).
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Deployment not found.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.put(
  `${resourceName}/updateChatMessages/:deploymentId`,
  authenticate,
  AddChatMessageController
);

/**
 * @openapi
 * /deployments/updateArchitectureTemplates/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments Configuration
 *     summary: Update architecture templates
 *     description: Updates the architecture templates for a specific deployment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateArchitectureTemplatesDto'
 *     responses:
 *       '200':
 *         description: Architecture templates updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Architecture templates updated successfully.'
 *                 deployment:
 *                   $ref: '#/components/schemas/DeploymentModel'
 *       '400':
 *         description: Bad request (e.g., validation error).
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Deployment not found.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.put(
  `${resourceName}/updateArchitectureTemplates/:deploymentId`,
  authenticate,
  UpdateArchitectureComponentsController
);

// Pipeline Management
/**
 * @openapi
 * /deployments/startPipeline/{deploymentId}:
 *   post:
 *     tags:
 *       - Deployments Pipeline
 *     summary: Start deployment pipeline
 *     description: Initiates the deployment pipeline for a configured deployment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to start.
 *     responses:
 *       '200':
 *         description: Deployment pipeline started successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Deployment pipeline started successfully.'
 *                 deployment:
 *                   $ref: '#/components/schemas/DeploymentModel'
 *       '400':
 *         description: Bad request (e.g., deployment not configured, already running).
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Deployment not found.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.post(
  `${resourceName}/startPipeline/:deploymentId`,
  authenticate,
  StartPipelineController
);

/**
 * @openapi
 * /deployments/getPipelineStatus/{deploymentId}:
 *   get:
 *     tags:
 *       - Deployments Pipeline
 *     summary: Get deployment pipeline status
 *     description: Retrieves the status of the deployment pipeline for a specific deployment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to get the pipeline status for.
 *     responses:
 *       '200':
 *         description: Deployment pipeline status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Deployment pipeline status retrieved successfully.'
 *                 deployment:
 *                   $ref: '#/components/schemas/DeploymentModel'
 *       '400':
 *         description: Bad request (e.g., deployment not configured, already running).
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Deployment not found.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.get(
  `${resourceName}/getPipelineStatus/:deploymentId`,
  authenticate,
  GetPipelineStatusController
);

/**
 * @openapi
 * /deployments/estimateCost/{deploymentId}:
 *   get:
 *     tags:
 *       - Deployments Pipeline
 *     summary: Estimate deployment cost
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deploymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deployment to estimate the cost for.
 *     responses:
 *       '200':
 *         description: Deployment cost estimation retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Deployment cost estimation retrieved successfully.'
 *                 deployment:
 *                   $ref: '#/components/schemas/DeploymentModel'
 *       '400':
 *         description: Bad request (e.g., deployment not configured, already running).
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Deployment not found.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.get(
  `${resourceName}/estimateCost/:deploymentId`,
  authenticate,
  EstimateCostController
);


/**
 * @openapi
 * /deployments/create:
 *   post:
 *     tags:
 *       - Deployments Pipeline
 *     summary: Create deployment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeploymentDto'
 *     responses:
 *       '200':
 *         description: Deployment created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Deployment created successfully.'
 *                 deployment:
 *                   $ref: '#/components/schemas/DeploymentModel'
 *       '400':
 *         description: Bad request (e.g., invalid deployment configuration).
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal server error.
 */
deploymentRoutes.post(
  `${resourceName}/create`,
  authenticate,
  CreateDeploymentController
);

