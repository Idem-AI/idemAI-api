import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { TargetModelType } from "../../enums/targetModelType.enum";
import { PromptService, LLMProvider } from "../prompt.service";
import { ProjectModel } from "../../models/project.model";
import { SectionModel } from "../../models/section.model";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";
import logger from "../../config/logger";

// Define interface for prompt step
export interface IPromptStep {
  promptConstant: string;
  stepName: string;
  modelParser?: (content: string) => any;
}

// Define interface for section result
export interface ISectionResult {
  name: string;
  type: string;
  data: string;
  summary: string;
  parsedData?: any;
}

export class GenericService {
  protected projectRepository: IRepository<ProjectModel>;
  protected tempFilePath: string = "";

  constructor(protected promptService: PromptService) {
    logger.info("GenericService initialized");
    this.projectRepository = RepositoryFactory.getRepository<ProjectModel>(
      TargetModelType.PROJECT
    );
  }

  /**
   * Initializes the temporary file for accumulating context
   * @param projectId Project ID
   * @param prefix Prefix for the temp file name
   * @returns Path to the created temporary file
   */
  protected async initTempFile(
    projectId: string,
    prefix: string
  ): Promise<string> {
    const tempFileName = `${prefix}_context_${projectId}_${Date.now()}.txt`;
    this.tempFilePath = path.join(os.tmpdir(), tempFileName);

    await fs.writeFile(this.tempFilePath, "", "utf-8");
    logger.info(`Temporary file created: ${this.tempFilePath}`);

    return this.tempFilePath;
  }

