import { PromptService } from "../prompt.service";
import { ProjectModel } from "../../models/project.model";
import logger from "../../config/logger";
import { DiagramModel } from "../../models/diagram.model";
import { ARCHITECTURE_DIAGRAM_PROMPT } from "./prompts/01_architecture_diagram.prompt";
import { CLASS_DIAGRAM_PROMPT } from "./prompts/02_class-diagram.prompt";
import { ENTITY_DIAGRAM_PROMPT } from "./prompts/03_entity_diagram.prompt";
import { SEQUENCE_DIAGRAM_PROMPT } from "./prompts/04_sequence_diagram.prompt";
import { USE_CASE_DIAGRAM_PROMPT } from "./prompts/01_use-case-diagram.prompt";
import { GenericService, IPromptStep, ISectionResult } from "../common/generic.service";
import { SectionModel } from "../../models/section.model";
import { EventEmitter } from "events";

// Import diagram prompts

export class DiagramService extends GenericService {
  private streamEmitter: EventEmitter;
  constructor(promptService: PromptService) {
    super(promptService);
    this.streamEmitter = new EventEmitter();
    logger.info("DiagramService initialized.");
  }

  async generateDiagram(
    userId: string,
    projectId: string,
    streamCallback?: (sectionResult: ISectionResult) => void
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

      // Initialize empty sections array to collect results as they come in
      let sections: SectionModel[] = [];
      
      // Process steps one by one with streaming
      await this.processStepsWithStreaming(
        steps, 
        project,
        async (result: ISectionResult) => {
          logger.info(`Received streamed result for step: ${result.name}`);
          
          // Convert result to section model
          const section: SectionModel = {
            name: result.name,
            type: result.type,
            data: result.data,
            summary: result.summary,
          };
          
          // Add to our local collection
          sections.push(section);
          
          // Get the latest project version
          const currentProject = await this.projectRepository.findById(projectId, `users/${userId}/projects`);
          if (!currentProject) {
            logger.warn(`Project not found with ID: ${projectId} for user: ${userId} during streaming update`);
            return;
          }
          
          // Get existing diagrams
          const existingDiagrams = currentProject.analysisResultModel?.design?.sections || [];
          
          // Filter out diagrams that need to be updated
          const updatedDiagrams = [
            ...existingDiagrams.filter((d: SectionModel) => 
              !sections.some((s) => s.name === d.name)
            ),
            ...sections,
          ];
          
          // Create updated project with new diagram sections
          const updatedProject = {
            ...currentProject,
            analysisResultModel: {
              ...currentProject.analysisResultModel,
              design: {
                sections: updatedDiagrams,
                id: `diagram_${projectId}_${Date.now()}`,
                createdAt: currentProject.analysisResultModel?.design?.createdAt || new Date(),
                updatedAt: new Date(),
              },
            },
          };
          
          // Update project in the database after each step
          await this.projectRepository.update(
            projectId,
            updatedProject,
            `users/${userId}/projects`
          );
          
          logger.info(`Updated project with new diagram: ${result.name}`);
          
          // Call the stream callback if provided
          if (streamCallback) {
            streamCallback(result);
          }
        }
      );
      
      // Get the final updated project
      const updatedProject = await this.projectRepository.findById(projectId, `users/${userId}/projects`);

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

  /**
   * Process steps with streaming, calling a callback for each completed step
   * @param steps Array of prompt steps
   * @param project Project model
   * @param stepCallback Callback function called after each step completes
   * @param promptConfig Optional prompt configuration
   * @param promptType Optional prompt type
   * @param userId Optional user ID
   */
  private async processStepsWithStreaming(
    steps: IPromptStep[],
    project: ProjectModel,
    stepCallback: (result: ISectionResult) => Promise<void>,
    promptConfig?: any,
    promptType?: string,
    userId?: string
  ): Promise<void> {
    const completedSteps: { name: string; content: string }[] = [];

    for (const step of steps) {
      const hasDependencies = 
        step.hasDependencies !== undefined ? step.hasDependencies : true;

      // Construire le contexte des étapes précédentes si nécessaire
      let contextFromPreviousSteps = "";

      if (hasDependencies && step.requiresSteps && step.requiresSteps.length > 0) {
        // Filtrer et concaténer uniquement les étapes spécifiées
        const requiredSteps = completedSteps.filter(s => 
          step.requiresSteps!.includes(s.name)
        );

        contextFromPreviousSteps = requiredSteps
          .map(s => `## ${s.name}\n\n${s.content}\n\n---\n`)
          .join("\n");

        logger.info(
          `Built context for step '${step.stepName}' from ${requiredSteps.length} required steps: [${requiredSteps.map(s => s.name).join(", ")}]`
        );
      } else if (hasDependencies && (!step.requiresSteps || step.requiresSteps.length === 0)) {
        // Inclure toutes les étapes précédentes si hasDependencies=true mais requiresSteps non spécifié
        contextFromPreviousSteps = completedSteps
          .map(s => `## ${s.name}\n\n${s.content}\n\n---\n`)
          .join("\n");

        logger.info(
          `Built context for step '${step.stepName}' from all ${completedSteps.length} previous steps`
        );
      } else {
        logger.info(
          `No context needed for step '${step.stepName}' (no dependencies)`
        );
      }
      
      const messages = [
        {
          role: "system" as const,
          content: contextFromPreviousSteps,
        },
        {
          role: "user" as const,
          content: step.promptConstant,
        },
      ];
      
      // Exécuter l'étape actuelle avec le contexte construit
      const content = await this.runStepAndAppend(
        step,
        project,
        true,
        messages,
        userId,
        promptType || step.stepName,
        contextFromPreviousSteps,
        promptConfig
      );

      // Stocker le contenu de cette étape pour les étapes futures
      completedSteps.push({
        name: step.stepName,
        content: content,
      });

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

      const sectionResult: ISectionResult = {
        name: step.stepName,
        type: "text/markdown",
        data: content,
        summary: `${step.stepName} for Project ${project.id}`,
        parsedData: parsedData,
      };

      // Call the callback with the result
      await stepCallback(sectionResult);
    }
  }
}
