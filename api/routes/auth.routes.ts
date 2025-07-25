import { Router } from "express";
import { sessionLoginController } from "../controllers/auth.controller"; // Adjusted path

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
 *             type: objects
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
