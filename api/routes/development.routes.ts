import { Router } from "express";
import {
  createWebContainerController,
  updateWebContainerController,
  getWebContainerByIdController,
  getAllWebContainersController,
  getWebContainersByProjectController,
  deleteWebContainerController,
  pushWebContainerToGitHubController,
  saveDevelopmentConfigsController,
  getDevelopmentConfigsController,
} from "../controllers/development.controller";
import { authenticate } from "../services/auth.service";

export const developmentRoutes = Router();

/**
 * Resource naming convention for API endpoints
 * primaryResourceName: The main resource category
 * secondaryResourceName: The specific resource type being managed
 */
const primaryResourceName = "developments";
const secondaryResourceName = "webcontainers";

// All routes are protected by authentication middleware

/**
 * @openapi
 * /developments:
 *   get:
 *     tags:
 *       - Development
 *     summary: Get all WebContainers
 *     description: Get all web containers for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: WebContainers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WebContainer'
 *       401:
 *         description: Unauthorized - no valid token provided
 *       500:
 *         description: Internal server error
 */
developmentRoutes.get(
  `/${primaryResourceName}`,
  authenticate,
  getAllWebContainersController
);

/**
 * @openapi
 * /developments/project/{projectId}:
 *   get:
 *     tags:
 *       - Development
 *     summary: Get all WebContainers for a specific project
 *     description: Retrieves all web containers associated with a specific project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *         example: "project_123456789"
 *     responses:
 *       200:
 *         description: List of WebContainers for the project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WebContainer'
 *       400:
 *         description: Bad request - missing project ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
developmentRoutes.get(
  `/${primaryResourceName}/project/:projectId`,
  authenticate,
  getWebContainersByProjectController
);

/**
 * @openapi
 * /developments/configs:
 *   post:
 *     tags:
 *       - Development
 *     summary: Save development configurations
 *     description: Saves the development configurations for a project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaveDevelopmentConfigsDto'
 *     responses:
 *       200:
 *         description: Development configurations saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
developmentRoutes.post(
  `/${primaryResourceName}/configs`,
  authenticate,
  saveDevelopmentConfigsController
);

/**
 * @openapi
 * /developments/configs:
 *   get:
 *     tags:
 *       - Development
 *     summary: Get development configurations
 *     description: Retrieves the development configurations for a project
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Development configurations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DevelopmentConfigsModel'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
developmentRoutes.get(
  `/${primaryResourceName}/configs/:projectId`,
  authenticate,
  getDevelopmentConfigsController
);

/**
 * @openapi
 * /developments/webcontainers:
 *   post:
 *     tags:
 *       - Development
 *     summary: Create a new WebContainer
 *     description: Creates a new web container for development purposes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWebContainerDto'
 *     responses:
 *       201:
 *         description: WebContainer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
developmentRoutes.post(
  `/${primaryResourceName}/${secondaryResourceName}`,
  authenticate,
  createWebContainerController
);

/**
 * @openapi
 * /developments/webcontainers:
 *   get:
 *     tags:
 *       - Development
 *     summary: Get all WebContainers for the authenticated user
 *     description: Retrieves all web containers owned by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of WebContainers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WebContainer'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
developmentRoutes.get(
  `/${primaryResourceName}/${secondaryResourceName}`,
  authenticate,
  getAllWebContainersController
);

/**
 * @openapi
 * /developments/webcontainers/project/{projectId}:
 *   get:
 *     tags:
 *       - Development
 *     summary: Get all WebContainers for a specific project
 *     description: Retrieves all web containers associated with a specific project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *         example: "project_123456789"
 *     responses:
 *       200:
 *         description: List of WebContainers for the project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WebContainer'
 *       400:
 *         description: Bad request - missing project ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
developmentRoutes.get(
  `/${primaryResourceName}/${secondaryResourceName}/project/:projectId`,
  authenticate,
  getWebContainersByProjectController
);

/**
 * @openapi
 * /developments/webcontainers/{webContainerId}:
 *   get:
 *     tags:
 *       - Development
 *     summary: Get a specific WebContainer by ID
 *     description: Retrieves detailed information about a specific web container
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: webContainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the WebContainer
 *         example: "webcontainer_123456789"
 *     responses:
 *       200:
 *         description: WebContainer details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebContainer'
 *       400:
 *         description: Bad request - missing WebContainer ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: WebContainer not found
 *       500:
 *         description: Internal server error
 */
