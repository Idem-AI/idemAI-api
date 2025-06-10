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
/**
 * @openapi
 * /deployments/generate/{projectId}:
 *   post:
 *     tags:
 *       - Deployments
 *     summary: Generate a new deployment configuration for a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project for which to generate the deployment.
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
  `${resourceName}/generate/:projectId`,
  authenticate,
  generateDeploymentController
);

// Get all deployments for a specific project
/**
 * @openapi
 * /deployments/getAll/{projectId}:
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
  `${resourceName}/getAll/:projectId`,
  authenticate,
  getDeploymentsByProjectController
);

// Get a specific deployment by its ID
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
  getDeploymentByIdController
);

// Update a specific deployment by its ID
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
  updateDeploymentController
);

// Delete a specific deployment by its ID
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