  /**
   * Fetches a project by ID and user ID
   * @param projectId Project ID
   * @param userId User ID
   * @returns Project model or null if not found
   */
  protected async getProject(
    projectId: string,
    userId: string
  ): Promise<ProjectModel | null> {
    const project = await this.projectRepository.findById(projectId, userId);
    logger.debug(
      `Project data fetched: ${project ? JSON.stringify(project.id) : "null"}`
    );

    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId}`
      );
      return null;
    }

    return project;
  }

  /**
   * Extracts project description from business plan if available
   * @param project Project model
   * @returns Project description or empty string if not found
   */
  protected extractProjectDescription(project: ProjectModel): string {
    let projectDescription = "";

    if (project.analysisResultModel?.businessPlan?.sections) {
      const descriptionSection =
        project.analysisResultModel.businessPlan.sections.find(
          (section) => section.name === "Project Description"
        );

      if (descriptionSection) {
        projectDescription = descriptionSection.data;
        logger.info(
          `Found project description in business plan for projectId: ${project.id}`
        );
      }
    }

    return project.description + "\n\n" + projectDescription;
  }

  /**
   * Adds project description to the context file
   * @param projectDescription Project description text
   */
  protected async addDescriptionToContext(
    projectDescription: string
  ): Promise<void> {
    if (projectDescription && this.tempFilePath) {
      const descriptionContext = `## Project Description\n\n${projectDescription}\n\n---\n`;
      await fs.appendFile(this.tempFilePath, descriptionContext, "utf-8");
      logger.info(`Added project description to context file`);
    }
  }

  /**
   * Runs a step and appends the result to the context file
   * @param promptConstant Prompt template
   * @param stepName Name of the step
   * @param project Project model
   * @param includeProjectInfo Whether to include project info in the prompt
   * @returns Generated content for the step
   */
  protected async runStepAndAppend(
    promptConstant: string,
    stepName: string,
    project: ProjectModel,
    includeProjectInfo = true
  ): Promise<string> {
    logger.info(
      `Generating section: '${stepName}' for projectId: ${project.id}`
    );

    let currentStepPrompt = `You are generating content section by section.
    The previously generated content is available in the attached text file.
    Please review the attached file for context.

    CURRENT TASK: Generate the '${stepName}' section.

    ${
      includeProjectInfo
        ? `PROJECT DETAILS (from input 'data' object):
${JSON.stringify(project, null, 2)}`
        : ""
    }

    SPECIFIC INSTRUCTIONS FOR '${stepName}':
${promptConstant}

    Please generate *only* the content for the '${stepName}' section,
    building upon the context from the attached file.`;

    const response = await this.promptService.runPrompt({
      provider: LLMProvider.GEMINI,
      modelName: "gemini-2.0-flash-exp",
      messages: [
        {
          role: "user",
          content: currentStepPrompt,
        },
      ],
      file: { localPath: this.tempFilePath, mimeType: "text/plain" },
    });

    logger.debug(`LLM response for section '${stepName}': ${response}`);
    const stepSpecificContent = this.promptService.getCleanAIText(response);
    logger.info(
      `Successfully generated and processed section: '${stepName}' for projectId: ${project.id}`
    );

    const sectionOutputToFile = `\n\n## ${stepName}\n\n${stepSpecificContent}\n\n---\n`;
    await fs.appendFile(this.tempFilePath, sectionOutputToFile, "utf-8");
    logger.info(
      `Appended section '${stepName}' to temporary file: ${this.tempFilePath}`
    );

    return stepSpecificContent;
  }

  /**
   * Processes multiple steps sequentially
   * @param steps Array of prompt steps
   * @param project Project model
   * @returns Array of section results
   */
  protected async processSteps(
    steps: IPromptStep[],
    project: ProjectModel
  ): Promise<ISectionResult[]> {
    const results: ISectionResult[] = [];

    for (const step of steps) {
      const content = await this.runStepAndAppend(
        step.promptConstant,
        step.stepName,
        project
      );

      let parsedData = null;
      if (step.modelParser) {
        try {
          parsedData = step.modelParser(content);
          logger.info(
            `Successfully parsed ${step.stepName} for projectId: ${project.id}`
          );
        } catch (error) {
          logger.error(
            `Error parsing ${step.stepName} for project ${project.id}:`,
            error
          );
          parsedData = { error: "Parsing error", content };
        }
      }

      results.push({
        name: step.stepName,
        type: "text/markdown",
        data: content,
        summary: `${step.stepName} for Project ${project.id}`,
        parsedData: parsedData,
      });
    }

    return results;
  }

  /**
   * Parses content to JSON with error handling
   * @param content Content to parse
   * @param sectionName Section name for logging
   * @param projectId Project ID for logging
   * @returns Parsed JSON or fallback object
   */
  protected parseSection(
    content: string,
    sectionName: string,
    projectId: string
  ): any {
    try {
      const parsed = JSON.parse(content);
      logger.info(
        `Successfully parsed ${sectionName} for projectId: ${projectId}`
      );
      return parsed;
    } catch (error) {
      logger.error(
        `Error parsing ${sectionName} for project ${projectId}:`,
        error
      );
      // Return a fallback structure with the raw content
      return {
        content: content,
        summary: `Error parsing ${sectionName}`,
      };
    }
  }

  /**
   * Updates a project with new section results
   * @param projectId Project ID
   * @param userId User ID
   * @param modelProperty Property name in analysisResultModel to update
   * @param sections Array of sections to update
   * @returns Updated project or null
   */
  protected async updateProjectWithSections(
    projectId: string,
    userId: string,
    modelProperty: string,
    sections: SectionModel[]
  ): Promise<ProjectModel | null> {
    try {
      const oldProject = await this.projectRepository.findById(
        projectId,
        userId
      );
      if (!oldProject) {
        logger.warn(
          `Original project not found with ID: ${projectId} for user: ${userId}`
        );
        return null;
      }

      const newProject = {
        ...oldProject,
        analysisResultModel: {
          ...oldProject.analysisResultModel,
          [modelProperty]: {
            sections: sections,
          },
        },
      };

      const updatedProject = await this.projectRepository.update(
        projectId,
        newProject,
        userId
      );
      logger.info(
        `Successfully updated project with ID: ${projectId} with new ${modelProperty} sections`
      );

      return updatedProject;
    } catch (error) {
      logger.error(
        `Error updating project with ${modelProperty} sections:`,
        error
      );
      return null;
    }
  }

  /**
   * Cleans up temporary resources
   */
  protected async cleanup(): Promise<void> {
    if (this.tempFilePath && (await fs.pathExists(this.tempFilePath))) {
      try {
        await fs.remove(this.tempFilePath);
        logger.info(`Removed temporary file: ${this.tempFilePath}`);
      } catch (error) {
        logger.warn(
          `Failed to remove temporary file: ${this.tempFilePath}`,
          error
        );
      }
    }
  }
}
