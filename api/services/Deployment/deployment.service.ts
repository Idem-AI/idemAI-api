import { 
  DeploymentModel, 
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
  DeploymentMapper
} from "../../models/deployment.model";
import { IRepository } from "../../repository/IRepository";
import { RepositoryFactory } from "../../repository/RepositoryFactory";
import { TargetModelType } from "../../enums/targetModelType.enum";
import logger from "../../config/logger";

export class DeploymentService {
  private repository: IRepository<DeploymentModel>;

  constructor() {
    logger.info("DeploymentService initialized.");
    this.repository = RepositoryFactory.getRepository<DeploymentModel>(
      TargetModelType.DEPLOYMENT
    );
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
      // Validate the payload
      const formData: DeploymentFormData = {
        mode: 'beginner', // Default mode, can be overridden
        name: payload.name,
        environment: payload.environment,
        repoUrl: payload.gitRepository?.url,
        branch: payload.gitRepository?.branch,
        environmentVariables: payload.environmentVariables,
      };

      const validationErrors = this.validateDeploymentData(formData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const deploymentId = `deployment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newDeployment: DeploymentModel = {
        id: deploymentId,
        projectId,
        name: payload.name,
        environment: payload.environment,
        status: "configuring",
        gitRepository: payload.gitRepository as GitRepository,
        environmentVariables: payload.environmentVariables || [],
        pipeline: {
          currentStage: "Initial Configuration",
          steps: this.initializePipelineSteps(),
          startedAt: undefined,
          estimatedCompletionTime: undefined,
        },
        chatMessages: [],
        architectureTemplates: [],
        cloudComponents: [],
        architectureComponents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add architecture template if specified
      if (payload.architectureTemplate) {
        newDeployment.architectureTemplates = [
          await this.getArchitectureTemplate(payload.architectureTemplate)
        ];
      }

      // Add custom architecture components if specified
      if (payload.customArchitecture?.components) {
        newDeployment.architectureComponents = payload.customArchitecture.components.map(comp => ({
          ...this.getDefaultCloudComponent(),
          instanceId: comp.instanceId,
          type: comp.type,
          configuration: comp.config,
        }));
      }

      const createdDeployment = await this.repository.create(newDeployment, userId);
      
      logger.info(
        `Deployment created successfully - UserId: ${userId}, ProjectId: ${projectId}, DeploymentId: ${createdDeployment.id}`
      );
      
      return createdDeployment;
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
    data: Pick<DeploymentModel, "name" | "environment">
  ): Promise<DeploymentModel> {
    const payload: CreateDeploymentPayload = {
      name: data.name,
      environment: data.environment,
    };
    return this.createDeployment(userId, projectId, payload);
  }

  async getDeploymentsByProject(
    userId: string,
    projectId: string
  ): Promise<DeploymentModel[]> {
    logger.info(
      `getDeploymentsByProject called for userId: ${userId}, projectId: ${projectId}`
    );
    try {
      const deployments = await this.repository.findAll(userId);
      const filteredDeployments = deployments.filter(
        deployment => deployment.projectId === projectId
      );
      
      logger.info(
        `Found ${filteredDeployments.length} deployments for userId: ${userId}, projectId: ${projectId}`
      );
      return filteredDeployments;
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
      const deployment = await this.repository.findById(userId, deploymentId);
      if (deployment) {
        logger.info(
          `Deployment found - UserId: ${userId}, DeploymentId: ${deploymentId}`
        );
      } else {
        logger.warn(
          `Deployment not found - UserId: ${userId}, DeploymentId: ${deploymentId}`
        );
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
  ): Promise<DeploymentModel | null> {
    logger.info(
      `updateDeployment called for userId: ${userId}, deploymentId: ${deploymentId}`
    );
    try {
      const existingDeployment = await this.repository.findById(userId, deploymentId);
      if (!existingDeployment) {
        logger.warn(
          `Deployment not found for update - UserId: ${userId}, DeploymentId: ${deploymentId}`
        );
        return null;
      }

      const updatedData = {
        ...updateData,
        updatedAt: new Date(),
      };

      const updatedDeployment = await this.repository.update(deploymentId, updatedData, userId);
      
      logger.info(
        `Deployment updated successfully - UserId: ${userId}, DeploymentId: ${deploymentId}`
      );
      return updatedDeployment;
    } catch (error: any) {
      logger.error(
        `Error updating deployment for userId: ${userId}, deploymentId: ${deploymentId}. Error: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
  }

  async deleteDeployment(userId: string, deploymentId: string): Promise<boolean> {
    logger.info(
      `deleteDeployment called for userId: ${userId}, deploymentId: ${deploymentId}`
    );
    try {
      const success = await this.repository.delete(deploymentId, userId);
      if (success) {
        logger.info(
          `Deployment deleted successfully - UserId: ${userId}, DeploymentId: ${deploymentId}`
        );
      } else {
        logger.warn(
          `Deployment not found for deletion - UserId: ${userId}, DeploymentId: ${deploymentId}`
        );
      }
      return success;
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
      const validationErrors = DeploymentValidators.validateGitRepository(gitConfig);
      if (validationErrors.length > 0) {
        throw new Error(`Git repository validation failed: ${validationErrors.join(', ')}`);
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
      const validationErrors = DeploymentValidators.validateArchitectureComponents(components);
      if (validationErrors.length > 0) {
        throw new Error(`Architecture components validation failed: ${validationErrors.join(', ')}`);
      }

      return await this.updateDeployment(userId, deploymentId, {
        architectureComponents: components,
      });
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
    deploymentId: string,
    message: ChatMessage
  ): Promise<DeploymentModel | null> {
    logger.info(
      `addChatMessage called for userId: ${userId}, deploymentId: ${deploymentId}, sender: ${message.sender}`
    );
    
    try {
      const deployment = await this.getDeploymentById(userId, deploymentId);
      if (!deployment) {
        return null;
      }

      const updatedMessages = [...(deployment.chatMessages || []), message];
      return await this.updateDeployment(userId, deploymentId, {
        chatMessages: updatedMessages,
      });
    } catch (error: any) {
      logger.error(
        `Error adding chat message for deployment ${deploymentId}: ${error.message}`,
        { error: error.stack }
      );
      throw error;
    }
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
        throw new Error(`Pipeline validation failed: ${validationErrors.join(', ')}`);
      }

      const updatedPipeline = {
        currentStage: "Building",
        steps: this.initializePipelineSteps().map(step => ({
          ...step,
          status: step.name === "Code Analysis" ? 'in-progress' as const : 'pending' as const,
          startedAt: step.name === "Code Analysis" ? new Date() : undefined,
        })),
        startedAt: new Date(),
        estimatedCompletionTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes estimate
      };

      const updatedDeployment = await this.updateDeployment(userId, deploymentId, {
        status: "building",
        pipeline: updatedPipeline,
      });

      // Start asynchronous pipeline execution
      this.executePipeline(userId, deploymentId);

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
    stepUpdate: Partial<PipelineStep>
  ): Promise<DeploymentModel | null> {
    logger.info(
      `updatePipelineStep called for userId: ${userId}, deploymentId: ${deploymentId}, step: ${stepName}`
    );
    
    try {
      const deployment = await this.getDeploymentById(userId, deploymentId);
      if (!deployment || !deployment.pipeline) {
        return null;
      }

      const updatedSteps = deployment.pipeline.steps.map(step =>
        step.name === stepName ? { ...step, ...stepUpdate } : step
      );

      return await this.updateDeployment(userId, deploymentId, {
        pipeline: {
          ...deployment.pipeline,
          steps: updatedSteps,
        },
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

  async estimateDeploymentCost(userId: string, deploymentId: string): Promise<CostEstimation | null> {
    logger.info(`estimateDeploymentCost called for userId: ${userId}, deploymentId: ${deploymentId}`);
    
    try {
      const deployment = await this.getDeploymentById(userId, deploymentId);
      if (!deployment) {
        return null;
      }

      // Calculate cost based on architecture components
      const costEstimation = this.calculateCostEstimation(deployment.architectureComponents || []);
      
      // Update deployment with new cost estimation
      await this.updateDeployment(userId, deploymentId, { costEstimation });
      
      return costEstimation;
    } catch (error: any) {
      logger.error(`Error estimating deployment cost for deployment ${deploymentId}: ${error.message}`, { error: error.stack });
      throw error;
    }
  }

  private calculateCostEstimation(components: ArchitectureComponent[]): CostEstimation {
    let monthlyCost = 0;
    let hourlyCost = 0;
    let oneTimeCost = 0;

    components.forEach(component => {
      switch (component.type) {
        case 'lambda':
        case 'function':
          monthlyCost += 10; // Base Lambda cost
          hourlyCost += 0.01;
          break;
        case 'database':
          monthlyCost += 25; // Database cost
          hourlyCost += 0.04;
          break;
        case 'storage':
          monthlyCost += 5; // Storage cost
          hourlyCost += 0.007;
          break;
        case 'cdn':
          monthlyCost += 15; // CDN cost
          hourlyCost += 0.02;
          break;
        case 'load-balancer':
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
      currency: 'USD',
      estimatedAt: new Date(),
      breakdown: components.map(component => ({
        componentId: component.id,
        componentName: component.name,
        cost: 10, // Simplified cost per component
        description: `Cost for ${component.type} component`,
      })),
    };
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
      errors.push(...DeploymentValidators.validateArchitectureComponents(formData.customComponents));
    }
    
    return errors;
  }

  private validateDeploymentForPipeline(deployment: DeploymentModel): string[] {
    const errors: string[] = [];
    
    if (!deployment.gitRepository) {
      errors.push('Git repository configuration is required for pipeline execution');
    }
    
    if (deployment.status === 'building' || deployment.status === 'deploying') {
      errors.push('Deployment pipeline is already running');
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

  private async getArchitectureTemplate(templateId: string): Promise<ArchitectureTemplate> {
    // Mock implementation - in real scenario, this would fetch from a template repository
    return {
      id: templateId,
      provider: 'aws',
      category: 'web-application',
      name: 'Standard Web Application',
      description: 'A standard web application template with load balancer, compute, and database',
      tags: ['web', 'scalable', 'production-ready'],
      icon: 'web-app-icon',
    };
  }

  private getDefaultCloudComponent(): CloudComponentDetailed {
    return {
      id: '',
      name: '',
      description: '',
      category: '',
      provider: 'aws',
      icon: '',
      pricing: '$0.00/month',
      options: [],
    };
  }

  private calculateComponentCost(component: ArchitectureComponent): number {
    // Basic cost calculation - would be more sophisticated in real implementation
    const baseCosts: Record<string, number> = {
      'database': 25,
      'compute': 50,
      'storage': 10,
      'load-balancer': 15,
    };
    
    return baseCosts[component.type] || 20;
  }

  private async executePipeline(userId: string, deploymentId: string): Promise<void> {
    // Asynchronous pipeline execution simulation
    setTimeout(async () => {
      try {
        await this.simulatePipelineExecution(userId, deploymentId);
      } catch (error: any) {
        logger.error(`Pipeline execution failed for deployment ${deploymentId}: ${error.message}`);
      }
    }, 1000);
  }

  private async simulatePipelineExecution(userId: string, deploymentId: string): Promise<void> {
    const steps = [
      "Code Analysis",
      "Security Scan", 
      "Build",
      "Infrastructure Provisioning",
      "Deployment",
      "Post-deployment Tests"
    ];

    for (let i = 0; i < steps.length; i++) {
      const stepName = steps[i];
      
      // Start step
      await this.updatePipelineStep(userId, deploymentId, stepName, {
        status: 'in-progress',
        startedAt: new Date(),
      });

      // Simulate step execution time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Complete step
      await this.updatePipelineStep(userId, deploymentId, stepName, {
        status: 'succeeded',
        finishedAt: new Date(),
        logs: `Step ${stepName} completed successfully`,
      });

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
}
