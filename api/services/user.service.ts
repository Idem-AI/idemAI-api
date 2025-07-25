import { admin } from "..";
import logger from "../config/logger";
import { UserModel } from "../models/userModel";
// import { IRepository } from "../repository/IRepository";
import { RepositoryFactory } from "../repository/RepositoryFactory";

class UserService {
  private userRepository: any;

  constructor() {
    this.userRepository =
      RepositoryFactory.getRepository<UserModel>("users");
  }

  public async getUserProfile(sessionCookie: string): Promise<UserModel> {
    logger.info("Attempting to get user profile from session cookie.");
    if (!sessionCookie) {
      logger.warn("getUserProfile failed: No session cookie provided.");
      throw new Error("No session cookie provided.");
    }

    try {
      // Verify the session cookie
      const decodedToken = await admin
        .auth()
        .verifySessionCookie(sessionCookie, true);
      const { uid } = decodedToken;

      logger.info(
        `Session cookie verified for UID: ${uid}. Fetching user profile.`
      );

      // Get user from Firebase Auth
      const userRecord = await admin.auth().getUser(uid);

      // Get user data from repository
      let user = await this.userRepository.findById(uid);

      if (!user) {
        // User doesn't exist in repository, create a new user
        logger.info(
          `User ${uid} not found in repository, creating new user record`
        );

        user = await this.userRepository.create(
          {
            uid: userRecord.uid,
            email: userRecord.email || "",
            displayName: userRecord.displayName || "",
            photoURL: userRecord.photoURL || "",
            sessionCookie: sessionCookie,
            subscription: "free",
            lastLogin: new Date(),
          },
          uid
        );
      } else {
        // Update existing user's lastLogin
        logger.info(`Updating lastLogin for user ${uid}`);
        user =
          (await this.userRepository.update(
            uid,
            {
              lastLogin: new Date(),
              sessionCookie: sessionCookie,
            },
            uid
          )) || user;
      }

      logger.info(`Successfully fetched profile for user: ${uid}`);
      return user;
    } catch (error: any) {
      logger.error(`Error in getUserProfile: ${error.message}`, {
        stack: error.stack,
      });
      throw new Error(error.message || "Invalid or expired session.");
    }
  }
}

export const userService = new UserService();
