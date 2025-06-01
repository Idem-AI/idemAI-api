import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { DiagramModel } from "../../models/diagram.model";
import { ProjectModel } from "../../models/project.model";
import { TargetModelType } from "../../enums/targetModelType.enum";
import { PromptService, LLMProvider } from "../prompt.service";
import { SectionModel } from "../../models/section.model";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";
import logger from "../../config/logger";
import { ENTITY_DIAGRAM_PROMPT } from "./prompts/03_entity_diagram.prompt";
import { USE_CASE_DIAGRAM_PROMPT } from "./prompts/01_use-case-diagram.prompt";
import { CLASS_DIAGRAM_PROMPT } from "./prompts/02_class-diagram.prompt";
import { SEQUENCE_DIAGRAM_PROMPT } from "./prompts/04_sequence_diagram.prompt";
import { ARCHITECTURE_DIAGRAM_PROMPT } from "./prompts/01_architecture_diagram.prompt";

// Import diagram prompts

export class DiagramService {
  private projectRepository: IRepository<ProjectModel>;
  private promptService: PromptService;

  constructor() {
    logger.info("DiagramService initialized");
    this.projectRepository = RepositoryFactory.getRepository<ProjectModel>(
      TargetModelType.PROJECT
    );
    this.promptService = new PromptService();
  }

