import { ProjectModel } from "../models/project.model";
import { IRepository } from "../repository/IRepository";
import { RepositoryFactory } from "../repository/RepositoryFactory";
import * as fs from "fs-extra";
import * as path from "path";
import JSZip from "jszip";

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

  async generateAgenticZip(userId: string, projectId: string): Promise<Buffer> {
    const project = await this.projectRepository.findById(projectId, userId);
    if (!project) {
      throw new Error(
        `Project with ID ${projectId} not found for user ${userId}`
      );
    }

    const zip = new JSZip();

    // Create the exact directory structure
    const createDirectoryStructure = (zipInstance: JSZip) => {
      // Root level files
      zipInstance.file("Inspiration.md", "");
      zipInstance.file("logic.md", "");
      zipInstance.file("project_session_state.json", "");
      zipInstance.file("README.md", "");
      zipInstance.file("workflow.md", "");

      // 01_AI-RUN directory
      const aiRunDir = zipInstance.folder("01_AI-RUN");
      if (aiRunDir) {
        aiRunDir.file("00_Getting_Started.md", "");
        aiRunDir.file("01_AutoPilot.md", "");
        aiRunDir.file("01_Idea.md", "");
        aiRunDir.file("02_Market_Research.md", "");
        aiRunDir.file("03_Core_Concept.md", "");
        aiRunDir.file("04_PRD_Generation.md", "");
        aiRunDir.file("05_Specs_Docs.md", "");
        aiRunDir.file("06_Task_Manager.md", "");
        aiRunDir.file("07_Start_Building.md", "");
        aiRunDir.file("08_Testing.md", "");
        aiRunDir.file("09_Deployment.md", "");

        // Template subdirectory
        const templateDir = aiRunDir.folder("Template");
        if (templateDir) {
          templateDir.file("PRD_template.md", "");
          templateDir.file("MCP-Server.json", "");
          templateDir.file("MCP-Context.md", "");
        }
      }

      // 02_AI-DOCS directory
      const aiDocsDir = zipInstance.folder("02_AI-DOCS");
      if (aiDocsDir) {
        // TaskManagement
        const taskManagementDir = aiDocsDir.folder("TaskManagement");
        if (taskManagementDir) {
          taskManagementDir.file("Tasks_JSON_Structure.md", "");
          taskManagementDir.file("Roo_Task_Workflow.md", "");
        }

        // Integrations
        const integrationsDir = aiDocsDir.folder("Integrations");
        if (integrationsDir) {
          integrationsDir.file("api_integration_template.md", "");
        }

        // Documentation
        const documentationDir = aiDocsDir.folder("Documentation");
        if (documentationDir) {
          documentationDir.file("AI_Task_Management_Optimization.md", "");
          documentationDir.file("AI_Design_Agent_Optimization.md", "");
          documentationDir.file("AI_Coding_Agent_Optimization.md", "");
        }

        // Deployment
        const deploymentDir = aiDocsDir.folder("Deployment");
        if (deploymentDir) {
          deploymentDir.file("deployment_guide_template.md", "");
        }

        // Conventions
        const conventionsDir = aiDocsDir.folder("Conventions");
        if (conventionsDir) {
          conventionsDir.file("design_conventions_template.md", "");
          conventionsDir.file("coding_conventions_template.md", "");
        }

        // BusinessLogic
        const businessLogicDir = aiDocsDir.folder("BusinessLogic");
        if (businessLogicDir) {
          businessLogicDir.file("business_logic_template.md", "");
        }

        // Architecture
        const architectureDir = aiDocsDir.folder("Architecture");
        if (architectureDir) {
          architectureDir.file("architecture_template.md", "");
        }

        // AI-Coder
        const aiCoderDir = aiDocsDir.folder("AI-Coder");
        if (aiCoderDir) {
          // TestGenerators
          const testGeneratorsDir = aiCoderDir.folder("TestGenerators");
          if (testGeneratorsDir) {
            testGeneratorsDir.file("test_generator_template.md", "");
          }

          // Refactoring
          const refactoringDir = aiCoderDir.folder("Refactoring");
          if (refactoringDir) {
            refactoringDir.file("refactoring_template.md", "");
          }

          // ContextPrime
          const contextPrimeDir = aiCoderDir.folder("ContextPrime");
          if (contextPrimeDir) {
            contextPrimeDir.file("context_prime_template.md", "");
          }

          // CommonTasks
          const commonTasksDir = aiCoderDir.folder("CommonTasks");
          if (commonTasksDir) {
            commonTasksDir.file("api_endpoint_template.md", "");
          }
        }
      }

      // 03_SPECS directory
      const specsDir = zipInstance.folder("03_SPECS");
      if (specsDir) {
        // features
        const featuresDir = specsDir.folder("features");
        if (featuresDir) {
          featuresDir.file("feature_spec_template.md", "");
        }

        // bugfixes
        const bugfixesDir = specsDir.folder("bugfixes");
        if (bugfixesDir) {
          bugfixesDir.file("bugfix_spec_template.md", "");
        }
      }

      // tasks directory
      const tasksDir = zipInstance.folder("tasks");
      if (tasksDir) {
        tasksDir.file("tasks.json", "");
      }
    };

    // Create the directory structure
    createDirectoryStructure(zip);

    return zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });
  }
}

export const projectService = new ProjectService();
