import { Request, Response, CookieOptions } from "express";
import admin from "firebase-admin";
import logger from "../config/logger"; // Assuming you have a Winston logger setup
import { userService } from "../services/user.service";
import { UserModel } from "../models/userModel";
export const sessionLoginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.body.token;
  const user = req.body.user;

  logger.info(`Attempting session login for user associated with token`, {
    user,
    body: req.body,
  });

  if (!token) {
    logger.warn(`Session login failed: No ID token provided. ${user.uid}`);
    res.status(400).send({ success: false, message: "ID token is required." });
    return;
  }

  if (!user) {
    logger.warn("Session login failed: No user data provided.");
    res.status(400).send({ success: false, message: "User data is required." });
    return;
  }
  const userModel: UserModel = {
    uid: user.uid,
    email: user.email,
    subscription: "free",
    createdAt: new Date(),
    lastLogin: new Date(),
    displayName: user.displayName,
    photoURL: user.photoURL,
    quota: {
      dailyUsage: 6,
      weeklyUsage: 20,
      lastResetDaily: new Date().toISOString().split("T")[0],
      lastResetWeekly: new Date().toISOString().split("T")[0],
    },
  };
  const expiresIn = 14 * 24 * 60 * 60 * 1000; // 14 Days
  const isProduction = process.env.NODE_ENV === "production";

  try {
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(token, { expiresIn });

    const options: CookieOptions = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };

    res.cookie("session", sessionCookie, options);
    logger.info(
      `Session cookie created successfully for user ${userModel.uid}.`
    );
    const createdUser = await userService.createUser(userModel);
    if (!createdUser) {
      logger.warn(`User ${userModel.uid} not created.`);
      res.status(400).send({
        success: false,
        message: "User not created.",
      });
      return;
    }
    res
      .status(200)
      .send({ success: true, message: "Session cookie created successfully." });
  } catch (error: any) {
    logger.error(`Error creating session cookie for user ${user.uid}:`, {
      errorMessage: error.message,
      errorStack: error.stack,
      idTokenProvided: !!token,
    });
    res.status(401).send({
      success: false,
      message: "UNAUTHORIZED REQUEST! Error creating session cookie.",
      error: error.message,
    });
  }
};
