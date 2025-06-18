import { Router } from "express";
import {
  createWebContainerController,
  updateWebContainerController,
  getWebContainerByIdController,
  getAllWebContainersController,
  getWebContainersByProjectController,
  deleteWebContainerController,
  pushWebContainerToGitHubController,
} from "../controllers/development.controller";
import { authenticate } from "../services/auth.service";

export const developmentRoutes = Router();

const resourceName = "webcontainers";

// All routes are protected and user-specific

/**
 * @openapi
 * /webcontainers:
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
 *             $ref: '#/components/schemas/CreateDeploymentDto'
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
developmentRoutes.post("/", authenticate, createWebContainerController);

/**
 * @openapi
 * /webcontainers:
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
 *               $ref: '#/components/schemas/BaseResponseDto'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
developmentRoutes.get("/", authenticate, getAllWebContainersController);

/**
 * @openapi
 * /webcontainers/project/{projectId}:
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
 *               $ref: '#/components/schemas/BaseResponseDto'
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
developmentRoutes.get("/project/:projectId", authenticate, getWebContainersByProjectController);

/**
 * @openapi
 * /webcontainers/{webContainerId}:
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
developmentRoutes.get("/:webContainerId", authenticate, getWebContainerByIdController);

/**
 * @openapi
 * /webcontainers/{webContainerId}:
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
 *             $ref: '#/components/schemas/UpdateDeploymentDto'
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
developmentRoutes.put("/:webContainerId", authenticate, updateWebContainerController);

/**
 * @openapi
 * /webcontainers/{webContainerId}:
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
developmentRoutes.delete("/:webContainerId", authenticate, deleteWebContainerController);

/**
 * @openapi
 * /webcontainers/{webContainerId}/push-to-github:
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
 *             type: object
 *             required:
 *               - token
 *               - repoName
 *             properties:
 *               token:
 *                 type: string
 *                 description: GitHub personal access token with repo permissions
 *                 example: "ghp_xxxxxxxxxxxxxxxx"
 *               repoName:
 *                 type: string
 *                 description: Name of the GitHub repository to create or update
 *                 example: "my-web-app"
 *               files:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 description: Optional files to push (overrides WebContainer fileContents)
 *                 example: {"index.html": "<!DOCTYPE html>...", "style.css": "body { ... }"}
 *               description:
 *                 type: string
 *                 description: Optional repository description
 *                 example: "My web application"
 *               private:
 *                 type: boolean
 *                 description: Whether the repository should be private (default false)
 *                 example: false
 *     responses:
 *       200:
 *         description: Files pushed to GitHub successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 repositoryUrl:
 *                   type: string
 *                   description: URL of the created/updated GitHub repository
 *                   example: "https://github.com/username/my-web-app"
 *                 owner:
 *                   type: string
 *                   description: GitHub username of the repository owner
 *                   example: "username"
 *                 repoName:
 *                   type: string
 *                   description: Name of the repository
 *                   example: "my-web-app"
 *                 success:
 *                   type: boolean
 *                   description: Whether the operation was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success or error message
 *                   example: "Files pushed successfully"
 *       400:
 *         description: Bad request - missing required fields or push failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: WebContainer not found
 *       500:
 *         description: Internal server error
 */
developmentRoutes.post("/:webContainerId/push-to-github", authenticate, pushWebContainerToGitHubController);

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
 *         userId:
 *           type: string
 *           description: ID of the user who owns this WebContainer
 *           example: "user_123456789"
 */
