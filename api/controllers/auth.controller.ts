import { Request, Response, CookieOptions } from "express";
import admin from "firebase-admin";
import logger from "../config/logger"; // Assuming you have a Winston logger setup
import { userService } from "../services/user.service";
export const sessionLoginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const idToken = req.body.idToken;
  const userId = req.body.userId || "unknown"; // For logging context

  logger.info(`Attempting session login for user associated with token`, {
    userId,
    body: req.body,
  });

  if (!idToken) {
    logger.warn("Session login failed: No ID token provided.", { userId });
    res.status(400).send({ success: false, message: "ID token is required." });
    return;
  }

  const expiresIn = 14 * 24 * 60 * 60 * 1000; // 14 Days
  const isProduction = process.env.NODE_ENV === "production";

  try {
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    const options: CookieOptions = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };

    res.cookie("session", sessionCookie, options);
    logger.info("Session cookie created successfully.", { userId });
    res
      .status(200)
      .send({ success: true, message: "Session cookie created successfully." });
  } catch (error: any) {
    logger.error("Error creating session cookie:", {
      userId,
      errorMessage: error.message,
      errorStack: error.stack,
      idTokenProvided: !!idToken,
    });
    res.status(401).send({
      success: false,
      message: "UNAUTHORIZED REQUEST! Error creating session cookie.",
      error: error.message,
    });
  }
};