  async generateDiagram(
    userId: string,
    projectId: string
  ): Promise<ProjectModel | null> {
    logger.info(
      `Generating diagrams for userId: ${userId}, projectId: ${projectId}`
    );
    const tempFileName = `diagrams_context_${projectId}_${Date.now()}.txt`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    const project = await this.projectRepository.findById(projectId, userId);
    logger.debug(
      `Project data fetched for diagram generation: ${
        project ? JSON.stringify(project.id) : "null"
      }`
    );
    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId} during diagram generation.`
      );
      return null;
    }

    // Check if business plan exists to extract project description
    let projectDescription = "";
    if (project.analysisResultModel?.businessPlan?.sections) {
      const descriptionSection =
        project.analysisResultModel.businessPlan.sections;
      if (descriptionSection) {
        projectDescription = descriptionSection
          .map((section) => section.data)
          .join("\n\n");
        logger.info(
          `Found project business plan sections for projectId: ${projectId}`
        );
      }
    }

    try {
      await fs.writeFile(tempFilePath, "", "utf-8");
      logger.info(
        `Temporary file created for diagram generation: ${tempFilePath}`
      );

      // If we have project description, add it to context file
      if (projectDescription) {
        const descriptionContext = `## Project Description\n\n${projectDescription}\n\n---\n`;
        await fs.appendFile(tempFilePath, descriptionContext, "utf-8");
        logger.info(
          `Added project description from business plan to diagram context file`
        );
      }

      const runStepAndAppend = async (
        promptConstant: string,
        stepName: string,
        includeProjectInfo = true
      ) => {
        logger.info(
          `Generating diagram section: '${stepName}' for projectId: ${projectId}`
        );

        let currentStepPrompt = `You are generating project architecture and flow diagrams section by section.
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
          file: { localPath: tempFilePath, mimeType: "text/plain" },
        });

        logger.debug(
          `LLM response for diagram section '${stepName}': ${response}`
        );
        const stepSpecificContent = this.promptService.getCleanAIText(response);
        logger.info(
          `Successfully generated and processed diagram section: '${stepName}' for projectId: ${projectId}`
        );

        const sectionOutputToFile = `\n\n## ${stepName}\n\n${stepSpecificContent}\n\n---\n`;
        await fs.appendFile(tempFilePath, sectionOutputToFile, "utf-8");
        logger.info(
          `Appended diagram section '${stepName}' to temporary file: ${tempFilePath}`
        );

        return stepSpecificContent;
      };

      // Generate each diagram section sequentially
      // 1. Uses Cases Diagram
      const usesCasesResponseContent = await runStepAndAppend(
        USE_CASE_DIAGRAM_PROMPT,
        "Uses Cases Diagram"
      );

      // 2. Class Diagram
      const classDiagramResponseContent = await runStepAndAppend(
        CLASS_DIAGRAM_PROMPT,
        "Class Diagram"
      );
      // 3. Architecture Diagram
      const architectureResponseContent = await runStepAndAppend(
        ARCHITECTURE_DIAGRAM_PROMPT,
        "Architecture Diagram"
      );

      // 4. Entity Relationship Diagram
      const entityDiagramResponseContent = await runStepAndAppend(
        ENTITY_DIAGRAM_PROMPT,
        "Entity Relationship Diagram"
      );

      // 5. Sequence Diagram
      const sequenceDiagramResponseContent = await runStepAndAppend(
        SEQUENCE_DIAGRAM_PROMPT,
        "Sequence Diagram"
      );

      // Helper function to parse section content
      const parseSection = (content: string, sectionName: string): any => {
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
      };

      const usesCasesData = parseSection(
        usesCasesResponseContent,
        "Uses Cases Diagram"
      );
      // Parse the diagram responses
      const architectureData = parseSection(
        architectureResponseContent,
        "Architecture Diagram"
      );

      const classDiagramData = parseSection(
        classDiagramResponseContent,
        "Class Diagram"
      );

      const entityDiagramData = parseSection(
        entityDiagramResponseContent,
        "Entity Relationship Diagram"
      );

      const sequenceDiagramData = parseSection(
        sequenceDiagramResponseContent,
        "Sequence Diagram"
      );

      // Helper function to create a section
      const createSection = (
        name: string,
        data: any,
        type = "text/html"
      ): SectionModel => {
        return {
          name,
          type,
          data:
            typeof data.content === "string"
              ? data.content
              : JSON.stringify(data.content),
          summary: data.summary || `${name} section`,
        };
      };

      // Prepare all sections for the diagrams
      const diagramSections: SectionModel[] = [];

      // Add diagram sections
      diagramSections.push(createSection("Uses Cases Diagram", usesCasesData));

      diagramSections.push(createSection("Class Diagram", classDiagramData));

      diagramSections.push(
        createSection("Entity Relationship Diagram", entityDiagramData)
      );
      diagramSections.push(
        createSection("Sequence Diagram", sequenceDiagramData)
      );
      diagramSections.push(
        createSection("Architecture Diagram", architectureData)
      );

      // Create DiagramModel with sections
      const diagramModel: DiagramModel = {
        id: `diagram_${projectId}_${Date.now()}`,
        sections: diagramSections,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update the project with the new diagram data
      const newProject: Partial<ProjectModel> = {
        ...project,
        analysisResultModel: {
          ...project.analysisResultModel,
          design: diagramModel,
        },
      };

      // Update project with new diagram data
      const updatedProject = await this.projectRepository.update(
        projectId,
        newProject,
        userId
      );

      logger.info(
        `Successfully generated and updated diagrams for projectId: ${projectId}`
      );
      return updatedProject;
    } catch (error) {
      logger.error(
        `Error generating diagrams for projectId ${projectId}:`,
        error
      );
      throw error;
    } finally {
      try {
        logger.info(`Attempting to remove temporary file: ${tempFilePath}`);
        if (await fs.pathExists(tempFilePath)) {
          await fs.remove(tempFilePath);
          logger.info(`Successfully removed temporary file: ${tempFilePath}`);
        }
      } catch (cleanupError) {
        logger.error(
          `Error removing temporary file ${tempFilePath}:`,
          cleanupError
        );
      }
    }
  }

  async getDiagramsByProjectId(
    userId: string,
    projectId: string
  ): Promise<DiagramModel | null> {
    logger.info(
      `Fetching diagrams for projectId: ${projectId}, userId: ${userId}`
    );
    const project = await this.projectRepository.findById(projectId, userId);
    if (!project) {
      logger.warn(
        `Project not found with ID: ${projectId} for user: ${userId} when fetching diagrams.`
      );
      return null;
    }
    logger.info(`Successfully fetched diagrams for projectId: ${projectId}`);
    return project.analysisResultModel?.design || null;
  }

  async getDiagramById(
    userId: string,
    diagramId: string
  ): Promise<DiagramModel | null> {
    logger.info(`Getting diagram by ID: ${diagramId} for userId: ${userId}`);

    // Look through all projects for this user to find a diagram with matching ID
    const projects = await this.projectRepository.findAll(userId);

    for (const project of projects) {
      if (project.analysisResultModel?.design) {
        const diagram = project.analysisResultModel.design;
        if (diagram) {
          logger.info(
            `Found diagram with ID: ${diagramId} for userId: ${userId}`
          );
          return diagram;
        }
      }
    }

    logger.warn(
      `Diagram with ID: ${diagramId} not found for userId: ${userId}`
    );
    return null;
  }

  async updateDiagram(
    userId: string,
    diagramId: string,
    data: Partial<DiagramModel>
  ): Promise<ProjectModel | null> {
    logger.info(
      `Updating diagram for userId: ${userId}, diagramId: ${diagramId}`
    );

    // Find which project contains this diagram
    const projects = await this.projectRepository.findAll(userId);
    let targetProject: ProjectModel | null = null;
    let diagramIndex = -1;

    for (const project of projects) {
      if (project.analysisResultModel?.design) {
        targetProject = project;
      }
    }

    if (!targetProject || diagramIndex === -1) {
      logger.warn(
        `Diagram with ID: ${diagramId} not found for user: ${userId} when updating.`
      );
      return null;
    }

    // Create updated diagram by merging existing with updates
    const updatedDiagram = {
      ...targetProject.analysisResultModel.design,
      ...data,
      updatedAt: new Date(),
    };

    // Create updated design array
    const updatedDesign = targetProject.analysisResultModel.design;

    const updatedProject = {
      ...targetProject,
      analysisResultModel: {
        ...targetProject.analysisResultModel,
        design: updatedDesign,
      },
    };

    const result = await this.projectRepository.update(
      targetProject.id!,
      updatedProject,
      userId
    );
    logger.info(
      `Successfully updated diagram with ID: ${diagramId} for userId: ${userId}`
    );
    return result;
  }

  async deleteDiagram(userId: string, diagramId: string): Promise<boolean> {
    logger.info(
      `Removing diagram for userId: ${userId}, diagramId: ${diagramId}`
    );

    // Find which project contains this diagram
    const projects = await this.projectRepository.findAll(userId);
    let targetProject: ProjectModel | null = null;

    for (const project of projects) {
      if (project.analysisResultModel?.design) {
        targetProject = project;
        break;
      }
    }

    if (!targetProject) {
      logger.warn(
        `Diagram with ID: ${diagramId} not found for user: ${userId} when deleting.`
      );
      return false;
    }

    // Filter out the diagram to delete
    const updatedDesign = targetProject.analysisResultModel.design;

    // Update the project
    const updatedProject = {
      ...targetProject,
      analysisResultModel: {
        ...targetProject.analysisResultModel,
        design: updatedDesign,
      },
    };

    await this.projectRepository.update(
      targetProject.id!,
      updatedProject,
      userId
    );
    logger.info(
      `Successfully deleted diagram: ${diagramId} for userId: ${userId}`
    );
    return true;
  }
}
