import { PromptService } from "../prompt.service";
import { ProjectModel } from "../../models/project.model";
import logger from "../../config/logger";
import { DiagramModel } from "../../models/diagram.model";
import { ARCHITECTURE_DIAGRAM_PROMPT } from "./prompts/01_architecture_diagram.prompt";
import { CLASS_DIAGRAM_PROMPT } from "./prompts/02_class-diagram.prompt";
import { ENTITY_DIAGRAM_PROMPT } from "./prompts/03_entity_diagram.prompt";
import { SEQUENCE_DIAGRAM_PROMPT } from "./prompts/04_sequence_diagram.prompt";
import { USE_CASE_DIAGRAM_PROMPT } from "./prompts/01_use-case-diagram.prompt";
import { GenericService, IPromptStep } from "../common/generic.service";
import { SectionModel } from "../../models/section.model";

// Import diagram prompts

export class DiagramService extends GenericService {
  constructor(promptService: PromptService) {
    super(promptService);
    logger.info("DiagramService initialized.");
  }

  async generateDiagram(
    userId: string,
    projectId: string
  ): Promise<ProjectModel | null> {
    logger.info(
      `Generating diagrams for userId: ${userId}, projectId: ${projectId}`
    );

    // Get project
    const project = await this.getProject(projectId, userId);
    if (!project) {
      return null;
    }

    try {
      // Define diagram steps
      const steps: IPromptStep[] = [
        {
          promptConstant: USE_CASE_DIAGRAM_PROMPT,
          stepName: "Uses Cases Diagram",
          hasDependencies: false,
        },
        {
          promptConstant: CLASS_DIAGRAM_PROMPT,
          stepName: "Class Diagram",
          requiresSteps: ["Uses Cases Diagram"],
        },
        {
          promptConstant: ARCHITECTURE_DIAGRAM_PROMPT,
          stepName: "Architecture Diagram",
          requiresSteps: ["Uses Cases Diagram"],
        },
        {
          promptConstant: ENTITY_DIAGRAM_PROMPT,
          stepName: "Entity Relationship Diagram",
          requiresSteps: ["Uses Cases Diagram"],
        },
        {
          promptConstant: SEQUENCE_DIAGRAM_PROMPT,
          stepName: "Sequence Diagram",
          requiresSteps: ["Uses Cases Diagram"],
        },
      ];

      // Generate each diagram section sequentially
      // Process all steps and get results
      const sectionResults = await this.processSteps(steps, project);

      // Map sections from results
      const sections: SectionModel[] = sectionResults.map((result) => ({
        name: result.name,
        type: result.type,
        data: result.data,
        summary: result.summary,
      }));

      // Get the existing project to prepare for update
      const oldProject = await this.projectRepository.findById(projectId, `users/${userId}/projects`);
      if (!oldProject) {
        logger.warn(
          `Original project not found with ID: ${projectId} for user: ${userId} before updating with diagrams.`
        );
        return null;
      }

      // Filter out diagrams that need to be updated
      const existingDiagrams = oldProject.analysisResultModel?.design?.sections || [];
      const updatedDiagrams = [
        ...existingDiagrams.filter((d: SectionModel) =>
          !sections.some((s) => s.name === d.name)
        ),
        ...sections,
      ];

      // Create updated project with new diagram sections
      const newProject = {
        ...oldProject,
        analysisResultModel: {
          ...oldProject.analysisResultModel,
          design: {
            sections: updatedDiagrams,
            id: `diagram_${projectId}_${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      // Update the project in the database
      const updatedProject = await this.projectRepository.update(
        projectId,
        newProject,
        `users/${userId}/projects`
      );

      if (updatedProject) {
        logger.info(
          `Successfully updated project with ID: ${projectId} with diagrams`
        );
      }
      return updatedProject;
    } catch (error) {
      logger.error(
        `Error generating diagrams for projectId ${projectId}:`,
        error
      );
      return null;
    } finally {
      try {
        logger.info(`Attempting to remove temporary file:`);
      } catch (cleanupError) {
        logger.error(`Error removing temporary file:`, cleanupError);
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
    const project = await this.projectRepository.findById(projectId, `users/${userId}/projects`);
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
    const projects = await this.projectRepository.findAll(`users/${userId}/projects`);

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
    const projects = await this.projectRepository.findAll(`users/${userId}/projects`);
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
      `users/${userId}/projects`
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
    const projects = await this.projectRepository.findAll(`users/${userId}/projects`);
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
      `users/${userId}/projects`
    );
    logger.info(
      `Successfully deleted diagram: ${diagramId} for userId: ${userId}`
    );
    return true;
  }
}
