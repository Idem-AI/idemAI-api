import { Router } from "express";
import {
  generateDeploymentController,
  getDeploymentsByProjectController,
  getDeploymentByIdController,
  updateDeploymentController,
  deleteDeploymentController,
  updateGitRepositoryConfigController,
  updateCloudProviderConfigController,
  updateInfrastructureConfigController,
  updateEnvironmentVariablesController,
  updateDockerConfigController,
  updateTerraformConfigController,
  startDeploymentPipelineController,
} from "../controllers/deployment.controller";
import { authenticate } from "../services/auth.service";

export const deploymentRoutes = Router();

const resourceName = "deployments"; // Corresponds to TargetModelType.DEPLOYMENT

// Generate a new deployment for a project
deploymentRoutes.post(
  `${resourceName}/generate/:projectId`,
  authenticate,
  generateDeploymentController
);

// Get all deployments for a specific project
deploymentRoutes.get(
  `${resourceName}/getAll/:projectId`,
  authenticate,
  getDeploymentsByProjectController
);

// Get a specific deployment by its ID
deploymentRoutes.get(
  `${resourceName}/get/:deploymentId`,
  authenticate,
  getDeploymentByIdController
);

// Update a specific deployment by its ID
deploymentRoutes.put(
  `${resourceName}/update/:deploymentId`,
  authenticate,
  updateDeploymentController
);

// Delete a specific deployment by its ID
deploymentRoutes.delete(
  `${resourceName}/delete/:deploymentId`,
  authenticate,
  deleteDeploymentController
);

// Routes for updating specific parts of the deployment configuration
/**
 * @openapi
 * /deployments/config/git/{deploymentId}:
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
 *               # You might want to define a standard success response DTO or reference DeploymentModel
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
  `${resourceName}/config/git/:deploymentId`,
  authenticate,
  updateGitRepositoryConfigController
);

/**
 * @openapi
 * /deployments/config/cloud/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments Configuration
 *     summary: Update cloud provider configuration
 *     description: Updates the cloud provider settings for a specific deployment.
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
 *             $ref: '#/components/schemas/UpdateCloudProviderConfigDto'
 *     responses:
 *       '200':
 *         description: Cloud provider configuration updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Cloud provider configuration updated successfully.'
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
  `${resourceName}/config/cloud/:deploymentId`,
  authenticate,
  updateCloudProviderConfigController
);

/**
 * @openapi
 * /deployments/config/infrastructure/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments Configuration
 *     summary: Update infrastructure configuration
 *     description: Updates the infrastructure settings for a specific deployment.
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
 *             $ref: '#/components/schemas/UpdateInfrastructureConfigDto'
 *     responses:
 *       '200':
 *         description: Infrastructure configuration updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Infrastructure configuration updated successfully.'
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
  `${resourceName}/config/infrastructure/:deploymentId`,
  authenticate,
  updateInfrastructureConfigController
);

/**
 * @openapi
 * /deployments/config/envvars/{deploymentId}:
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
  `${resourceName}/config/envvars/:deploymentId`,
  authenticate,
  updateEnvironmentVariablesController
);

/**
 * @openapi
 * /deployments/config/docker/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments Configuration
 *     summary: Update Docker configuration
 *     description: Updates the Docker settings for a specific deployment.
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
 *             $ref: '#/components/schemas/UpdateDockerConfigDto'
 *     responses:
 *       '200':
 *         description: Docker configuration updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Docker configuration updated successfully.'
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
  `${resourceName}/config/docker/:deploymentId`,
  authenticate,
  updateDockerConfigController
);

/**
 * @openapi
 * /deployments/config/terraform/{deploymentId}:
 *   put:
 *     tags:
 *       - Deployments Configuration
 *     summary: Update Terraform configuration
 *     description: Updates the Terraform settings for a specific deployment.
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
 *             $ref: '#/components/schemas/UpdateTerraformConfigDto'
 *     responses:
 *       '200':
 *         description: Terraform configuration updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Terraform configuration updated successfully.'
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
  `${resourceName}/config/terraform/:deploymentId`,
  authenticate,
  updateTerraformConfigController
);

// Route for starting the deployment pipeline
/**
 * @openapi
 * /deployments/pipeline/start/{deploymentId}:
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
  `${resourceName}/pipeline/start/:deploymentId`,
  authenticate,
  startDeploymentPipelineController
);
