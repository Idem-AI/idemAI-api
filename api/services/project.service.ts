import { ProjectModel } from "../models/project.model";
import { IRepository } from "../repository/IRepository";
import { RepositoryFactory } from "../repository/RepositoryFactory";
import * as fs from 'fs-extra'; 
import * as path from 'path';
import JSZip from 'jszip';

class ProjectService {
  private projectRepository: IRepository<ProjectModel>;

  constructor() {
    this.projectRepository =
      RepositoryFactory.getRepository<ProjectModel>("projects");
  }

  async createUserProject(
    userId: string,
    projectData: Omit<ProjectModel, "id" | "createdAt" | "updatedAt" | "userId">
  ): Promise<string> {
    if (!userId) {
      console.error("User ID is required to create a project.");
      throw new Error("User ID is required.");
    }

    try {
      const projectToCreate: Omit<
        ProjectModel,
        "id" | "createdAt" | "updatedAt"
      > = {
        ...projectData,
        userId: userId,
      };

      const newProject = await this.projectRepository.create(
        projectToCreate,
        userId
      );
      if (!newProject || !newProject.id) {
        throw new Error("Project creation failed or project ID is missing.");
      }
      console.log("Project added successfully, ID:", newProject.id);
      return newProject.id;
    } catch (error) {
      console.error("Error creating project in service:", error);
      throw error;
    }
  }

  async getAllUserProjects(userId: string): Promise<ProjectModel[]> {
    if (!userId) {
      console.log("User ID is required to get projects.");
      return [];
    }

    try {
      const projects = await this.projectRepository.findAll(userId);
      console.log("Projects fetched via repository:", projects.length);
      return projects;
    } catch (error) {
      console.error("Error fetching projects in service:", error);
      throw error;
    }
  }

  async getUserProjectById(
    userId: string,
    projectId: string
  ): Promise<ProjectModel | null> {
    if (!userId || !projectId) {
      console.error("User ID and Project ID are required.");
      return null;
    }

    try {
      const project = await this.projectRepository.findById(projectId, userId);
      if (!project) {
        console.log(
          `Project ${projectId} not found for user ${userId} via repository`
        );
        return null;
      }
      console.log("Project data fetched via repository:", project);
      return project;
    } catch (error) {
      console.error(`Error fetching project ${projectId} in service:`, error);
      throw error;
    }
  }

  async deleteUserProject(userId: string, projectId: string): Promise<void> {
    if (!userId || !projectId) {
      console.error("User ID and Project ID are required for deletion.");
      throw new Error("User ID and Project ID are required.");
    }

    try {
      const success = await this.projectRepository.delete(projectId, userId);
      if (success) {
        console.log(`Project ${projectId} deleted successfully via repository`);
      } else {
        console.log(
          `Project ${projectId} not found for deletion or delete failed via repository`
        );
      }
    } catch (error) {
      console.error(`Error deleting project ${projectId} in service:`, error);
      throw error;
    }
  }

  async editUserProject(
    userId: string,
    projectId: string,
    updatedData: Partial<
      Omit<ProjectModel, "id" | "createdAt" | "updatedAt" | "userId">
    >
  ): Promise<void> {
    if (!userId || !projectId) {
      console.error("User ID and Project ID are required for update.");
      throw new Error("User ID and Project ID are required.");
    }

    try {
      const updatedProject = await this.projectRepository.update(
        projectId,
        updatedData,
        userId
      );
      if (updatedProject) {
        console.log(`Project ${projectId} updated successfully via repository`);
      } else {
        console.log(
          `Project ${projectId} not found for update or update failed via repository`
        );
        throw new Error(
          `Project ${projectId} not found for update or update failed.`
        );
      }
    } catch (error) {
      console.error(`Error updating project ${projectId} in service:`, error);
      throw error;
    }
  }

  getProjectDescriptionForPrompt(project: ProjectModel): string {
    const constraints =
      project.constraints && project.constraints.length > 0
        ? project.constraints.join(", ")
        : "Non spécifiées";
    const teamSize =
      project.teamSize !== undefined
        ? `${project.teamSize} développeurs`
        : "Non spécifiée";
    const scope = project.scope || "Non spécifié";
    const budgetIntervals = project.budgetIntervals || "Non spécifiée";
    const targets = project.targets || "Non spécifié";
    const type = project.type || "Non spécifié";
    const description = project.description || "Non spécifiée";

    const projectDescription = `
        Projet à analyser :
        - Nom du projet: ${project.name}
        - Description du projet : ${description}
        - Type d'application : ${type}
        - Contraintes techniques principales : ${constraints}
        - Composition de l'équipe : ${teamSize}
        - Périmètre fonctionnel couvert : ${scope}
        - Fourchette budgétaire prévue : ${budgetIntervals}
        - Publics cibles concernés : ${targets}
    `;
    return projectDescription.trim();
  }

  async generateAgenticZip(
    userId: string,
    projectId: string
  ): Promise<Buffer> {
    const project = await this.projectRepository.findById(projectId, userId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found for user ${userId}`);
    }

    const zip = new JSZip();
    const sourceDirectory = '/Users/admin/Documents/pharaon/personal/lexis-api/api/lexi-agentic'; 

    const addDirectoryToZip = async (dirPath: string, zipInstance: JSZip) => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(sourceDirectory, fullPath);

        if (entry.isDirectory()) {
          const folder = zipInstance.folder(relativePath);
          if (folder) { 
            await addDirectoryToZip(fullPath, folder);
          }
        } else if (entry.isFile()) {
          let content = await fs.readFile(fullPath, 'utf-8');
          
          content = content.replace(/{{project.id}}/g, project.id || '');
          content = content.replace(/{{project.name}}/g, project.name);
          content = content.replace(/{{project.description}}/g, project.description);
          content = content.replace(/{{project.type}}/g, project.type);
          content = content.replace(/{{project.constraints}}/g, project.constraints.join(', '));
          content = content.replace(/{{project.teamSize}}/g, project.teamSize);
          content = content.replace(/{{project.scope}}/g, project.scope);
          content = content.replace(/{{project.budgetIntervals}}/g, project.budgetIntervals || '');
          content = content.replace(/{{project.targets}}/g, project.targets);
          content = content.replace(/{{project.createdAt}}/g, project.createdAt.toISOString());
          content = content.replace(/{{project.updatedAt}}/g, project.updatedAt.toISOString());
          content = content.replace(/{{project.userId}}/g, project.userId);
          content = content.replace(/{{project.selectedPhases}}/g, project.selectedPhases.join(', '));
          content = content.replace(/{{project.analysisResultModel}}/g, JSON.stringify(project.analysisResultModel, null, 2));

          zipInstance.file(relativePath, content);
        }
      }
    };

    await addDirectoryToZip(sourceDirectory, zip);

    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } });
  }
}

export const projectService = new ProjectService();
