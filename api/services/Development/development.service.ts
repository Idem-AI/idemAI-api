import {
  WebContainerModel,
  CreateWebContainerRequest,
  UpdateWebContainerRequest,
} from "../../models/webcontainer.model";
import logger from "../../config/logger";
import { GenericService } from "../common/generic.service";
import { PromptService } from "../prompt.service";

export class DevelopmentService extends GenericService {
  constructor(promptService: PromptService) {
    super(promptService);
    logger.info("DevelopmentService initialized.");
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
        metadata: request.metadata || {
          workdirName: request.name.toLowerCase().replace(/\s+/g, "-"),
          ports: [],
          files: [],
        },
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Initialize analysisResultModel.development if it doesn't exist
      if (!project.analysisResultModel.development) {
        project.analysisResultModel.development = [];
      }

      // Add the WebContainer to the project's development section
      project.analysisResultModel.development.push(webContainerData);

      // Update the project
      const updatedProject = await this.projectRepository.update(
        request.projectId,
        { analysisResultModel: project.analysisResultModel },
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
        existingContainer.metadata = {
          workdirName: existingContainer.metadata?.workdirName || "default",
          ...existingContainer.metadata,
          ...updates.metadata,
        };
      }

      existingContainer.updatedAt = new Date();

      // Update the project
      const updatedProject = await this.projectRepository.update(
        project.id!,
        { analysisResultModel: project.analysisResultModel },
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
          allWebContainers.push(...project.analysisResultModel.development);
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

      const webContainers = project.analysisResultModel?.development || [];

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
        { analysisResultModel: project.analysisResultModel },
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
        const webContainer = project.analysisResultModel.development.find(
          (container) => container.id === webContainerId
        );
        if (webContainer) {
          return project;
        }
      }
    }

    return null;
  }
}