developmentRoutes.get(
  `/${primaryResourceName}/${secondaryResourceName}/:webContainerId`,
  authenticate,
  getWebContainerByIdController
);

/**
 * @openapi
 * /developments/webcontainers/{webContainerId}:
 *   put:
 *     tags:
 *       - Development
 *     summary: Update a WebContainer
 *     description: Updates the configuration and settings of an existing web container
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: webContainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the WebContainer to update
 *         example: "webcontainer_123456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWebContainerDto'
 *     responses:
 *       200:
 *         description: WebContainer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       400:
 *         description: Bad request - missing WebContainer ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: WebContainer not found
 *       500:
 *         description: Internal server error
 */
developmentRoutes.put(
  `/${primaryResourceName}/${secondaryResourceName}/:webContainerId`,
  authenticate,
  updateWebContainerController
);

/**
 * @openapi
 * /developments/webcontainers/{webContainerId}:
 *   delete:
 *     tags:
 *       - Development
 *     summary: Delete a WebContainer
 *     description: Permanently removes a web container and all associated resources
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: webContainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the WebContainer to delete
 *         example: "webcontainer_123456789"
 *     responses:
 *       200:
 *         description: WebContainer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       400:
 *         description: Bad request - missing WebContainer ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: WebContainer not found
 *       500:
 *         description: Internal server error
 */
developmentRoutes.delete(
  `/${primaryResourceName}/${secondaryResourceName}/:webContainerId`,
  authenticate,
  deleteWebContainerController
);

/**
 * @openapi
 * /developments/webcontainers/{webContainerId}/push-to-github:
 *   post:
 *     tags:
 *       - Development
 *     summary: Push WebContainer files to GitHub
 *     description: Pushes the web container files to a GitHub repository
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: webContainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the WebContainer to push to GitHub
 *         example: "webcontainer_123456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PushToGitHubDto'
 *     responses:
 *       200:
 *         description: Files pushed to GitHub successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PushToGitHubResponseDto'
 *       400:
 *         description: Bad request - missing required fields or push failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: WebContainer not found
 *       500:
 *         description: Internal server error
 */
developmentRoutes.post(
  `/${primaryResourceName}/${secondaryResourceName}/:webContainerId/push-to-github`,
  authenticate,
  pushWebContainerToGitHubController
);

