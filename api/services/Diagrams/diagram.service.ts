import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { DiagramModel } from "../../models/diagram.model";
import { TargetModelType } from "../../enums/targetModelType.enum";
import logger from "../../config/logger";

export class DiagramService {
  private repository: IRepository<DiagramModel>;

  constructor() {
    logger.info('DiagramService initialized.');
    this.repository = RepositoryFactory.getRepository<DiagramModel>(
      TargetModelType.DIAGRAMS
    );
  }

  async generateDiagram(
    userId: string,
    projectId: string, // Note: projectId is received but not directly used in the Omit for newDiagramData construction. Assuming it's for context or future use.
    data: Omit<DiagramModel, "id" | "createdAt" | "updatedAt" | "projectId">
  ): Promise<DiagramModel> {
    logger.info(`generateDiagram called for userId: ${userId}, projectId: ${projectId}`);
    try {
    const newDiagramData: Omit<DiagramModel, "id" | "createdAt" | "updatedAt"> =
      {
        // Assuming DiagramModel might have a projectId field that should be set.
        // If 'data' can contain 'projectId', it's covered. Otherwise, it might need to be explicitly added if required by the model structure for creation.
        // For now, strictly following the existing logic where projectId from params isn't directly merged into newDiagramData unless part of 'data'.
        ...data,
      };
    const diagram = await this.repository.create(newDiagramData, userId);
    logger.info(`Diagram generated successfully for userId: ${userId}, diagramId: ${diagram.id}`);
    return diagram;
    } catch (error: any) {
      logger.error(`Error in generateDiagram for userId ${userId}, projectId ${projectId}: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }

  async getDiagramsByProjectId(
    userId: string,
    projectId: string
  ): Promise<DiagramModel[]> {
    logger.info(`getDiagramsByProjectId called for userId: ${userId}, projectId: ${projectId}`);
    // POTENTIAL ISSUE TO REVIEW: The filter condition 'diagram.id === projectId' might be incorrect.
    // It seems to compare a diagram's ID with a project's ID. 
    // Should it be 'diagram.projectId === projectId' if DiagramModel has a 'projectId' field?
    logger.debug("Review filter: diagram.id === projectId in getDiagramsByProjectId. This might be a logical error."); 
    try {
    const allDiagrams = await this.repository.findAll(userId);
    const filteredDiagrams = allDiagrams.filter(
      (diagram: DiagramModel) => diagram.id === projectId // Keeping original logic as per current task scope
    );
    logger.info(`Found ${filteredDiagrams.length} diagrams matching filter for projectId: ${projectId} (using diagram.id for filter)`);
    return filteredDiagrams;
    } catch (error: any) {
      logger.error(`Error in getDiagramsByProjectId for projectId ${projectId}: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async getDiagramById(
    userId: string,
    diagramId: string
  ): Promise<DiagramModel | null> {
    logger.info(`getDiagramById called for userId: ${userId}, diagramId: ${diagramId}`);
    try {
    const diagram = await this.repository.findById(diagramId, userId);
    if (!diagram) {
      logger.warn(`Diagram not found with diagramId: ${diagramId} for userId: ${userId}`);
      return null;
    }
    logger.info(`Diagram found successfully with diagramId: ${diagramId}`);
    return diagram;
    } catch (error: any) {
      logger.error(`Error in getDiagramById for diagramId ${diagramId}: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async updateDiagram(
    userId: string,
    diagramId: string,
    data: Partial<
      Omit<DiagramModel, "id" | "projectId" | "createdAt" | "updatedAt">
    >
  ): Promise<DiagramModel | null> {
    logger.info(`updateDiagram called for userId: ${userId}, diagramId: ${diagramId}`);
    try {
    const updatePayload: Partial<
      Omit<DiagramModel, "id" | "createdAt" | "updatedAt">
    > = data;
    const updatedDiagram = await this.repository.update(diagramId, updatePayload, userId);
    if (!updatedDiagram) {
      logger.warn(`Diagram not found or failed to update for diagramId: ${diagramId}`);
      return null;
    }
    logger.info(`Diagram updated successfully for diagramId: ${diagramId}`);
    return updatedDiagram;
    } catch (error: any) {
      logger.error(`Error in updateDiagram for diagramId ${diagramId}: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }

  async deleteDiagram(userId: string, diagramId: string): Promise<void> {
    logger.info(`deleteDiagram called for userId: ${userId}, diagramId: ${diagramId}`);
    try {
    const result = await this.repository.delete(diagramId, userId);
    if (!result) {
       logger.warn(`Diagram not found or failed to delete for diagramId: ${diagramId}, userId: ${userId}`);
       // Depending on repository.delete contract
       return; 
    }
    logger.info(`Diagram deleted successfully for diagramId: ${diagramId}`);
    } catch (error: any) {
      logger.error(`Error in deleteDiagram for diagramId ${diagramId}: ${error.message}`, { stack: error.stack, userId });
      throw error;
    }
  }
}
