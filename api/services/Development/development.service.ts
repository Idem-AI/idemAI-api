import {
  WebContainerModel,
  CreateWebContainerRequest,
  UpdateWebContainerRequest,
} from "../../models/webcontainer.model";
import logger from "../../config/logger";
import { GenericService } from "../common/generic.service";
import { PromptService } from "../prompt.service";
import { Octokit } from "@octokit/rest";
import { DevelopmentConfigsModel } from "../../models/development.model";
import { ProjectModel } from "../../models/project.model";

export interface PushToGitHubRequest {
  token: string;
  repoName: string;
  files: Record<string, string>;
  description?: string;
  private?: boolean;
}

export interface PushToGitHubResponse {
  repositoryUrl: string;
  owner: string;
  repoName: string;
  success: boolean;
  message?: string;
}

export class DevelopmentService extends GenericService {
  constructor(promptService: PromptService) {
    super(promptService);
    logger.info("DevelopmentService initialized.");
  }

  /**
   * Helper method to remove undefined values from an object before Firestore operations
   */
  private cleanUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== "object") return obj;

    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key])
        ) {
          cleaned[key] = this.cleanUndefinedValues(obj[key]);
        } else {
          cleaned[key] = obj[key];
        }
      }
    }
    return cleaned;
  }

  /**
   * Create a new WebContainer and add it to the project
   */
  async createWebContainer(
    userId: string,
    request: CreateWebContainerRequest
  ): Promise<WebContainerModel> {
    logger.info(
      `Creating webcontainer for userId: ${userId}, projectId: ${request.projectId}`
    );

    try {
      // Get the project
      const project = await this.getProject(request.projectId, userId);
      if (!project) {
        logger.warn(
          `Project not found: ${request.projectId} for userId: ${userId}`
        );
        throw new Error(`Project not found: ${request.projectId}`);
      }

      // Generate unique ID for the WebContainer
      const webContainerId = `webcontainer_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create WebContainer data
      const webContainerData: WebContainerModel = {
        id: webContainerId,
        projectId: request.projectId,
        name: request.name,
        description: request.description,
        status: "creating",
        metadata: {
          workdirName:
            request.metadata?.workdirName ||
            request.name.toLowerCase().replace(/\s+/g, "-"),
          ports: request.metadata?.ports || [],
          files: request.metadata?.files || [],
          fileContents: request.metadata?.fileContents || {},
          ...(request.metadata?.url && { url: request.metadata.url }),
        },
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Log webcontainer files if any
      if (
        webContainerData.metadata?.files &&
        webContainerData.metadata.files.length > 0
      ) {
        logger.info(
          `WebContainer files being created for webcontainer: ${webContainerId}, userId: ${userId}`,
          {
            files: webContainerData.metadata.files,
            fileCount: webContainerData.metadata.files.length,
            projectId: request.projectId,
          }
        );
      } else {
        logger.info(
          `WebContainer created without files for webcontainer: ${webContainerId}, userId: ${userId}`
        );
      }

      // Initialize analysisResultModel.development if it doesn't exist
      if (!project.analysisResultModel.development) {
        project.analysisResultModel.development = {
          configs: {
            constraints: [],
            frontend: {
              framework: "",
              frameworkVersion: "",
              frameworkIconUrl: "",
              styling: "",
              stateManagement: "",
              features: [],
            },
            backend: {
              language: "",
              languageVersion: "",
              languageIconUrl: "",
              framework: "",
              frameworkVersion: "",
              frameworkIconUrl: "",
              apiType: "",
              apiVersion: "",
              apiIconUrl: "",
              orm: "",
              ormVersion: "",
              ormIconUrl: "",
              features: [],
            },
            database: {
              type: "",
              provider: "",
              version: "",
              providerIconUrl: "",
              orm: "",
              ormVersion: "",
              ormIconUrl: "",
              features: [],
            },
            projectConfig: {
              seoEnabled: false,
              contactFormEnabled: false,
              analyticsEnabled: false,
              i18nEnabled: false,
              performanceOptimized: false,
              authentication: false,
              authorization: false,
              paymentIntegration: false,
              customOptions: undefined,
            },
          },
          generatedValues: [],
        };
      }

      // Add the WebContainer to the project's development section
      project.analysisResultModel.development.generatedValues.push(
        webContainerData
      );

      // Update the project
      const updatedProject = await this.projectRepository.update(
        request.projectId,
        {
          analysisResultModel: this.cleanUndefinedValues(
            project.analysisResultModel
          ),
        },
        userId
      );

      if (!updatedProject) {
        logger.error(
          `Failed to update project: ${request.projectId} for userId: ${userId}`
        );
        throw new Error(`Failed to update project: ${request.projectId}`);
      }

      logger.info(
        `WebContainer created successfully: ${webContainerData.id} for userId: ${userId}`
      );
      return webContainerData;
    } catch (error) {
      logger.error(`Error creating webcontainer for userId: ${userId}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        requestData: request,
      });
      throw error;
    }
  }

  /**
   * Update an existing WebContainer in the project
   */
  async updateWebContainer(
    userId: string,
    webContainerId: string,
    updates: UpdateWebContainerRequest
  ): Promise<WebContainerModel | null> {
    logger.info(
      `Updating webcontainer: ${webContainerId} for userId: ${userId}`
    );

    try {
      // Find the project containing this WebContainer
      const project = await this.findProjectByWebContainerId(
        webContainerId,
        userId
      );
      if (!project) {
        logger.warn(
          `WebContainer not found: ${webContainerId} for userId: ${userId}`
        );
        return null;
      }

      // Find and update the WebContainer
      const webContainerIndex =
        project.analysisResultModel.development?.findIndex(
          (container: WebContainerModel) => container.id === webContainerId
        ) ?? -1;

      if (webContainerIndex === -1) {
        logger.warn(
          `WebContainer not found in project: ${webContainerId} for userId: ${userId}`
        );
        return null;
      }

      const existingContainer =
        project.analysisResultModel.development![webContainerIndex];

      // Apply updates
      if (updates.status !== undefined) {
        existingContainer.status = updates.status;
      }

      if (updates.metadata !== undefined) {
        existingContainer.metadata = this.cleanUndefinedValues({
          workdirName: existingContainer.metadata?.workdirName || "default",
          ...existingContainer.metadata,
          ...updates.metadata,
        });

        // Log webcontainer files if they were updated
        if (updates.metadata.files !== undefined) {
          logger.info(
            `WebContainer files being updated for webcontainer: ${webContainerId}, userId: ${userId}`,
            {
              newFiles: updates.metadata.files,
              newFileCount: updates.metadata.files?.length || 0,
              previousFiles: existingContainer.metadata?.files || [],
              previousFileCount: existingContainer.metadata?.files?.length || 0,
              projectId: project.id,
            }
          );
        }

        // Log if file contents were updated
        if (updates.metadata.fileContents !== undefined) {
          const updatedFileNames = Object.keys(updates.metadata.fileContents);
          logger.info(
            `WebContainer file contents being updated for webcontainer: ${webContainerId}, userId: ${userId}`,
            {
              updatedFiles: updatedFileNames,
              updatedFileCount: updatedFileNames.length,
              projectId: project.id,
            }
          );
        }
      }

      existingContainer.updatedAt = new Date().toISOString();

      // Update the project
      const updatedProject = await this.projectRepository.update(
        project.id!,
        {
          analysisResultModel: this.cleanUndefinedValues(
            project.analysisResultModel
          ),
        },
        userId
      );

      if (!updatedProject) {
        logger.error(
          `Failed to update project: ${project.id} for userId: ${userId}`
        );
        return null;
      }

      logger.info(
        `WebContainer updated successfully: ${webContainerId} for userId: ${userId}`
      );
      return existingContainer;
    } catch (error) {
      logger.error(
        `Error updating webcontainer: ${webContainerId} for userId: ${userId}`,
        {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          updates,
        }
      );
      throw error;
    }
  }

  /**
   * Get a WebContainer by ID
   */
  async getWebContainerById(
    userId: string,
    webContainerId: string
  ): Promise<WebContainerModel | null> {
    logger.info(
      `Getting webcontainer: ${webContainerId} for userId: ${userId}`
    );

    try {
      const project = await this.findProjectByWebContainerId(
        webContainerId,
        userId
      );
      if (!project) {
        logger.warn(
          `WebContainer not found: ${webContainerId} for userId: ${userId}`
        );
        return null;
      }

      const webContainer = project.analysisResultModel.development?.find(
        (container: WebContainerModel) => container.id === webContainerId
      );

      if (!webContainer) {
        logger.warn(
          `WebContainer not found in project: ${webContainerId} for userId: ${userId}`
        );
        return null;
      }

      logger.info(
        `WebContainer retrieved successfully: ${webContainerId} for userId: ${userId}`
      );
      return webContainer;
    } catch (error) {
      logger.error(
        `Error getting webcontainer: ${webContainerId} for userId: ${userId}`,
        {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      throw error;
    }
  }

  /**
   * Get all WebContainers for a user across all projects
   */
  async getAllWebContainers(userId: string): Promise<WebContainerModel[]> {
    logger.info(`Getting all webcontainers for userId: ${userId}`);

    try {
      const projects = await this.projectRepository.findAll(userId);
      const allWebContainers: WebContainerModel[] = [];

      for (const project of projects) {
        if (project.analysisResultModel?.development) {
          allWebContainers.push(
            ...project.analysisResultModel.development.generatedValues
          );
        }
      }

      logger.info(
        `Retrieved ${allWebContainers.length} webcontainers for userId: ${userId}`
      );
      return allWebContainers;
    } catch (error) {
      logger.error(`Error getting all webcontainers for userId: ${userId}`, {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Get WebContainers by project ID
   */
  async getWebContainersByProject(
    userId: string,
    projectId: string
  ): Promise<WebContainerModel[]> {
    logger.info(
      `Getting webcontainers for projectId: ${projectId}, userId: ${userId}`
    );

    try {
      const project = await this.getProject(projectId, userId);
      if (!project) {
        logger.warn(`Project not found: ${projectId} for userId: ${userId}`);
        return [];
      }

      const webContainers =
        project.analysisResultModel?.development.generatedValues || [];

      logger.info(
        `Retrieved ${webContainers.length} webcontainers for projectId: ${projectId}, userId: ${userId}`
      );
      return webContainers;
    } catch (error) {
      logger.error(
        `Error getting webcontainers for projectId: ${projectId}, userId: ${userId}`,
        {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      throw error;
    }
  }

  /**
   * Delete a WebContainer from the project
   */
  async deleteWebContainer(
    userId: string,
    webContainerId: string
  ): Promise<boolean> {
    logger.info(
      `Deleting webcontainer: ${webContainerId} for userId: ${userId}`
    );

    try {
      const project = await this.findProjectByWebContainerId(
        webContainerId,
        userId
      );
      if (!project) {
        logger.warn(
          `WebContainer not found: ${webContainerId} for userId: ${userId}`
        );
        return false;
      }

      // Remove the WebContainer from the project
      const webContainerIndex =
        project.analysisResultModel.development?.findIndex(
          (container: WebContainerModel) => container.id === webContainerId
        ) ?? -1;

      if (webContainerIndex === -1) {
        logger.warn(
          `WebContainer not found in project: ${webContainerId} for userId: ${userId}`
        );
        return false;
      }

      project.analysisResultModel.development!.splice(webContainerIndex, 1);

      // Update the project
      const updatedProject = await this.projectRepository.update(
        project.id!,
        {
          analysisResultModel: this.cleanUndefinedValues(
            project.analysisResultModel
          ),
        },
        userId
      );

      if (!updatedProject) {
        logger.error(
          `Failed to update project: ${project.id} for userId: ${userId}`
        );
        return false;
      }

      logger.info(
        `WebContainer deleted successfully: ${webContainerId} for userId: ${userId}`
      );
      return true;
    } catch (error) {
      logger.error(
        `Error deleting webcontainer: ${webContainerId} for userId: ${userId}`,
        {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      throw error;
    }
  }

  /**
   * Initialize a development environment for a project
   * Uses GenericService capabilities to setup development context
   */
  async initializeDevelopmentEnvironment(
    userId: string,
    projectId: string,
    containerName: string
  ): Promise<WebContainerModel | null> {
    logger.info(
      `Initializing development environment for projectId: ${projectId}, userId: ${userId}`
    );

    try {
      // Use GenericService method to get project
      const project = await this.getProject(projectId, userId);
      if (!project) {
        logger.warn(`Project not found: ${projectId} for userId: ${userId}`);
        return null;
      }

      // Extract project description using GenericService method
      const projectDescription = this.extractProjectDescription(project);

      // Create WebContainer with project context
      const containerRequest: CreateWebContainerRequest = {
        projectId,
        name: containerName,
        description: `Development environment for ${project.name}: ${projectDescription}`,
        metadata: {
          workdirName: project.name.toLowerCase().replace(/\s+/g, "-"),
          ports: [3000, 8080], // Default development ports
          files: [],
        },
      };

      return await this.createWebContainer(userId, containerRequest);
    } catch (error) {
      logger.error(
        `Error initializing development environment for projectId: ${projectId}, userId: ${userId}`,
        {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        }
      );
      throw error;
    }
  }

  /**
   * Push WebContainer files to GitHub
   */
  async pushWebContainerToGitHub(
    userId: string,
    webContainerId: string,
    request: PushToGitHubRequest
  ): Promise<PushToGitHubResponse> {
    logger.info(
      `Pushing WebContainer to GitHub for userId: ${userId}, webContainerId: ${webContainerId}`
    );

    try {
      // Find the project containing this WebContainer
      const project = await this.findProjectByWebContainerId(
        webContainerId,
        userId
      );
      if (!project) {
        throw new Error("WebContainer not found");
      }

      const webContainer = project.analysisResultModel.development.find(
        (container: WebContainerModel) => container.id === webContainerId
      );

      if (!webContainer) {
        throw new Error("WebContainer not found in project");
      }

      // Use provided files or WebContainer fileContents
      const filesToPush =
        request.files || webContainer.metadata?.fileContents || {};

      if (Object.keys(filesToPush).length === 0) {
        throw new Error("No files to push to GitHub");
      }

      logger.info(
        `Pushing ${
          Object.keys(filesToPush).length
        } files to GitHub repository: ${request.repoName}`
      );

      const octokit = new Octokit({ auth: request.token });

      // Get authenticated user
      const { data: user } = await octokit.rest.users.getAuthenticated();
      logger.info(`Authenticated GitHub user: ${user.login}`);

      // Create the repository
      try {
        await octokit.rest.repos.createForAuthenticatedUser({
          name: request.repoName,
          private: request.private || false,
          description:
            request.description ||
            `Repository created from WebContainer: ${webContainer.name}`,
        });
        logger.info(
          `Created GitHub repository: ${user.login}/${request.repoName}`
        );
      } catch (repoError: any) {
        if (repoError.status === 422) {
          logger.warn(
            `Repository ${request.repoName} already exists, continuing with file push`
          );
        } else {
          throw repoError;
        }
      }

      // Push each file to the repository
      let pushedFiles = 0;
      for (const [filePath, content] of Object.entries(filesToPush)) {
        try {
          // Remove leading slash if present
          const cleanPath = filePath.startsWith("/")
            ? filePath.slice(1)
            : filePath;

          await octokit.rest.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: request.repoName,
            path: cleanPath,
            message: `Add ${cleanPath} from WebContainer`,
            content: Buffer.from(content).toString("base64"),
          });

          pushedFiles++;
          logger.info(`Pushed file: ${cleanPath}`);
        } catch (fileError: any) {
          logger.error(`Failed to push file ${filePath}:`, {
            error: fileError.message,
            status: fileError.status,
          });
          throw new Error(
            `Failed to push file ${filePath}: ${fileError.message}`
          );
        }
      }

      const repositoryUrl = `https://github.com/${user.login}/${request.repoName}`;

      // Update WebContainer metadata with GitHub URL
      const updatedMetadata = {
        ...webContainer.metadata,
        githubUrl: repositoryUrl,
        lastPushedAt: new Date().toISOString(),
      };

      await this.updateWebContainer(userId, webContainerId, {
        metadata: updatedMetadata,
      });

      logger.info(
        `Successfully pushed ${pushedFiles} files to GitHub repository: ${repositoryUrl}`
      );

      return {
        repositoryUrl,
        owner: user.login,
        repoName: request.repoName,
        success: true,
        message: `Successfully pushed ${pushedFiles} files to GitHub`,
      };
    } catch (error: any) {
      logger.error("Error pushing WebContainer to GitHub:", {
        userId,
        webContainerId,
        repoName: request.repoName,
        error: error.message,
        stack: error.stack,
      });

      return {
        repositoryUrl: "",
        owner: "",
        repoName: request.repoName,
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Find a project that contains a specific WebContainer
   * Private helper method
   */
  private async findProjectByWebContainerId(
    webContainerId: string,
    userId: string
  ): Promise<any | null> {
    const projects = await this.projectRepository.findAll(userId);

    for (const project of projects) {
      if (project.analysisResultModel?.development) {
        const webContainer =
          project.analysisResultModel.development.generatedValues.find(
            (container: WebContainerModel) => container.id === webContainerId
          );
        if (webContainer) {
          return project;
        }
      }
    }

    return null;
  }

  /**
   * Generate development context for a project
   */
  async saveDevelopmentConfigs(
    userId: string,
    projectId: string,
    developmentConfigs: DevelopmentConfigsModel
  ): Promise<ProjectModel> {
    logger.info(
      `Saving development configs for projectId: ${projectId}, userId: ${userId}`
    );

    const project = await this.getProject(projectId, userId);
    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId}`
      );
      throw new Error("Project not found");
    }

    if (!project.analysisResultModel.development) {
      logger.info(
        `Creating new development section for projectId: ${projectId}`
      );
      project.analysisResultModel.development = {
        configs: developmentConfigs,
        generatedValues: [],
      };
    } else {
      logger.info(
        `Updating existing development section for projectId: ${projectId}`
      );
    }

    project.analysisResultModel.development.configs = developmentConfigs;

    await this.projectRepository.update(projectId, project, userId);
    logger.info(
      `Successfully saved development configs for projectId: ${projectId}`
    );
    return project;
  }

  async getDevelopmentConfigs(
    userId: string,
    projectId: string
  ): Promise<DevelopmentConfigsModel | null> {
    logger.info(
      `Fetching development configs for projectId: ${projectId}, userId: ${userId}`
    );

    const project = await this.getProject(projectId, userId);
    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId}`
      );
      return null;
    }

    return project.analysisResultModel.development.configs;
  }
}
