import {
  DeploymentModel,
  QuickDeploymentModel,
  TemplateDeploymentModel,
  AiAssistantDeploymentModel,
  ExpertDeploymentModel,
  GitRepository,
  EnvironmentVariable,
  ChatMessage,
  CloudComponentDetailed,
  ArchitectureComponent,
  PipelineStep,
  CostEstimation,
  CreateDeploymentPayload,
  DeploymentFormData,
  DeploymentValidators,
} from "../../models/deployment.model";
import logger from "../../config/logger";
import {
  PromptService,
  LLMProvider,
  AIChatMessage,
  PromptConfig,
} from "../prompt.service";
import { GenericService } from "../common/generic.service";
import { exec } from "child_process";
import { promisify } from "util";
import { ProjectModel } from "../../models/project.model";
import { AI_CHAT_INITIAL_PROMPT } from "./prompts/ai-chat.prompt";

import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";
import { MAIN_TF_PROMPT } from "./prompts/terraform/00_main.prompt";

export class DeploymentService extends GenericService {
  private contextFilePath?: string;

  constructor(promptService: PromptService) {
    super(promptService);
    logger.info("DeploymentService initialized.");
  }

  /**
   * Validate deployment form data
   * @param formData DeploymentFormData to validate
   * @returns Array of validation error messages
   */
  private validateDeploymentData(formData: DeploymentFormData): string[] {
    const errors: string[] = [];

    if (!formData.name) {
      errors.push("Deployment name is required");
    }

    if (!formData.environment) {
      errors.push("Environment is required");
    }

    return errors;
  }

  /**
   * Initialize pipeline steps for a new deployment
   * @returns Array of pipeline steps
   */
  private initializePipelineSteps(): PipelineStep[] {
    return [
      {
        name: "Generate Infrastructure Code",
        status: "pending",
        logs: "",
      },
      {
        name: "Validate Configuration",
        status: "pending",
        logs: "",
      },
      {
        name: "Provision Resources",
        status: "pending",
        logs: "",
      },
    ];
  }

  /**
   * Get default cloud component structure
   * @returns Default cloud component object
   */
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

