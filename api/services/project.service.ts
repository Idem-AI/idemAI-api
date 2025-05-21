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

  private createDirectoryStructure(zipInstance: JSZip) {
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
  }

  async generateAgenticZip(userId: string, projectId: string): Promise<Buffer> {
    const project = await this.projectRepository.findById(projectId, userId);
    if (!project) {
      throw new Error(
        `Project with ID ${projectId} not found for user ${userId}`
      );
    }

    const zip = new JSZip();
    const sourceDirectory = path.resolve(__dirname, "../lexi-agentic");

    // List of text file extensions that can be processed for replacement
    const textFileExtensions = [
      ".md",
      ".txt",
      ".json",
      ".js",
      ".ts",
      ".html",
      ".css",
      ".scss",
      ".yaml",
      ".yml",
      ".xml",
      ".svg",
      ".jsx",
      ".tsx",
      ".vue",
      ".config",
      ".json5",
      ".env",
      ".gitignore",
      ".eslintrc",
      ".prettierrc",
      ".babelrc",
    ];

    // Recursive function to replace nested placeholders
    const processNestedPlaceholders = (
      content: string,
      prefix: string,
      obj: any
    ): string => {
      if (!obj || typeof obj !== "object") return content;

      // Handle arrays
      if (Array.isArray(obj)) {
        // Replace the placeholder for the entire array with its JSON version
        content = content.replace(
          new RegExp(`{{${prefix}}}`, "g"),
          JSON.stringify(obj, null, 2)
        );

        // If the array has elements, also process the indexed elements
        obj.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            content = processNestedPlaceholders(
              content,
              `${prefix}[${index}]`,
              item
            );
          } else if (item !== undefined && item !== null) {
            content = content.replace(
              new RegExp(`{{${prefix}\[${index}\]}}`, "g"),
              String(item)
            );
          }
        });
        return content;
      }

      // Handle objects
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          const newPrefix = prefix ? `${prefix}.${key}` : key;

          if (typeof value === "object" && value !== null) {
            // Recursion for nested objects
            content = processNestedPlaceholders(content, newPrefix, value);
          } else if (value !== undefined && value !== null) {
            // Replace final values directly
            content = content.replace(
              new RegExp(`{{${newPrefix}}}`, "g"),
              String(value)
            );
          }
        }
      }
      return content;
    };

    // Function to replace placeholders in the content
    const replacePlaceholders = (content: string): string => {
      // Replace project properties
      content = content.replace(/{{project.id}}/g, JSON.stringify(project.id));
      content = content.replace(
        /{{project.name}}/g,
        JSON.stringify(project.name)
      );
      content = content.replace(
        /{{project.description}}/g,
        JSON.stringify(project.description)
      );
      content = content.replace(
        /{{project.type}}/g,
        JSON.stringify(project.type)
      );
      content = content.replace(
        /{{project.constraints}}/g,
        JSON.stringify(project.constraints)
      );
      content = content.replace(
        /{{project.teamSize}}/g,
        JSON.stringify(project.teamSize)
      );
      content = content.replace(
        /{{project.scope}}/g,
        JSON.stringify(project.scope)
      );
      content = content.replace(
        /{{project.budgetIntervals}}/g,
        JSON.stringify(project.budgetIntervals)
      );
      content = content.replace(
        /{{project.targets}}/g,
        JSON.stringify(project.targets)
      );
      content = content.replace(
        /{{project.createdAt}}/g,
        JSON.stringify(project.createdAt.toISOString())
      );
      content = content.replace(
        /{{project.updatedAt}}/g,
        JSON.stringify(project.updatedAt.toISOString())
      );
      content = content.replace(
        /{{project.userId}}/g,
        JSON.stringify(project.userId)
      );
      content = content.replace(
        /{{project.selectedPhases}}/g,
        JSON.stringify(project.selectedPhases)
      );

      // Replace entire analysisResultModel object
      content = content.replace(
        /{{project.analysisResultModel}}/g,
        JSON.stringify(project.analysisResultModel, null, 2)
      );

      // Replace specific sections of analysisResultModel
      const sections = [
        "planning.feasibilityStudy",
        "planning.riskanalysis",
        "planning.requirementsGathering",
        "planning.smartObjectives",
        "planning.stakeholdersMeeting",
        "planning.useCaseModeling",
        "branding.brandDefinition",
        "branding.toneOfVoice",
        "branding.visualIdentityGuidelines",
        "branding.typographySystem",
        "branding.colorSystem",
        "branding.iconographyAndImagery",
        "branding.layoutAndComposition",
        "branding.logo",
        "branding.globalCss",
        "branding.summary",
      ];

      sections.forEach((section) => {
        const path = section.split(".");
        let value: any = project.analysisResultModel;
        for (const key of path) {
          value = value?.[key];
        }
        content = content.replace(
          new RegExp(`{{project.analysisResultModel.${section}.content}}`, "g"),
          JSON.stringify(value?.content || "")
        );
      });

      // Process all nested placeholders in analysisResultModel
      content = processNestedPlaceholders(
        content,
        "project.analysisResultModel",
        project.analysisResultModel
      );

      return content;
    };

    // Create the base structure
    this.createDirectoryStructure(zip);

    // Function to read the content of a source file
    const readSourceFile = async (
      relativePath: string
    ): Promise<string | null> => {
      try {
        const fullPath = path.join(sourceDirectory, relativePath);
        const content = await fs.readFile(fullPath, "utf-8");
        return content;
      } catch (error) {
        console.error(`Error reading source file ${relativePath}:`, error);
        return null;
      }
    };

    // Process all files in the zip and replace their content
    const processZipFiles = async (zipInstance: JSZip) => {
      const promises: Promise<void>[] = [];

      zipInstance.forEach((relativePath, file) => {
        if (!file.dir) {
          const ext = path.extname(relativePath).toLowerCase();
          if (textFileExtensions.includes(ext)) {
            promises.push(
              (async () => {
                const sourceContent = await readSourceFile(relativePath);
                if (sourceContent) {
                  const updatedContent = replacePlaceholders(sourceContent);
                  zipInstance.file(relativePath, updatedContent);
                }
              })()
            );
          }
        }
      });

      await Promise.all(promises);
    };

    // Process all files
    await processZipFiles(zip);

    return zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });
  }
}

export const projectService = new ProjectService();
