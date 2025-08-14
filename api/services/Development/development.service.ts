import {
  WebContainerModel,
  CreateWebContainerRequest,
  UpdateWebContainerRequest,
} from "../../models/webcontainer.model";
import logger from "../../config/logger";
import { GenericService } from "../common/generic.service";
import { PromptService } from "../prompt.service";
import { Octokit } from "@octokit/rest";
import {
  DevelopmentConfigsModel,
  LandingPageConfig,
} from "../../models/development.model";
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
   * Generate development context for a project
   */
  async saveDevelopmentConfigs(
    userId: string,
    projectId: string,
    developmentConfigs: DevelopmentConfigsModel,
    generate: string
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
      };
    } else {
      logger.info(
        `Updating existing development section for projectId: ${projectId}`
      );
    }

    // Configure landing page config based on generate param
    const gen = (generate || "").toLowerCase();
    switch (gen) {
      case "landing":
        developmentConfigs.landingPageConfig = LandingPageConfig.SEPARATE;
        logger.info(
          `Generation type is 'landing': setting landingPageConfig=SEPARATE for projectId: ${projectId}`
        );
        // For landing-only, don't save backend or database configs
        logger.info(
          `Landing-only selected, removing backend and database configs for projectId: ${projectId}`
        );
        developmentConfigs.backend = {} as any;
        developmentConfigs.database = {} as any;
        break;
      case "app":
        developmentConfigs.landingPageConfig = LandingPageConfig.NONE;
        logger.info(
          `Generation type is 'app': setting landingPageConfig=NONE for projectId: ${projectId}`
        );
        break;
      case "both":
        developmentConfigs.landingPageConfig = LandingPageConfig.INTEGRATED;
        logger.info(
          `Generation type is 'both': setting landingPageConfig=INTEGRATED for projectId: ${projectId}`
        );
        break;
      default:
        // Sensible default: landing integrated with app
        developmentConfigs.landingPageConfig = LandingPageConfig.INTEGRATED;
        logger.warn(
          `Unknown generation type '${generate}', defaulting landingPageConfig=INTEGRATED for projectId: ${projectId}`
        );
        break;
    }

    project.analysisResultModel.development.configs = developmentConfigs;

    await this.projectRepository.update(
      projectId,
      project,
      `users/${userId}/projects`
    );
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

    if (!project.analysisResultModel.development) {
      logger.info(`Development section not found for projectId: ${projectId}`);
      return null;
    }

    return project.analysisResultModel.development.configs;
  }
}
