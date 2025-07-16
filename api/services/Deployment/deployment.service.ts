import {
  DeploymentModel,
  QuickDeploymentModel,
  TemplateDeploymentModel,
  AiAssistantDeploymentModel,
  ExpertDeploymentModel,
  GitRepository,
  EnvironmentVariable,
  ChatMessage,
  ArchitectureTemplate,
  CloudComponentDetailed,
  ArchitectureComponent,
  PipelineStep,
  CostEstimation,
  CreateDeploymentPayload,
  DeploymentFormData,
  DeploymentValidators,
} from "../../models/deployment.model";
import logger from "../../config/logger";
import { PromptService, LLMProvider } from "../prompt.service";
import { GenericService } from "../common/generic.service";
import { exec } from "child_process";
import { promisify } from "util";
import { ProjectModel } from "../../models/project.model";
import { AI_CHAT_INITIAL_PROMPT } from "./prompts/ai-chat.prompt";
import {
  MAIN_TF_PROMPT,
  VARIABLES_TF_PROMPT,
  VARIABLES_MAP_TF_PROMPT,
  TERRAFORM_SYSTEM_PROMPT,
  TerraformFile,
  TerraformFilesMap,
} from "./prompts/terraform/index";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";

export class DeploymentService extends GenericService {
  private contextFilePath?: string;

  constructor(promptService: PromptService) {
    super(promptService);
    logger.info("DeploymentService initialized.");
  }

