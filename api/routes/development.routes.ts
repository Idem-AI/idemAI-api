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
 *               - name
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: The ID of the project this WebContainer belongs to
 *               name:
 *                 type: string
 *                 description: Name of the WebContainer
 *               description:
 *                 type: string
 *                 description: Optional description of the WebContainer
 *               metadata:
 *                 type: object
 *                 properties:
 *                   workdirName:
 *                     type: string
 *                     description: Working directory name
 *                   ports:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: List of ports used by the container
 *                   files:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of files in the container
 *                   url:
 *                     type: string
 *                     description: Container URL if available
 *     responses:
 *       201:
 *         description: WebContainer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebContainer'
 *       400:
 *         description: Bad request - missing required fields
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of WebContainers
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
developmentRoutes.get("/", authenticate, getAllWebContainersController);

/**
 * @openapi
 * /webcontainers/project/{projectId}:
 *   get:
 *     tags:
 *       - Development
 *     summary: Get all WebContainers for a specific project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: List of WebContainers for the project
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WebContainer'
 *       400:
 *         description: Bad request - missing project ID
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: webContainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the WebContainer
 *     responses:
 *       200:
 *         description: WebContainer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebContainer'
 *       400:
 *         description: Bad request - missing WebContainer ID
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: webContainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the WebContainer to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [creating, active, stopped, error]
 *                 description: Status of the WebContainer
 *               metadata:
 *                 type: object
 *                 properties:
 *                   workdirName:
 *                     type: string
 *                     description: Working directory name
 *                   ports:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: List of ports used by the container
 *                   files:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of files in the container
 *                   url:
 *                     type: string
 *                     description: Container URL if available
 *     responses:
 *       200:
 *         description: WebContainer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebContainer'
 *       400:
 *         description: Bad request - missing WebContainer ID
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: webContainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the WebContainer to delete
 *     responses:
 *       200:
 *         description: WebContainer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "WebContainer deleted successfully"
 *       400:
 *         description: Bad request - missing WebContainer ID
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: webContainerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the WebContainer to push to GitHub
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
 *               repoName:
 *                 type: string
 *                 description: Name of the GitHub repository to create or update
 *               files:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 description: Optional files to push (overrides WebContainer fileContents)
 *               description:
 *                 type: string
 *                 description: Optional repository description
 *               private:
 *                 type: boolean
 *                 description: Whether the repository should be private (default false)
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
 *                 owner:
 *                   type: string
 *                   description: GitHub username of the repository owner
 *                 repoName:
 *                   type: string
 *                   description: Name of the repository
 *                 success:
 *                   type: boolean
 *                   description: Whether the operation was successful
 *                 message:
 *                   type: string
 *                   description: Success or error message
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
 *         projectId:
 *           type: string
 *           description: ID of the project this WebContainer belongs to
 *         name:
 *           type: string
 *           description: Name of the WebContainer
 *         description:
 *           type: string
 *           description: Description of the WebContainer
 *         status:
 *           type: string
 *           enum: [creating, active, stopped, error]
 *           description: Current status of the WebContainer
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         metadata:
 *           type: object
 *           properties:
 *             workdirName:
 *               type: string
 *               description: Working directory name
 *             ports:
 *               type: array
 *               items:
 *                 type: number
 *               description: List of ports used by the container
 *             files:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of files in the container
 *             url:
 *               type: string
 *               description: Container URL if available
 *         userId:
 *           type: string
 *           description: ID of the user who owns this WebContainer
 */
