import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { DiagramModel } from "../../models/diagram.model";
import { TargetModelType } from "../../enums/targetModelType.enum";

export class DiagramService {
  private repository: IRepository<DiagramModel>;

  constructor() {
    this.repository = RepositoryFactory.getRepository<DiagramModel>(
      TargetModelType.DIAGRAMS
    );
  }

  async generateDiagram(
    userId: string,
    projectId: string,
    data: Omit<DiagramModel, "id" | "createdAt" | "updatedAt" | "projectId">
  ): Promise<DiagramModel> {
    const newDiagramData: Omit<DiagramModel, "id" | "createdAt" | "updatedAt"> =
      {
        projectId,
        ...data,
      };
    return this.repository.create(newDiagramData, userId);
  }

  async getDiagramsByProjectId(
    userId: string,
    projectId: string
  ): Promise<DiagramModel[]> {
    const allDiagrams = await this.repository.findAll(userId);
    return allDiagrams.filter(
      (diagram: DiagramModel) => diagram.projectId === projectId
    );
  }

  async getDiagramById(
    userId: string,
    diagramId: string
  ): Promise<DiagramModel | null> {
    return this.repository.findById(diagramId, userId);
  }

  async updateDiagram(
    userId: string,
    diagramId: string,
    data: Partial<
      Omit<DiagramModel, "id" | "projectId" | "createdAt" | "updatedAt">
    >
  ): Promise<DiagramModel | null> {
    const updatePayload: Partial<
      Omit<DiagramModel, "id" | "createdAt" | "updatedAt">
    > = data;
    return this.repository.update(diagramId, updatePayload, userId);
  }

  async deleteDiagram(userId: string, diagramId: string): Promise<void> {
    await this.repository.delete(diagramId, userId);
  }
}