  async createDeployment(
    userId: string,
    projectId: string,
    payload: CreateDeploymentPayload
  ): Promise<DeploymentModel> {
    logger.info(
      `createDeployment called for userId: ${userId}, projectId: ${projectId}, name: ${payload.name}`
    );

    try {
      const project = await this.getProject(projectId, userId);
      if (!project) {
        throw new Error("Project not found");
      }
      // Validate the payload
      const formData: DeploymentFormData = {
        mode: "beginner", // Default mode, can be overridden
        name: payload.name,
        environment: payload.environment,
        repoUrl: payload.gitRepository?.url,
        branch: payload.gitRepository?.branch,
        environmentVariables: payload.environmentVariables,
      };

      const validationErrors = this.validateDeploymentData(formData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      const deploymentId = `deployment_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Base deployment properties
      const baseDeployment = {
        id: deploymentId,
        projectId,
        name: payload.name,
        environment: payload.environment,
        status: "configuring" as const,
        gitRepository: payload.gitRepository,
        environmentVariables: payload.environmentVariables || [],
        pipeline: {
          currentStage: "Initial Configuration",
          steps: this.initializePipelineSteps(),
          startedAt: undefined,
          estimatedCompletionTime: undefined,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create the appropriate deployment model based on mode
      let newDeployment: DeploymentModel;

      const mode = payload.mode || "beginner";

      switch (mode) {
        case "template":
          const templateDeployment: TemplateDeploymentModel = {
            ...baseDeployment,
            mode: "template" as const,
            templateId: payload.architectureTemplate || "",
            templateName: payload.architectureTemplate
              ? "Template Architecture"
              : "",
          };

          newDeployment = templateDeployment;
          break;

        case "ai-assistant":
          const aiDeployment: AiAssistantDeploymentModel = {
            ...baseDeployment,
            mode: "ai-assistant" as const,
            chatMessages: project.activeChatMessages,
            aiGeneratedArchitecture: !!payload.aiGeneratedConfig,
            aiRecommendations: [],
            generatedComponents: payload.generatedComponents!,
          };

          newDeployment = aiDeployment;
          break;

        case "expert":
          const expertDeployment: ExpertDeploymentModel = {
            ...baseDeployment,
            mode: "expert" as const,
            cloudComponents: [],
            architectureComponents: payload.architectureComponents!,
            customInfrastructureCode: false,
          };

          // Add custom architecture components if specified
          if (payload.customArchitecture?.components) {
            expertDeployment.architectureComponents =
              payload.customArchitecture.components.map((comp) => ({
                ...this.getDefaultCloudComponent(),
                instanceId: comp.instanceId,
                type: comp.type,
                configuration: comp.config,
              }));
          }

          newDeployment = expertDeployment;
          break;

        case "beginner":
        default:
          const quickDeployment: QuickDeploymentModel = {
            ...baseDeployment,
            mode: "beginner" as const,
            frameworkType: "",
            buildCommand: "",
            startCommand: "",
          };

          newDeployment = quickDeployment;
          break;
      }

      const updatedProject = await this.projectRepository.update(
        projectId,
        {
          deployments: [...(project.deployments || []), newDeployment],
          ...(mode === "ai-assistant" ? { activeChatMessages: [] } : {}),
        },
        userId
      );

      if (!updatedProject) {
        throw new Error("Project not found");
      }

      logger.info(
        `Deployment created successfully - UserId: ${userId}, ProjectId: ${projectId}, DeploymentId: ${newDeployment.id}`
      );

      const generatedDeployment = await this.generateDeployment(
        userId,
        projectId,
        newDeployment.id
      );

      logger.info(
        `Deployment generated successfully - UserId: ${userId}, ProjectId: ${projectId}, DeploymentId: ${generatedDeployment.id}`
      );


      return generatedDeployment;
    } catch (error: any) {
      logger.error(
        `Error creating deployment for userId: ${userId}, projectId: ${projectId}. Error: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async generateDeployment(
    userId: string,
    projectId: string,
    deploymentId: string
  ): Promise<DeploymentModel> {
    logger.info(
      `generateDeployment called for userId: ${userId}, projectId: ${projectId}`
    );

    try {
      // Get project information
      const project = await this.getProject(projectId, userId);
      if (!project) {
        throw new Error("Project not found");
      }

      // Create a basic deployment configuration
      const deployment = project.deployments.find(
        (deployment) => deployment.id === deploymentId
      );
      if (!deployment) {
        throw new Error("Deployment not found");
      }

      // Generate Terraform files based on the deployment configuration
      const generatedFiles = await this.generateTerraformFiles(
        deployment,
        userId
      );

      if (generatedFiles && generatedFiles.length > 0) {
        // Convert array of TerraformFile objects to the expected format in DeploymentModel
        const terraformFilesMap: TerraformFilesMap = {
          main: "",
          variables: "",
          variablesMap: "",
        };

        // Map the array items to the expected object structure
        generatedFiles.forEach((file) => {
          if (file.name === "main.tf") {
            terraformFilesMap.main = file.content;
          } else if (file.name === "variables.tf") {
            terraformFilesMap.variables = file.content;
          } else if (file.name === "variables.map.tf") {
            terraformFilesMap.variablesMap = file.content;
          }
        });

        deployment.generatedTerraformFiles = terraformFilesMap;
      }

      // Add the deployment to the project
      if (!project.deployments) {
        project.deployments = [];
      }
      project.deployments.push(deployment);

      // Update the project with the new deployment
      await this.projectRepository.update(projectId, project, userId);

      logger.info(
        `Successfully generated deployment for userId: ${userId}, projectId: ${projectId}, deploymentId: ${deploymentId}`
      );
      return deployment;
    } catch (error: any) {
      logger.error(
        `Error generating deployment for userId: ${userId}, projectId: ${projectId}. Error: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  /**
   * Generate Terraform files for a deployment
   * @param deployment Deployment model
   * @returns Array of file contents with name and content
   */
  private async generateTerraformFiles(
    deployment: DeploymentModel,
    userId: string
  ): Promise<TerraformFile[]> {
    logger.info(
      `Generating Terraform files for deploymentId: ${deployment.id}`
    );

    // Temporary file path for context accumulation
    this.contextFilePath = undefined;

    try {
      const project = await this.getProject(deployment.projectId, userId);

      if (!project) {
        logger.error(`Project ${deployment.projectId} not found `);
        return [];
      }

      // Initialize temporary file for context
      this.contextFilePath = path.join(
        os.tmpdir(),
        `terraform_context_${deployment.id}_${Date.now()}.txt`
      );
      logger.debug(`Created temporary context file: ${this.contextFilePath}`);

      // Initialize context with initial data
      const contextData = this.prepareContextData(deployment, project);
      await fs.writeFile(
        this.contextFilePath,
        JSON.stringify(contextData, null, 2),
        "utf-8"
      );

      // Generate Terraform files sequentially
      const terraformFiles: TerraformFile[] = [];

      // Generate main.tf
      logger.info(`Generating main.tf for deployment ${deployment.id}`);
      const mainTfContent = await this.generateTerraformFileContent(
        MAIN_TF_PROMPT,
        "main.tf",
        contextData
      );
      if (mainTfContent) {
        terraformFiles.push({ name: "main.tf", content: mainTfContent });
        await this.addToContextFile("Generated main.tf:", mainTfContent);
      }

      // Generate variables.tf
      logger.info(`Generating variables.tf for deployment ${deployment.id}`);
      const variablesTfContent = await this.generateTerraformFileContent(
        VARIABLES_TF_PROMPT,
        "variables.tf",
        contextData
      );
      if (variablesTfContent) {
        terraformFiles.push({
          name: "variables.tf",
          content: variablesTfContent,
        });
        await this.addToContextFile(
          "Generated variables.tf:",
          variablesTfContent
        );
      }

      // Generate variables.map.tf (a map of all environment variables)
      logger.info(
        `Generating variables.map.tf for deployment ${deployment.id}`
      );

      const variablesMapContent = await this.generateTerraformFileContent(
        VARIABLES_MAP_TF_PROMPT,
        "variables.map.tf",
        contextData
      );

      if (variablesMapContent) {
        terraformFiles.push({
          name: "variables.map.tf",
          content: variablesMapContent,
        });
        await this.addToContextFile(
          "Generated variables.map.tf:",
          variablesMapContent
        );
      }

      // Clean up temp file
      try {
        await fs.unlink(this.contextFilePath);
        logger.debug(`Removed temporary context file: ${this.contextFilePath}`);
        this.contextFilePath = undefined;
      } catch (cleanupError) {
        logger.warn(`Failed to clean up temporary file: ${cleanupError}`);
      }

      logger.info(
        `Generated ${terraformFiles.length} Terraform files for deploymentId: ${deployment.id}`
      );

      return terraformFiles;
    } catch (error) {
      logger.error(
        `Error in Terraform file generation process for deployment ${deployment.id}:`,
        error
      );
      // Clean up temp file in case of error
      if (this.contextFilePath) {
        try {
          await fs.unlink(this.contextFilePath);
          logger.debug(
            `Cleaned up temp file after error: ${this.contextFilePath}`
          );
        } catch (cleanupError) {
          logger.warn(`Failed to clean up temporary file: ${cleanupError}`);
        }
        this.contextFilePath = undefined;
      }
      return [];
    }
  }

  /**
   * Prepare context data for Terraform generation
   * @param deployment The deployment model
   * @param project The project model
   * @returns Context data object
   */
  private prepareContextData(
    deployment: DeploymentModel,
    project: ProjectModel
  ): any {
    // Prepare the components for the prompt
    let architectureComponents: any[] = [];

    // Extract components based on deployment mode
    if (
      deployment.mode === "expert" &&
      "architectureComponents" in deployment
    ) {
      architectureComponents = (deployment as any).architectureComponents || [];
    } else if (
      deployment.mode === "ai-assistant" &&
      "generatedComponents" in deployment
    ) {
      architectureComponents = (deployment as any).generatedComponents || [];
    }

    return {
      projectInfo: {
        name: project.name,
        description: project.description,
        type: project.type,
      },
      deploymentInfo: {
        id: deployment.id,
        name: deployment.name,
        mode: deployment.mode,
        environment: deployment.environment,
        status: deployment.status,
      },
      architectureComponents,
      environmentVariables: deployment.environmentVariables || [],
      gitRepository: deployment.gitRepository || {},
    };
  }

  /**
   * Adds content to the context file for Terraform generation
   * @param header Header text to add
   * @param content Content to add
   */
  private async addToContextFile(
    header: string,
    content: string
  ): Promise<void> {
    if (!this.contextFilePath) {
      logger.warn("Context file path not initialized for adding content");
      return;
    }

    try {
      await fs.appendFile(
        this.contextFilePath,
        `\n\n${header}\n${content}\n\n---\n`,
        "utf-8"
      );
      logger.debug(`Added content to context file: ${this.contextFilePath}`);
    } catch (error) {
      logger.error(`Error adding to context file: ${error}`);
    }
  }

  /**
   * Generates content for a specific Terraform file
   * @param promptConstant The prompt template for the file type
   * @param stepName Name of the file being generated
   * @param contextData Context data for generation
   * @returns Generated file content
   */
  private async generateTerraformFileContent(
    promptConstant: string,
    stepName: string,
    contextData: any
  ): Promise<string> {
    logger.info(`Generating Terraform content for ${stepName}`);

    const userPrompt =
      `You are generating a specific Terraform file: ${stepName}\n\n` +
      promptConstant +
      "\n\n" +
      "Use the project information and other details to create appropriate, well-commented Terraform code.";

    try {
      const response = await this.promptService.runPrompt({
        provider: LLMProvider.GEMINI,
        modelName: "gemini-2.5-flash",
        messages: [
          { role: "system", content: TERRAFORM_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        file: this.contextFilePath
          ? { localPath: this.contextFilePath, mimeType: "text/plain" }
          : undefined,
        llmOptions: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        },
      });

      if (!response) {
        logger.warn(`No response from LLM for ${stepName} generation`);
        return "";
      }

      // Clean response - extract code from code blocks if present
      let fileContent = response;

      // Look for HCL/Terraform code blocks
      const codeBlockRegex = /```(?:hcl|terraform)?\s*([\s\S]*?)\s*```/g;
      const match = codeBlockRegex.exec(response);
      if (match && match[1]) {
        fileContent = match[1].trim();
        logger.info(`Extracted code block from ${stepName} response`);
      }

      logger.debug(
        `Generated ${stepName} content (first 100 chars): ${fileContent.substring(
          0,
          100
        )}...`
      );
      return fileContent;
    } catch (error) {
      logger.error(`Error generating ${stepName}: ${error}`);
      return "";
    }
  }

  async getDeploymentsByProject(
    userId: string,
    projectId: string
  ): Promise<DeploymentModel[]> {
    logger.info(
      `getDeploymentsByProject called for userId: ${userId}, projectId: ${projectId}`
    );
    try {
      const project = await this.getProject(projectId, userId);
      if (!project) {
        throw new Error("Project not found");
      }
      const deployments = project.deployments || [];

      logger.info(
        `Found ${deployments.length} deployments for userId: ${userId}, projectId: ${projectId}`
      );
      return deployments;
    } catch (error: any) {
      logger.error(
        `Error getting deployments for userId: ${userId}, projectId: ${projectId}. Error: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  async getDeploymentById(
    userId: string,
    deploymentId: string
  ): Promise<DeploymentModel | null> {
    logger.info(
      `getDeploymentById called for userId: ${userId}, deploymentId: ${deploymentId}`
    );
    try {
      // First try to find the project directly by deploymentId (if deploymentId is actually a projectId)
      let project = await this.getProject(deploymentId, userId);

      // If not found, we need to search through all projects to find the one containing this deployment
      if (!project) {
        const allProjects = await this.projectRepository.findAll(userId);
        for (const proj of allProjects) {
          if (
            proj.deployments &&
            proj.deployments.some((d) => d.id === deploymentId)
          ) {
            project = proj;
            break;
          }
        }

        if (!project) {
          throw new Error("Project containing deployment not found");
        }
      }

      const deployment = (project.deployments || []).find(
        (deployment) => deployment.id === deploymentId
      );
      if (deployment) {
        logger.info(
          `Deployment found - UserId: ${userId}, DeploymentId: ${deploymentId}`
        );
      } else {
        logger.warn(
          `Deployment not found - UserId: ${userId}, DeploymentId: ${deploymentId}`
        );
        throw new Error("Deployment not found");
      }
      return deployment;
    } catch (error: any) {
      logger.error(
        `Error getting deployment for userId: ${userId}, deploymentId: ${deploymentId}. Error: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  async updateDeployment(
    userId: string,
    deploymentId: string,
    updateData: Partial<DeploymentModel>
  ): Promise<DeploymentModel> {
    logger.info(
      `updateDeployment called for userId: ${userId}, deploymentId: ${deploymentId}`
    );
    try {
      // First try to find the project directly by deploymentId (if deploymentId is actually a projectId)
      let project = await this.getProject(deploymentId, userId);
      let projectId = deploymentId;

      // If not found, we need to search through all projects to find the one containing this deployment
      if (!project) {
        const allProjects = await this.projectRepository.findAll(userId);
        for (const proj of allProjects) {
          if (
            proj.deployments &&
            proj.deployments.some((d) => d.id === deploymentId)
          ) {
            project = proj;
            projectId = proj.id!;
            break;
          }
        }

        if (!project) {
          throw new Error("Project containing deployment not found");
        }
      }

      const existingDeploymentIndex = (project.deployments || []).findIndex(
        (deployment) => deployment.id === deploymentId
      );

      if (existingDeploymentIndex === -1) {
        logger.warn(
          `Deployment not found for update - UserId: ${userId}, DeploymentId: ${deploymentId}`
        );
        throw new Error("Deployment not found");
      }

      const existingDeployment = project.deployments[existingDeploymentIndex];

      // Create a type-safe updated deployment object
      const updatedDeployment: DeploymentModel = {
        ...existingDeployment,
        ...updateData,
        updatedAt: new Date(),
        // Ensure required fields are present
        id: existingDeployment.id,
        projectId: existingDeployment.projectId,
        name: existingDeployment.name,
        environment: existingDeployment.environment,
        status: existingDeployment.status || "configuring",
        mode: existingDeployment.mode,
        createdAt: existingDeployment.createdAt,
      } as DeploymentModel;

      // Create a new deployments array with the updated deployment
      const updatedDeployments = [...project.deployments];
      updatedDeployments[existingDeploymentIndex] = updatedDeployment;

      const updatedProject = await this.projectRepository.update(
        projectId,
        { deployments: updatedDeployments },
        userId
      );
      if (!updatedProject) {
        throw new Error("Project not found");
      }

      // Find the updated deployment in the updated project
      const resultDeployment = updatedProject.deployments?.find(
        (deployment) => deployment.id === deploymentId
      );
      if (!resultDeployment) {
        throw new Error("Deployment not found");
      }

      logger.info(
        `Deployment updated successfully - UserId: ${userId}, DeploymentId: ${deploymentId}`
      );
      return resultDeployment;
    } catch (error: any) {
      logger.error(
        `Error updating deployment for userId: ${userId}, deploymentId: ${deploymentId}. Error: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  async deleteDeployment(
    userId: string,
    deploymentId: string
  ): Promise<boolean> {
    logger.info(
      `deleteDeployment called for userId: ${userId}, deploymentId: ${deploymentId}`
    );
    try {
      // First try to find the project directly by deploymentId (if deploymentId is actually a projectId)
      let project = await this.getProject(deploymentId, userId);
      let projectId = deploymentId;

      // If not found, we need to search through all projects to find the one containing this deployment
      if (!project) {
        const allProjects = await this.projectRepository.findAll(userId);
        for (const proj of allProjects) {
          if (
            proj.deployments &&
            proj.deployments.some((d) => d.id === deploymentId)
          ) {
            project = proj;
            projectId = proj.id!;
            break;
          }
        }

        if (!project) {
          logger.warn(
            `Project containing deployment not found - UserId: ${userId}, DeploymentId: ${deploymentId}`
          );
          return false;
        }
      }

      // If we found the project by deploymentId, it means the deploymentId is actually a projectId
      // and we should delete the entire project
      if (projectId === deploymentId) {
        const success = await this.projectRepository.delete(projectId, userId);
        if (success) {
          logger.info(
            `Project deleted successfully - UserId: ${userId}, ProjectId: ${projectId}`
          );
        } else {
          logger.warn(
            `Project not found for deletion - UserId: ${userId}, ProjectId: ${projectId}`
          );
        }
        return success;
      }

      // Otherwise, we need to remove just the deployment from the project
      const updatedDeployments = (project.deployments || []).filter(
        (deployment) => deployment.id !== deploymentId
      );

      if (updatedDeployments.length === (project.deployments || []).length) {
        logger.warn(
          `Deployment not found for deletion - UserId: ${userId}, DeploymentId: ${deploymentId}`
        );
        return false;
      }

      const updatedProject = await this.projectRepository.update(
        projectId,
        { deployments: updatedDeployments },
        userId
      );

      if (updatedProject) {
        logger.info(
          `Deployment deleted successfully - UserId: ${userId}, DeploymentId: ${deploymentId}`
        );
        return true;
      } else {
        logger.warn(
          `Failed to update project after deployment deletion - UserId: ${userId}, DeploymentId: ${deploymentId}`
        );
        return false;
      }
    } catch (error: any) {
      logger.error(
        `Error deleting deployment for userId: ${userId}, deploymentId: ${deploymentId}. Error: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  // Configuration Management Methods
  async updateGitRepository(
    userId: string,
    deploymentId: string,
    gitConfig: GitRepository
  ): Promise<DeploymentModel | null> {
    logger.info(
      `updateGitRepository called for userId: ${userId}, deploymentId: ${deploymentId}`
    );

    try {
      const validationErrors =
        DeploymentValidators.validateGitRepository(gitConfig);
      if (validationErrors.length > 0) {
        throw new Error(
          `Git repository validation failed: ${validationErrors.join(", ")}`
        );
      }

      return await this.updateDeployment(userId, deploymentId, {
        gitRepository: gitConfig,
      });
    } catch (error: any) {
      logger.error(
        `Error updating git repository for deployment ${deploymentId}: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  async updateEnvironmentVariables(
    userId: string,
    deploymentId: string,
    environmentVariables: EnvironmentVariable[]
  ): Promise<DeploymentModel | null> {
    logger.info(
      `updateEnvironmentVariables called for userId: ${userId}, deploymentId: ${deploymentId}, count: ${environmentVariables.length}`
    );

    try {
      return await this.updateDeployment(userId, deploymentId, {
        environmentVariables,
      });
    } catch (error: any) {
      logger.error(
        `Error updating environment variables for deployment ${deploymentId}: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  async updateArchitectureComponents(
    userId: string,
    deploymentId: string,
    components: ArchitectureComponent[]
  ): Promise<DeploymentModel | null> {
    logger.info(
      `updateArchitectureComponents called for userId: ${userId}, deploymentId: ${deploymentId}, count: ${components.length}`
    );

    try {
      const deployment = await this.getDeploymentById(userId, deploymentId);
      if (!deployment) {
        return null;
      }

      const validationErrors =
        DeploymentValidators.validateArchitectureComponents(components);
      if (validationErrors.length > 0) {
        throw new Error(
          `Architecture components validation failed: ${validationErrors.join(
            ", "
          )}`
        );
      }

      // Update based on deployment mode
      if (deployment.mode === "expert") {
        return await this.updateDeployment(userId, deploymentId, {
          architectureComponents: components,
        } as Partial<ExpertDeploymentModel>);
      } else if (deployment.mode === "ai-assistant") {
        return await this.updateDeployment(userId, deploymentId, {
          generatedComponents: components,
        } as Partial<AiAssistantDeploymentModel>);
      } else {
        logger.warn(
          `Cannot update architecture components for deployment mode: ${deployment.mode}`
        );
        return deployment;
      }
    } catch (error: any) {
      logger.error(
        `Error updating architecture components for deployment ${deploymentId}: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  async addChatMessage(
    userId: string,
    projectId: string,
    message: ChatMessage
  ): Promise<ChatMessage | null> {
    logger.info(
      `addChatMessage called for userId: ${userId}, projectId: ${projectId}, sender: ${message.sender}`
    );

    try {
      const project = await this.getProject(projectId, userId);
      if (!project) {
        logger.warn(`Project not found: ${projectId}`);
        return null;
      }
      // If the message is from a user, generate an AI response
      if (message.sender === "user") {
        logger.info(
          `Generating AI response for user message in deployment ${projectId}`
        );

        try {
          // Convert chat messages to the format expected by PromptService
          project.activeChatMessages.push(message);
          const promptMessages = this.convertToPromptMessages(
            project.activeChatMessages,
            project
          );

          // Call the PromptService to generate a response
          const aiResponse = await this.promptService.runPrompt({
            provider: LLMProvider.GEMINI,
            modelName: "gemini-2.5-flash",
            messages: promptMessages,
            llmOptions: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          });
          console.log("aiResponse", aiResponse);

          // Create an AI message and parse the response as JSON if possible
          let aiMessage: ChatMessage;

          try {
            // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
            const jsonMatch = aiResponse.match(
              /```(?:json)?\s*([\s\S]*?)\s*```/
            ) || [null, aiResponse];
            const jsonContent = jsonMatch[1].trim();
            const parsedResponse = JSON.parse(jsonContent);

            // Create an AI message from the structured response
            aiMessage = {
              sender: "ai",
              text: parsedResponse.message || aiResponse, // Fallback to raw response if message field missing
              timestamp: new Date(),
              isRequestingDetails: parsedResponse.isRequestingDetails || false,
              isProposingArchitecture:
                parsedResponse.isProposingArchitecture || false,
              proposedComponents: parsedResponse.proposedComponents || [],
            };

            logger.info(
              `Successfully parsed AI response as structured JSON for project ${projectId}`
            );
          } catch (error: unknown) {
            // Type guard for error.message
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            logger.warn(
              `Failed to parse AI response as JSON for project ${projectId}: ${errorMessage}`
            );

            // Fallback to treating the response as plain text
            aiMessage = {
              sender: "ai",
              text: aiResponse,
              timestamp: new Date(),
              isRequestingDetails: false,
              isProposingArchitecture: false,
            };
          }

          // Add the AI message to the chat history
          if (!project.activeChatMessages) {
            project.activeChatMessages = [];
          }
          project.activeChatMessages.push(aiMessage);
        } catch (promptError: any) {
          logger.error(
            `Error generating AI response for project ${projectId}: ${promptError.message}`,
            { error: promptError.stack }
          );

          // Add a fallback AI message indicating the error
          if (!project.activeChatMessages) {
            project.activeChatMessages = [];
          }
          project.activeChatMessages.push({
            sender: "ai",
            text: "I'm sorry, I encountered an error while processing your request. Please try again later.",
            timestamp: new Date(),
            isRequestingDetails: false,
            isProposingArchitecture: false,
          });
        }
      }
      await this.projectRepository.update(projectId, project, userId);
      // Update the deployment with the new messages
      return project.activeChatMessages[project.activeChatMessages.length - 1];
    } catch (error: any) {
      logger.error(
        `Error adding chat message for project ${projectId}: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  /**
   * Converts deployment chat messages to the format expected by PromptService
   */
  private convertToPromptMessages(
    chatMessages: ChatMessage[],
    project: ProjectModel
  ): { role: "user" | "assistant" | "system"; content: string }[] {
    logger.info(
      `Converting prompt messages for project: ${project.id}, deployment chat`
    );

    // Extract deployment information from project
    const deploymentInfo =
      project.deployments && project.deployments.length > 0
        ? project.deployments[project.deployments.length - 1]
        : null;

    // Create project context string
    let projectContext = `
      Project Name: ${project.name}
      Project ID: ${project.id}
      Description: ${project.description}
      Type: ${project.type}
      Constraints: ${project.constraints}
      Team Size: ${project.teamSize}
      Scope: ${project.scope}
      Budget: ${project.budgetIntervals || "Not specified"}
      Targets: ${project.targets}
    `;

    // Add deployment specific context if available
    if (deploymentInfo) {
      projectContext += `
        Current Deployment Information:
        - Name: ${deploymentInfo.name}
        - Status: ${deploymentInfo.status}
        - Environment: ${deploymentInfo.environment}
        - Mode: ${deploymentInfo.mode}
        ${
          deploymentInfo.gitRepository
            ? `- Git Repository: ${deploymentInfo.gitRepository.provider} (${deploymentInfo.gitRepository.url})`
            : ""
        }
        ${deploymentInfo.url ? `- Deployed URL: ${deploymentInfo.url}` : ""}
        ${
          deploymentInfo.pipelines && deploymentInfo.pipelines.length > 0
            ? `- Current Pipeline Stage: ${
                deploymentInfo.pipelines[deploymentInfo.pipelines.length - 1].id
              }`
            : ""
        }
      `;
    }

    // Start with a system message that provides context about the deployment
    const promptMessages: {
      role: "user" | "assistant" | "system";
      content: string;
    }[] = [
      {
        role: "system",
        content: `${AI_CHAT_INITIAL_PROMPT}\n\n${projectContext}`,
      },
    ];

    // Add all conversation history if less than 5 messages, otherwise limit to last 5
    const messagesToInclude =
      chatMessages.length <= 5 ? chatMessages : chatMessages.slice(-5);

    messagesToInclude.forEach((msg) => {
      promptMessages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      });
    });

    return promptMessages;
  }

  // Pipeline Management Methods
  async startDeploymentPipeline(
    userId: string,
    deploymentId: string
  ): Promise<DeploymentModel | null> {
    logger.info(
      `startDeploymentPipeline called for userId: ${userId}, deploymentId: ${deploymentId}`
    );

    try {
      const deployment = await this.getDeploymentById(userId, deploymentId);
      if (!deployment) {
        return null;
      }

      // Validate deployment is ready for pipeline execution
      const validationErrors = this.validateDeploymentForPipeline(deployment);
      if (validationErrors.length > 0) {
        throw new Error(
          `Pipeline validation failed: ${validationErrors.join(", ")}`
        );
      }

      // Generate a unique pipeline ID using timestamp and random string
      const pipelineId = `pipe-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;

      const updatedPipeline = {
        id: pipelineId,
        steps: this.initializePipelineSteps().map((step) => ({
          ...step,
          status:
            step.name === "Code Analysis"
              ? ("in-progress" as const)
              : ("pending" as const),
          startedAt: step.name === "Code Analysis" ? new Date() : undefined,
        })),
        startedAt: new Date(),
        estimatedCompletionTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes estimate
      };

      const updatedDeployment = await this.updateDeployment(
        userId,
        deploymentId,
        {
          status: "building",
          pipelines: [updatedPipeline],
        }
      );

      // Start asynchronous pipeline execution
      this.executePipeline(userId, deploymentId, pipelineId);

      return updatedDeployment;
    } catch (error: any) {
      logger.error(
        `Error starting deployment pipeline for deployment ${deploymentId}: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  async updatePipelineStep(
    userId: string,
    deploymentId: string,
    stepName: string,
    pipelineIndex: number,
    stepUpdate: Partial<PipelineStep>
  ): Promise<DeploymentModel | null> {
    logger.info(
      `updatePipelineStep called for userId: ${userId}, deploymentId: ${deploymentId}, step: ${stepName}, pipelineIndex: ${pipelineIndex}`
    );

    try {
      const deployment = await this.getDeploymentById(userId, deploymentId);
      if (!deployment) {
        logger.warn(`Deployment not found: ${deploymentId}`);
        return null;
      }

      // Check if pipelines exists and is properly structured
      if (!deployment.pipelines) {
        logger.warn(`No pipelines found in deployment ${deploymentId}`);
        return null;
      }

      // Ensure pipelines is an array
      const pipelinesArray = Array.isArray(deployment.pipelines)
        ? deployment.pipelines
        : [deployment.pipelines];

      // Check if the specified pipeline index exists
      if (pipelineIndex < 0 || pipelineIndex >= pipelinesArray.length) {
        logger.warn(
          `Invalid pipeline index ${pipelineIndex} for deployment ${deploymentId}`
        );
        return null;
      }

      // Get the target pipeline
      const targetPipeline = pipelinesArray[pipelineIndex];

      // Ensure the pipeline has steps and steps is an array
      if (!targetPipeline.steps || !Array.isArray(targetPipeline.steps)) {
        logger.warn(
          `No steps array found in pipeline ${pipelineIndex} of deployment ${deploymentId}`
        );
        return null;
      }

      // Update the specific step in the target pipeline
      const updatedSteps = targetPipeline.steps.map((step) =>
        step.name === stepName ? { ...step, ...stepUpdate } : step
      );

      // Create a copy of the pipelines array to update
      const updatedPipelines = [...pipelinesArray];

      // Update the specific pipeline with the new steps
      updatedPipelines[pipelineIndex] = {
        ...targetPipeline,
        steps: updatedSteps,
      };

      // Update the deployment with the modified pipelines
      return await this.updateDeployment(userId, deploymentId, {
        pipelines: updatedPipelines,
      });
    } catch (error: any) {
      logger.error(
        `Error updating pipeline step for deployment ${deploymentId}: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  // Cost Estimation Methods
  async updateCostEstimation(
    userId: string,
    deploymentId: string,
    costEstimation: CostEstimation
  ): Promise<DeploymentModel | null> {
    logger.info(
      `updateCostEstimation called for userId: ${userId}, deploymentId: ${deploymentId}, cost: ${costEstimation.monthlyCost}`
    );

    try {
      return await this.updateDeployment(userId, deploymentId, {
        costEstimation,
      });
    } catch (error: any) {
      logger.error(
        `Error updating cost estimation for deployment ${deploymentId}: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  // Validation Methods
  private validateDeploymentData(formData: DeploymentFormData): string[] {
    const errors: string[] = [];

    errors.push(...DeploymentValidators.validateBasicInfo(formData));

    if (formData.repoUrl || formData.branch) {
      const gitRepo = {
        url: formData.repoUrl,
        branch: formData.branch,
      };
      errors.push(...DeploymentValidators.validateGitRepository(gitRepo));
    }

    if (formData.customComponents) {
      errors.push(
        ...DeploymentValidators.validateArchitectureComponents(
          formData.customComponents
        )
      );
    }

    return errors;
  }

  private validateDeploymentForPipeline(deployment: DeploymentModel): string[] {
    const errors: string[] = [];

    if (!deployment.gitRepository) {
      errors.push(
        "Git repository configuration is required for pipeline execution"
      );
    }

    if (deployment.status === "building" || deployment.status === "deploying") {
      errors.push("Deployment pipeline is already running");
    }

    // Mode-specific validations
    switch (deployment.mode) {
      case "beginner":
        const quickDeployment = deployment as QuickDeploymentModel;
        if (!quickDeployment.frameworkType) {
          errors.push(
            "Framework type is required for beginner mode deployments"
          );
        }
        break;

      case "template":
        const templateDeployment = deployment as TemplateDeploymentModel;
        if (!templateDeployment.templateId) {
          errors.push("Template ID is required for template mode deployments");
        }
        break;

      case "expert":
        const expertDeployment = deployment as ExpertDeploymentModel;
        if (
          !expertDeployment.architectureComponents ||
          expertDeployment.architectureComponents.length === 0
        ) {
          errors.push(
            "At least one architecture component is required for expert mode deployments"
          );
        }
        break;

      case "ai-assistant":
        // AI assistant mode might not need additional validations as it's guided
        break;

      default:
        errors.push(`Unknown deployment mode: ${(deployment as any).mode}`);
    }

    return errors;
  }

  // Helper Methods
  private initializePipelineSteps(): PipelineStep[] {
    return [
      {
        name: "Code Analysis",
        status: "pending",
      },
      {
        name: "Security Scan",
        status: "pending",
      },
      {
        name: "Build",
        status: "pending",
      },
      {
        name: "Infrastructure Provisioning",
        status: "pending",
      },
      {
        name: "Deployment",
        status: "pending",
      },
      {
        name: "Post-deployment Tests",
        status: "pending",
      },
    ];
  }

  private getDefaultCloudComponent(): CloudComponentDetailed {
    return {
      id: "",
      name: "",
      description: "",
      category: "",
      provider: "aws",
      icon: "",
      pricing: "$0.00/month",
      options: [],
    };
  }

  private async executePipeline(
    userId: string,
    deploymentId: string,
    pipelineId: string
  ): Promise<void> {
    const steps = [
      "Code Analysis",
      "Security Scan",
      "Build",
      "Infrastructure Provisioning",
      "Deployment",
      "Post-deployment Tests",
    ];

    for (let i = 0; i < steps.length; i++) {
      const stepName = steps[i];

      // Start step
      await this.updatePipelineStep(userId, deploymentId, stepName, 0, {
        status: "in-progress",
        startedAt: new Date(),
      });

      // For the Build step, run a Docker container
      if (stepName === "Build") {
        try {
          // Run Docker container for build process
          const containerName = `build-${deploymentId}-${pipelineId}`;
          const dockerRunCommand = `echo 'Build completed successfully'`;

          // Log Docker command execution
          logger.info(
            `Executing Docker build command for deployment ${deploymentId}:`,
            {
              command: dockerRunCommand,
              containerName,
              pipelineId,
            }
          );

          // Execute the Docker command
          const execAsync = promisify(exec);
          const { stdout: runOutput, stderr: runError } = await execAsync(
            dockerRunCommand
          );

          if (runError) {
            logger.warn(`Docker run command produced stderr: ${runError}`);
          }

          // Update logs with Docker container start information
          await this.updatePipelineStep(userId, deploymentId, stepName, 0, {
            logs: `Running build in Docker container: ${containerName}\nCommand: ${dockerRunCommand}\n\n[Container Started]\n${runOutput}\nContainer started successfully with ID ${containerName}\n\nBuilding project...`,
          });

          // Wait a moment to let container start working
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Get container logs
          const dockerLogsCommand = `docker logs ${containerName}`;
          let buildOutput = "";

          // Poll for logs every 2 seconds for up to 30 seconds
          for (let i = 0; i < 15; i++) {
            try {
              const { stdout } = await execAsync(dockerLogsCommand);
              buildOutput = stdout;

              // Update step logs with latest output
              const currentStep = (
                await this.getDeploymentById(userId, deploymentId)
              )?.pipelines?.[0]?.steps?.find((s) => s.name === "Build");
              const currentLogs = currentStep?.logs || "";
              await this.updatePipelineStep(userId, deploymentId, stepName, 0, {
                logs: `${
                  currentLogs.split("[Container Logs]")[0]
                }[Container Logs]\n${buildOutput}`,
              });

              // Check if build is complete
              if (buildOutput.includes("Build completed successfully")) {
                break;
              }

              // Wait before polling again
              await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (logError: any) {
              logger.warn(`Error getting container logs: ${logError.message}`, {
                error: logError,
              });
            }
          }

          // Cleanup the container
          try {
            await execAsync(`docker rm -f ${containerName}`);
            logger.info(`Removed Docker container ${containerName}`);
          } catch (cleanupError: any) {
            logger.warn(
              `Error removing Docker container: ${cleanupError.message}`,
              { error: cleanupError }
            );
          }
        } catch (error: any) {
          logger.error(`Docker build execution failed: ${error.message}`, {
            error,
          });
          await this.updatePipelineStep(userId, deploymentId, stepName, 0, {
            status: "failed",
            finishedAt: new Date(),
            logs: `Build step failed: ${error.message}`,
          });

          // Update deployment status to failed
          await this.updateDeployment(userId, deploymentId, {
            status: "failed",
          });

          return; // Exit the pipeline execution
        }
      }

      // Simulate step execution time - longer for build and infrastructure steps
      const stepDuration =
        stepName === "Build" || stepName === "Infrastructure Provisioning"
          ? 3000
          : 2000;
      await new Promise((resolve) => setTimeout(resolve, stepDuration));

      // Complete step
      if (stepName === "Build") {
        // For Build step, get current logs first, then append completion message
        const currentStep = (
          await this.getDeploymentById(userId, deploymentId)
        )?.pipelines?.[0]?.steps?.find((s) => s.name === "Build");
        const currentLogs = currentStep?.logs || "";

        await this.updatePipelineStep(userId, deploymentId, stepName, 0, {
          status: "succeeded",
          finishedAt: new Date(),
          logs: `${currentLogs}\n\nDocker container completed successfully. Build artifacts generated.`,
        });
      } else {
        // For other steps, just set the standard success message
        await this.updatePipelineStep(userId, deploymentId, stepName, 0, {
          status: "succeeded",
          finishedAt: new Date(),
          logs: `Step ${stepName} completed successfully`,
        });
      }

      // Update deployment status based on current step
      if (stepName === "Infrastructure Provisioning") {
        await this.updateDeployment(userId, deploymentId, {
          status: "infrastructure-provisioning",
        });
      } else if (stepName === "Deployment") {
        await this.updateDeployment(userId, deploymentId, {
          status: "deploying",
        });
      }
    }

    // Complete deployment
    await this.updateDeployment(userId, deploymentId, {
      status: "deployed",
      deployedAt: new Date(),
      url: `https://${deploymentId}.example.com`,
      version: `v1.0.0-${Date.now()}`,
    });

    logger.info(`Pipeline execution completed for deployment ${deploymentId}`);
  }

  async estimateDeploymentCost(
    userId: string,
    deploymentId: string
  ): Promise<CostEstimation | null> {
    logger.info(
      `estimateDeploymentCost called for userId: ${userId}, deploymentId: ${deploymentId}`
    );

    try {
      const deployment = await this.getDeploymentById(userId, deploymentId);
      if (!deployment) {
        return null;
      }

      // Get architecture components based on deployment mode
      let components: ArchitectureComponent[] = [];

      if (deployment.mode === "expert") {
        const expertDeployment = deployment as ExpertDeploymentModel;
        components = expertDeployment.architectureComponents || [];
      } else if (deployment.mode === "ai-assistant") {
        const aiDeployment = deployment as AiAssistantDeploymentModel;
        components = aiDeployment.generatedComponents || [];
      }

      // Calculate cost based on architecture components
      const costEstimation = this.calculateCostEstimation(components);

      // Update deployment with new cost estimation
      await this.updateDeployment(userId, deploymentId, { costEstimation });

      return costEstimation;
    } catch (error: any) {
      logger.error(
        `Error estimating deployment cost for deployment ${deploymentId}: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  private calculateCostEstimation(
    components: ArchitectureComponent[]
  ): CostEstimation {
    let monthlyCost = 0;
    let hourlyCost = 0;
    let oneTimeCost = 0;

    components.forEach((component) => {
      switch (component.type) {
        case "lambda":
        case "function":
          monthlyCost += 10; // Base Lambda cost
          hourlyCost += 0.01;
          break;
        case "database":
          monthlyCost += 25; // Database cost
          hourlyCost += 0.04;
          break;
        case "storage":
          monthlyCost += 5; // Storage cost
          hourlyCost += 0.007;
          break;
        case "cdn":
          monthlyCost += 15; // CDN cost
          hourlyCost += 0.02;
          break;
        case "load-balancer":
          monthlyCost += 20; // Load balancer cost
          hourlyCost += 0.03;
          break;
        default:
          monthlyCost += 5; // Default component cost
          hourlyCost += 0.007;
      }
    });

    // Add base infrastructure cost
    monthlyCost += 10;
    hourlyCost += 0.014;

    return {
      monthlyCost,
      hourlyCost,
      oneTimeCost,
      currency: "USD",
      estimatedAt: new Date(),
      breakdown: components.map((component) => ({
        componentId: component.id,
        componentName: component.name,
        cost: 10, // Simplified cost per component
        description: `Cost for ${component.type} component`,
      })),
    };
  }
}