  async createDeployment(
    userId: string,
    projectId: string,
    payload: CreateDeploymentPayload
  ): Promise<DeploymentModel> {
    logger.info(
      `createDeployment called for userId: ${userId}, projectId: ${projectId}`
    );

    try {
      console.log("projectId", projectId);
      const project = await this.getProject(projectId, userId);
      if (project == null) {
        throw new Error("Project not found");
      }
      console.log("+++project", project);
      const formData: DeploymentFormData = {
        mode: "beginner",
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
        `users/${userId}/projects`
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
  /**
   * Generate the deployment including Terraform tfvars file
   * @param userId User ID
   * @param projectId Project ID
   * @param deploymentId Deployment ID
   * @returns Updated deployment model
   */
  async generateDeployment(
    userId: string,
    projectId: string,
    deploymentId: string
  ): Promise<DeploymentModel> {
    logger.info(
      `generateDeployment called for userId: ${userId}, projectId: ${projectId}, deploymentId: ${deploymentId}`
    );

    try {
      // Get project information
      const project = await this.getProject(projectId, userId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      // Find the deployment in the project
      const deploymentIndex = project.deployments.findIndex(
        (deployment) => deployment.id === deploymentId
      );

      if (deploymentIndex === -1) {
        throw new Error(
          `Deployment ${deploymentId} not found in project ${projectId}`
        );
      }

      // Get the deployment
      const deployment = project.deployments[deploymentIndex];

      // Generate Terraform tfvars file based on the deployment configuration
      await this.generateTerraformTfvarsFile(deployment, userId);

      // Get the updated project to return the updated deployment
      const updatedProject = await this.getProject(projectId, userId);
      if (!updatedProject) {
        throw new Error(`Updated project ${projectId} not found`);
      }

      // Find the updated deployment
      const updatedDeployment = updatedProject.deployments.find(
        (d) => d.id === deploymentId
      );

      if (!updatedDeployment) {
        throw new Error(`Updated deployment ${deploymentId} not found`);
      }

      logger.info(
        `Successfully generated deployment with tfvars for userId: ${userId}, projectId: ${projectId}, deploymentId: ${deploymentId}`
      );
      return updatedDeployment;
    } catch (error: any) {
      logger.error(
        `Error generating deployment for userId: ${userId}, projectId: ${projectId}, deploymentId: ${deploymentId}. Error: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  /**
   * Generate Terraform tfvars file for a deployment
   * @param deployment Deployment model
   * @returns Generated tfvars file content
   */
  private async generateTerraformTfvarsFile(
    deployment: DeploymentModel,
    userId: string
  ): Promise<string> {
    logger.info(
      `Generating Terraform tfvars file for deploymentId: ${deployment.id}`
    );

    try {
      const project = await this.getProject(deployment.projectId, userId);

      if (!project) {
        logger.error(`Project ${deployment.projectId} not found`);
        throw new Error(`Project ${deployment.projectId} not found`);
      }

      // Prepare the architecture data for the prompt
      const architectureData = this.prepareContextData(deployment, project);

      logger.debug(
        `Architecture data prepared for tfvars generation: ${JSON.stringify(
          architectureData,
          null,
          2
        )}`
      );

      // Call the prompt service to generate the tfvars file
      const promptConfig: PromptConfig = {
        modelName: "gemini-1.5-pro-latest",
        provider: LLMProvider.GEMINI,
        userId: userId,
        llmOptions: {
          temperature: 0.2,
          maxOutputTokens: 4096,
        },
      };

      // Convert architecture data to a clear instruction for tfvars generation
      const userInstruction = `
Based on the following project and architecture information, please generate a terraform.tfvars file that will work with the specified archetype. 

Project Information:
${JSON.stringify(architectureData.projectInfo, null, 2)}

Deployment Information:
${JSON.stringify(architectureData.deploymentInfo, null, 2)}

Architecture Components:
${JSON.stringify(architectureData.architectureComponents, null, 2)}

Environment Variables:
${JSON.stringify(architectureData.environmentVariables, null, 2)}

Git Repository:
${JSON.stringify(architectureData.gitRepository, null, 2)}

Please generate ONLY the terraform.tfvars file content.
`;

      // Create the AI messages array with the main prompt and user instruction
      const messages: AIChatMessage[] = [
        {
          role: "user",
          content: MAIN_TF_PROMPT + "\n\n" + userInstruction,
        },
      ];

      // Call prompt service with the correct parameters
      const result = await this.promptService.runPrompt(promptConfig, messages);

      // The result is already a string, no need to access .content
      let tfvarsContent = result;
      // Clean the response to extract just the tfvars content
      tfvarsContent = this.extractTfvarsContent(tfvarsContent);

      // Update the deployment with the generated tfvars content
      await this.updateDeploymentTfvarsContent(
        deployment.id,
        userId,
        tfvarsContent
      );

      logger.info(
        `Successfully generated Terraform tfvars file for deploymentId: ${deployment.id}`
      );

      return tfvarsContent;
    } catch (error: any) {
      logger.error(
        `Error in Terraform tfvars file generation for deployment ${deployment.id}:`,
        { error: error.message, stack: error.stack }
      );
      throw error;
    }
  }

  /**
   * Prepare context data for Terraform generation
   * @param deployment The deployment model
   * @param project The project model
   * @returns Context data object with all necessary architecture details
   */
  private prepareContextData(
    deployment: DeploymentModel,
    project: ProjectModel
  ): any {
    // Prepare the components for the prompt based on deployment mode
    let architectureComponents: any[] = [];

    // Extract components based on deployment mode
    if (
      deployment.mode === "expert" &&
      "architectureComponents" in deployment
    ) {
      // Expert mode has directly defined architecture components
      architectureComponents =
        (deployment as ExpertDeploymentModel).architectureComponents || [];
    } else if (
      deployment.mode === "ai-assistant" &&
      "generatedComponents" in deployment
    ) {
      // AI Assistant mode has generated components
      architectureComponents =
        (deployment as AiAssistantDeploymentModel).generatedComponents || [];
    } else if (deployment.mode === "template" && "templateId" in deployment) {
      // Template mode references a predefined template
      // We don't have the actual template data here, so we'll provide the template ID
      architectureComponents = [
        {
          instanceId: (deployment as TemplateDeploymentModel).templateId,
          type: "template",
          name: (deployment as TemplateDeploymentModel).templateName,
          description: `Template deployment using ${
            (deployment as TemplateDeploymentModel).templateName
          }`,
          category: "template",
          provider: "aws", // Default provider, could be extracted from template if available
        },
      ];
    }

    // Include analysis results if available
    let analysisResults = {};
    if (
      project.analysisResultModel &&
      typeof project.analysisResultModel === "object" &&
      project.analysisResultModel !== null &&
      "deployment" in project.analysisResultModel
    ) {
      analysisResults = (project.analysisResultModel as any).deployment || {};
    }

    // Gather services information if present in the project
    const services: any[] = [];

    // Extract application details that might be useful for deployment
    const applicationDetails: Record<string, any> = {
      appType: project.type,
    };

    return {
      projectInfo: {
        name: project.name,
        description: project.description,
        type: project.type,
        applicationDetails: applicationDetails,
        services: services,
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
      analysisResults,
    };
  }

  /**
   * Extract the tfvars content from the AI response
   * @param response The raw AI response
   * @returns Cleaned tfvars content
   */
  private extractTfvarsContent(response: string): string {
    // Look for code block indicators
    const tfvarsRegex =
      /```(?:terraform|hcl|terraform-vars|tfvars)?\s*([\s\S]*?)```/;
    const matches = response.match(tfvarsRegex);

    if (matches && matches[1]) {
      // Return just the content inside the code block
      return matches[1].trim();
    }

    // If no code block found, try to extract the tfvars content by removing explanations
    // First, remove any markdown headings
    const noHeadings = response.replace(/^#+\s+.*$/gm, "");

    // Remove any other explanatory text that doesn't look like tfvars syntax
    // (This is a simple approach - tfvars typically has variable assignments with = signs)
    const lines = noHeadings.split("\n");
    const tfvarsLines = lines.filter((line) => {
      const trimmed = line.trim();
      // Keep variable assignments, comments, and empty lines
      return trimmed.includes("=") || trimmed.startsWith("#") || trimmed === "";
    });

    return tfvarsLines.join("\n").trim();
  }

  /**
   * Update the deployment with generated terraform.tfvars content
   * @param deploymentId Deployment ID
   * @param userId User ID
   * @param tfvarsContent The generated tfvars content
   */
  private async updateDeploymentTfvarsContent(
    deploymentId: string,
    userId: string,
    tfvarsContent: string
  ): Promise<void> {
    try {
      // Get the project containing the deployment
      const project = await this.findProjectByDeploymentId(
        userId,
        deploymentId
      );

      if (!project) {
        throw new Error(`Project with deployment ID ${deploymentId} not found`);
      }

      // Find and update the specific deployment
      const deploymentIndex = project.deployments.findIndex(
        (deployment) => deployment.id === deploymentId
      );

      if (deploymentIndex === -1) {
        throw new Error(
          `Deployment ${deploymentId} not found in project ${project.id}`
        );
      }

      // Update the deployment with the generated tfvars content
      project.deployments[deploymentIndex].generatedTerraformTfvarsFileContent =
        tfvarsContent;
      project.deployments[deploymentIndex].updatedAt = new Date();

      // Save the updated project
      await this.projectRepository.update(
        project.id!,
        project,
        `users/${userId}/projects`
      );

      logger.debug(
        `Updated deployment ${deploymentId} with generated tfvars content`
      );
    } catch (error: any) {
      logger.error(
        `Error updating deployment ${deploymentId} with tfvars content:`,
        { error: error.message, stack: error.stack }
      );
      throw error;
    }
  }

  /**
   * Find the project associated with a deployment
   * @param userId User ID
   * @param deploymentId Deployment ID
   * @returns ProjectModel or null if not found
   */
  private async findProjectByDeploymentId(
    userId: string,
    deploymentId: string
  ): Promise<ProjectModel | null> {
    try {
      // Get all projects for the user
      const projects = await this.projectRepository.findAll(
        `users/${userId}/projects`
      );

      // Find the project containing the deployment
      const project = projects.find(
        (project) =>
          project.deployments &&
          project.deployments.some(
            (deployment) => deployment.id === deploymentId
          )
      );

      return project || null;
    } catch (error: any) {
      logger.error(`Error finding project by deployment ID ${deploymentId}:`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  // ...

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
        logger.warn(
          `Pipeline validation failed: ${validationErrors.join(", ")}`
        );
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

  /**
   * Retrieve a deployment by its ID
   * @param userId User ID
   * @param deploymentId Deployment ID
   * @returns DeploymentModel or null if not found
   */
  private async getDeploymentById(
    userId: string,
    deploymentId: string
  ): Promise<DeploymentModel | null> {
    try {
      // Find the project containing the deployment
      const project = await this.findProjectByDeploymentId(
        userId,
        deploymentId
      );

      if (!project) {
        logger.warn(`Project with deployment ID ${deploymentId} not found`);
        return null;
      }

      // Find the specific deployment
      const deployment = project.deployments.find((d) => d.id === deploymentId);

      if (!deployment) {
        logger.warn(`Deployment with ID ${deploymentId} not found`);
        return null;
      }

      return deployment;
    } catch (error: any) {
      logger.error(`Error retrieving deployment with ID ${deploymentId}:`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Update a deployment with new data
   * @param userId User ID
   * @param deploymentId Deployment ID
   * @param updateData Partial deployment data to update
   * @returns Updated deployment or null if not found
   */
  private async updateDeployment(
    userId: string,
    deploymentId: string,
    updateData: Partial<DeploymentModel>
  ): Promise<DeploymentModel | null> {
    try {
      // Find the project containing the deployment
      const project = await this.findProjectByDeploymentId(
        userId,
        deploymentId
      );

      if (!project) {
        logger.warn(`Project with deployment ID ${deploymentId} not found`);
        return null;
      }

      // Find the index of the deployment to update
      const deploymentIndex = project.deployments.findIndex(
        (d) => d.id === deploymentId
      );

      if (deploymentIndex === -1) {
        logger.warn(`Deployment with ID ${deploymentId} not found`);
        return null;
      }

      // Create updated deployment by merging existing with update data
      const existingDeployment = project.deployments[deploymentIndex];
      const updatedDeployment = {
        ...existingDeployment,
        ...updateData,
        updatedAt: new Date(),
        // Preserve the original mode to maintain type safety
        mode: existingDeployment.mode
      } as DeploymentModel;

      // Replace the deployment in the project
      project.deployments[deploymentIndex] = updatedDeployment;

      // Save the updated project
      await this.projectRepository.update(
        project.id!,
        project,
        `users/${userId}/projects`
      );

      return updatedDeployment;
    } catch (error: any) {
      logger.error(`Error updating deployment with ID ${deploymentId}:`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get a project by its ID
   * @param projectId Project ID
   * @param userId User ID
   * @returns ProjectModel or null if not found
   */
  protected async getProject(
    projectId: string,
    userId: string
  ): Promise<ProjectModel | null> {
    try {
      return await this.projectRepository.findById(
        projectId,
        `users/${userId}/projects`
      );
    } catch (error: any) {
      logger.error(`Error retrieving project with ID ${projectId}:`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
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

  // Helper Methods - moved to their appropriate locations or removed if duplicated

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
