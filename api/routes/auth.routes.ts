import { Router, Request, Response, CookieOptions } from "express";
import admin from "firebase-admin";

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
authRoutes.post("/sessionLogin", async (req: Request, res: Response) => {
  const idToken = req.body.idToken;

  const expiresIn = 14 * 24 * 60 * 60 * 1000; // 14 Days
  const isProduction = process.env.NODE_ENV === "production";

  try {
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    const options: CookieOptions = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: isProduction, // Should be true in production
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };
    // console.log("session", sessionCookie);
    // console.log("options", options);
    res.cookie("session", sessionCookie, options);
    // console.log("Succesfull Session save...");
    res
      .status(200)
      .send({ success: true, message: "Session cookie created successfully." });
  } catch (error: any) {
    console.error("Error creating session cookie:", error);
    res.status(401).send({
      success: false,
      message: "UNAUTHORIZED REQUEST!",
      error: error.message,
    });
  }
});

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
authRoutes.get(
  "/profile",
  async (req: Request, res: Response): Promise<void> => {
    const sessionCookie = req.cookies.session;

    // console.log("sessionCookie", sessionCookie);

    if (!sessionCookie) {
      res
        .status(401)
        .json({ message: "Unauthenticated: No session cookie provided." });
      return;
    }

    try {
      const decodedToken = await admin
        .auth()
        .verifySessionCookie(sessionCookie, true); // true checks for revocation

      // Optional: Fetch more user details if needed, beyond what's in the session cookie
      // const userRecord = await admin.auth().getUser(decodedToken.uid);

      res.status(200).json({
        uid: decodedToken.uid,
        email: decodedToken.email,
        // Add other relevant fields from decodedToken if they exist and are needed
        // displayName: userRecord.displayName,
        // photoURL: userRecord.photoURL,
        // emailVerified: userRecord.emailVerified
      });
    } catch (error: any) {
      console.error(
        "Error verifying session cookie or fetching user data:",
        error
      );
      res.status(401).json({
        message: "Unauthenticated: Invalid or expired session.",
        error: error.message,
      });
    }
  }
);
