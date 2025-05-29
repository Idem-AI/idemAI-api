import { Router, Request, Response, CookieOptions } from "express";
import admin from "firebase-admin";

export const authRoutes = Router();

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
