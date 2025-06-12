import { Router } from "express";
import {
  sessionLoginController,
  profileController,
} from "../controllers/auth.controller"; // Adjusted path

export const authRoutes = Router();

/**
 * @openapi
 * /sessionLogin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Create a session cookie for the user
 *     description: Exchanges a Firebase ID token for a session cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Firebase ID token obtained from client-side authentication.
 *     responses:
 *       '200':
 *         description: Session cookie created successfully. The session cookie is set in the HTTP response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Session cookie created successfully.
 *       '401':
 *         description: Unauthorized. Invalid ID token or error creating session cookie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: UNAUTHORIZED REQUEST!
 *                 error:
 *                   type: string
 *                   example: Error message details.
 *       '500':
 *         description: Internal server error.
 */
authRoutes.post("/sessionLogin", sessionLoginController);

/**
 * @openapi
 * /profile:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get authenticated user's profile
 *     description: Retrieves profile information for the user associated with the current session cookie.
 *     security:
 *       - cookieAuth: [] # Implies that a 'session' cookie is required
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uid:
 *                   type: string
 *                   description: User's unique ID.
 *                 email:
 *                   type: string
 *                   description: User's email address.
 *       '401':
 *         description: Unauthenticated. No session cookie, or invalid/expired session.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Unauthenticated: No session cookie provided.'
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: 'Error message details if applicable.'
 *       '500':
 *         description: Internal server error.
 */
authRoutes.get("/profile", profileController);