/**
 * @openapi
 * components:
 *   schemas:
 *     WebContainer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the WebContainer
 *           example: "webcontainer_123456789"
 *         projectId:
 *           type: string
 *           description: ID of the project this WebContainer belongs to
 *           example: "project_123456789"
 *         name:
 *           type: string
 *           description: Name of the WebContainer
 *           example: "My Web App"
 *         description:
 *           type: string
 *           description: Description of the WebContainer
 *           example: "A simple web application"
 *         status:
 *           type: string
 *           enum: [creating, active, stopped, error]
 *           description: Current status of the WebContainer
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2024-01-15T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2024-01-15T10:30:00Z"
 *         metadata:
 *           type: object
 *           properties:
 *             workdirName:
 *               type: string
 *               description: Working directory name
 *               example: "workspace"
 *             ports:
 *               type: array
 *               items:
 *                 type: number
 *               description: List of ports used by the container
 *               example: [3000, 8080]
 *             files:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of files in the container
 *               example: ["index.html", "style.css", "script.js"]
 *             url:
 *               type: string
 *               description: Container URL if available
 *               example: "https://webcontainer.example.com"
 *             githubUrl:
 *               type: string
 *               description: URL to the GitHub repository if pushed
 *               example: "https://github.com/username/my-web-app"
 *             lastPushedAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp of last GitHub push
 *               example: "2024-01-16T14:30:00Z"
 *         userId:
 *           type: string
 *           description: ID of the user who owns this WebContainer
 *           example: "user_123456789"
 *
 *     CreateWebContainerDto:
 *       type: object
 *       required:
 *         - name
 *         - projectId
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the WebContainer
 *           example: "My Web App"
 *         description:
 *           type: string
 *           description: Description of the WebContainer
 *           example: "A simple web application"
 *         projectId:
 *           type: string
 *           description: ID of the project this WebContainer belongs to
 *           example: "project_123456789"
 *         metadata:
 *           type: object
 *           properties:
 *             workdirName:
 *               type: string
 *               description: Working directory name
 *               example: "workspace"
 *             ports:
 *               type: array
 *               items:
 *                 type: number
 *               description: List of ports used by the container
 *               example: [3000, 8080]
 *
 *     UpdateWebContainerDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the WebContainer
 *           example: "Updated Web App Name"
 *         description:
 *           type: string
 *           description: Description of the WebContainer
 *           example: "Updated web application description"
 *         metadata:
 *           type: object
 *           properties:
 *             workdirName:
 *               type: string
 *               description: Working directory name
 *               example: "workspace"
 *             ports:
 *               type: array
 *               items:
 *                 type: number
 *               description: List of ports used by the container
 *               example: [3000, 8080]
 *             files:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of files in the container
 *               example: ["index.html", "style.css", "script.js"]
 *             fileContents:
 *               type: object
 *               additionalProperties:
 *                 type: string
 *               description: Content of files in the WebContainer
 *               example: {"index.html": "<!DOCTYPE html>...", "style.css": "body { ... }"}
 *
 *     PushToGitHubDto:
 *       type: object
 *       required:
 *         - token
 *         - repoName
 *       properties:
 *         token:
 *           type: string
 *           description: GitHub personal access token with repo permissions
 *           example: "ghp_xxxxxxxxxxxxxxxx"
 *         repoName:
 *           type: string
 *           description: Name of the GitHub repository to create or update
 *           example: "my-web-app"
 *         files:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Optional files to push (overrides WebContainer fileContents)
 *           example: {"index.html": "<!DOCTYPE html>...", "style.css": "body { ... }"}
 *         description:
 *           type: string
 *           description: Optional repository description
 *           example: "My web application"
 *         private:
 *           type: boolean
 *           description: Whether the repository should be private (default false)
 *           example: false
 *
 *     PushToGitHubResponseDto:
 *       type: object
 *       properties:
 *         repositoryUrl:
 *           type: string
 *           description: URL of the created/updated GitHub repository
 *           example: "https://github.com/username/my-web-app"
 *         owner:
 *           type: string
 *           description: GitHub username of the repository owner
 *           example: "username"
 *         repoName:
 *           type: string
 *           description: Name of the repository
 *           example: "my-web-app"
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *           example: true
 *         message:
 *           type: string
 *           description: Success or error message
 *           example: "Files pushed successfully"
 *
 *     SaveDevelopmentConfigsDto:
 *       type: object
 *       required:
 *         - projectId
 *         - configs
 *       properties:
 *         projectId:
 *           type: string
 *           description: ID of the project to save configurations for
 *           example: "project_123456789"
 *         configs:
 *           type: object
 *           description: Development configurations
 *           properties:
 *             framework:
 *               type: string
 *               description: Web framework used
 *               example: "react"
 *             buildTool:
 *               type: string
 *               description: Build tool used
 *               example: "webpack"
 *             dependencies:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "react"
 *                   version:
 *                     type: string
 *                     example: "^18.2.0"
 *
 *     BaseResponseDto:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *           example: true
 *         message:
 *           type: string
 *           description: Response message
 *           example: "Operation completed successfully"
 *         data:
 *           type: object
 *           description: Optional response data
 */
