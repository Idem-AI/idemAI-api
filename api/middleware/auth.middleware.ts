import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import logger from '../config/logger';

export interface CustomRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export async function authenticate(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    logger.warn("Authentication failed: No token provided", { 
      ip: req.ip,
      path: req.path
    });
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    logger.info("User authenticated successfully", { 
      uid: decodedToken.uid,
      email: decodedToken.email,
      path: req.path
    });
    next();
  } catch (error) {
    logger.error("Error verifying authentication token", { 
      error: error instanceof Error ? error.message : String(error),
      path: req.path,
      ip: req.ip
    });
    res.status(403).json({ message: "Forbidden: Invalid token" });
  }
}
