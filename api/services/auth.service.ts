import { Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { CustomRequest } from '../interfaces/express.interface';

/**
 * Middleware to authenticate requests using Firebase Admin SDK.
 * Verifies the ID token provided in the Authorization header.
 * If the token is valid, it attaches the decoded token (user information) to `req.user`.
 * 
 * @param req - The custom request object, expected to extend Express's Request.
 * @param res - The response object from Express.
 * @param next - The next middleware function in the Express stack.
 */
export async function authenticate(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided or incorrect format' });
    return;
  }

  const idToken = authHeader.split(' ')[1];

  try {
    // Ensure Firebase Admin SDK is initialized before calling admin.auth()
    // This is typically done once at application startup.
    if (!admin.apps.length) {
      // This is a fallback, ideally initialization is confirmed elsewhere.
      console.error('Firebase Admin SDK not initialized when authenticate was called.');
      res.status(500).json({ message: 'Internal Server Error: Auth service not ready' });
      return;
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach user info to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    // Provide a more generic error message to the client for security
    res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
}
