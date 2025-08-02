import admin from "firebase-admin";
import logger from "../config/logger";

export interface UploadResult {
  fileName: string;
  downloadURL: string;
  filePath: string;
}

export interface LogoVariationsUpload {
  primaryLogo?: UploadResult;
  lightBackground?: UploadResult;
  darkBackground?: UploadResult;
  monochrome?: UploadResult;
}

export class StorageService {
  private storage: admin.storage.Storage;
  private bucket: any;

  constructor() {
    this.storage = admin.storage();
    this.bucket = this.storage.bucket();
    logger.info("StorageService initialized");
  }

  /**
   * Upload a single file to Firebase Storage
   * @param fileContent - The file content as string or Buffer
   * @param fileName - Name of the file
   * @param folderPath - Path where to store the file (e.g., "users/userId/projects/projectId")
   * @param contentType - MIME type of the file
   * @returns Upload result with download URL
   */
  async uploadFile(
    fileContent: string | Buffer,
    fileName: string,
    folderPath: string,
    contentType: string = "image/svg+xml"
  ): Promise<UploadResult> {
    try {
      const filePath = `${folderPath}/${fileName}`;
      const file = this.bucket.file(filePath);

      logger.info(`Uploading file to Firebase Storage`, {
        fileName,
        folderPath,
        filePath,
        contentType,
      });

      // Convert string content to Buffer if needed
      const buffer =
        typeof fileContent === "string"
          ? Buffer.from(fileContent, "utf8")
          : fileContent;

      // Upload the file
      await file.save(buffer, {
        metadata: {
          contentType,
          metadata: {
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      // Make the file publicly accessible
      await file.makePublic();

      // Get the public URL
      const downloadURL = `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;

      logger.info(`File uploaded successfully`, {
        fileName,
        filePath,
        downloadURL,
      });

      return {
        fileName,
        downloadURL,
        filePath,
      };
    } catch (error: any) {
      logger.error(`Error uploading file to Firebase Storage`, {
        fileName,
        folderPath,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to upload file ${fileName}: ${error.message}`);
    }
  }

  /**
   * Upload logo variations to Firebase Storage
   * @param variations - Object containing logo variations (SVG content)
   * @param userId - User ID for folder structure
   * @param projectId - Project ID for folder structure
   * @returns Object with download URLs for each variation
   */
  async uploadLogoVariations(
    primaryLogo: string,
    variations: {
      lightBackground?: string;
      darkBackground?: string;
      monochrome?: string;
    },
    userId: string,
    projectId: string
  ): Promise<LogoVariationsUpload> {
    try {
      const folderPath = `users/${userId}/projects/${projectId}/logos`;
      const results: LogoVariationsUpload = {};

      logger.info(`Starting logo variations upload`, {
        userId,
        projectId,
        folderPath,
        variationsCount: Object.keys(variations).length,
      });

      // Upload primary logo
      results.primaryLogo = await this.uploadFile(
        primaryLogo,
        "logo-primary.svg",
        folderPath,
        "image/svg+xml"
      );

      // Upload each variation if it exists
      if (variations.lightBackground) {
        results.lightBackground = await this.uploadFile(
          variations.lightBackground,
          "logo-light-background.svg",
          folderPath,
          "image/svg+xml"
        );
      }

      if (variations.darkBackground) {
        results.darkBackground = await this.uploadFile(
          variations.darkBackground,
          "logo-dark-background.svg",
          folderPath,
          "image/svg+xml"
        );
      }

      if (variations.monochrome) {
        results.monochrome = await this.uploadFile(
          variations.monochrome,
          "logo-monochrome.svg",
          folderPath,
          "image/svg+xml"
        );
      }

      logger.info(`Logo variations uploaded successfully`, {
        userId,
        projectId,
        uploadedVariations: Object.keys(results),
      });

      return results;
    } catch (error: any) {
      logger.error(`Error uploading logo variations`, {
        userId,
        projectId,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to upload logo variations: ${error.message}`);
    }
  }

  /**
   * Delete files from Firebase Storage
   * @param filePaths - Array of file paths to delete
   */
  async deleteFiles(filePaths: string[]): Promise<void> {
    try {
      logger.info(`Deleting files from Firebase Storage`, {
        filePaths,
        count: filePaths.length,
      });

      const deletePromises = filePaths.map(async (filePath) => {
        const file = this.bucket.file(filePath);
        await file.delete();
        logger.info(`File deleted successfully: ${filePath}`);
      });

      await Promise.all(deletePromises);

      logger.info(`All files deleted successfully`, {
        deletedCount: filePaths.length,
      });
    } catch (error: any) {
      logger.error(`Error deleting files from Firebase Storage`, {
        filePaths,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to delete files: ${error.message}`);
    }
  }

  /**
   * Generate a unique project ID for storage purposes
   * @returns A unique project ID
   */
  generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export a singleton instance
export const storageService = new StorageService();
