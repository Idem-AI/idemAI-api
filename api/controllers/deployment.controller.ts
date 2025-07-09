import { Response } from "express";
import { CustomRequest } from "../interfaces/express.interface";
import { DeploymentService } from "../services/Deployment/deployment.service";
import logger from "../config/logger";
import {
  CreateDeploymentPayload,
  UpdateDeploymentPayload,
  GitRepository,
  EnvironmentVariable,
  DeploymentValidators,
  ChatMessage,
  ArchitectureComponent,
} from "../models/deployment.model";
import { PromptService } from "../services/prompt.service";

const deploymentService = new DeploymentService(new PromptService());

// Create a new deployment
export const CreateDeploymentController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    logger.info("Creating deployment....");
    const userId = req.user?.uid;

    const payload: CreateDeploymentPayload = req.body;


    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    logger.info(
      `Creating deployment for userId: ${userId}, projectId: ${payload.projectId}`
    );

    // Validate the payload
    const validationErrors = DeploymentValidators.validateBasicInfo(payload);
    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    const deployment = await deploymentService.createDeployment(
      userId,
      payload.projectId!,
      payload
    );

    res.status(201).json({
      success: true,
      message: "Deployment created successfully",
      data: deployment,
    });
  } catch (error: any) {
    logger.error(`Error creating deployment: ${error.message}`, {
      error: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get deployments by project
export const GetDeploymentsByProjectController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { projectId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    logger.info(
      `Getting deployments for userId: ${userId}, projectId: ${projectId}`
    );

    const deployments = await deploymentService.getDeploymentsByProject(
      userId,
      projectId
    );

    res.status(200).json(deployments);
  } catch (error: any) {
    logger.error(`Error getting deployments: ${error.message}`, {
      error: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get deployment by ID
export const GetDeploymentByIdController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { deploymentId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    logger.info(
      `Getting deployment for userId: ${userId}, deploymentId: ${deploymentId}`
    );

    const deployment = await deploymentService.getDeploymentById(
      userId,
      deploymentId
    );

    if (!deployment) {
      res.status(404).json({
        success: false,
        message: "Deployment not found",
      });
      return;
    }

    res.status(200).json(deployment);
  } catch (error: any) {
    logger.error(`Error getting deployment: ${error.message}`, {
      error: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update deployment
export const UpdateDeploymentController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { deploymentId } = req.params;
    const updates: UpdateDeploymentPayload = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    logger.info(
      `Updating deployment for userId: ${userId}, deploymentId: ${deploymentId}`
    );

    const deployment = await deploymentService.updateDeployment(
      userId,
      deploymentId,
      updates
    );

    if (!deployment) {
      res.status(404).json({
        success: false,
        message: "Deployment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Deployment updated successfully",
      data: deployment,
    });
  } catch (error: any) {
    logger.error(`Error updating deployment: ${error.message}`, {
      error: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete deployment
export const DeleteDeploymentController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { deploymentId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    logger.info(
      `Deleting deployment for userId: ${userId}, deploymentId: ${deploymentId}`
    );

    const success = await deploymentService.deleteDeployment(
      userId,
      deploymentId
    );

    if (!success) {
      res.status(404).json({
        success: false,
        message: "Deployment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Deployment deleted successfully",
    });
  } catch (error: any) {
    logger.error(`Error deleting deployment: ${error.message}`, {
      error: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update Git repository configuration
export const UpdateGitConfigController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { deploymentId } = req.params;
    const gitConfig: GitRepository = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    logger.info(
      `Updating git config for userId: ${userId}, deploymentId: ${deploymentId}`
    );

    // Validate git repository configuration
    const validationErrors =
      DeploymentValidators.validateGitRepository(gitConfig);
    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Git repository validation failed",
        errors: validationErrors,
      });
      return;
    }

    const deployment = await deploymentService.updateGitRepository(
      userId,
      deploymentId,
      gitConfig
    );

    if (!deployment) {
      res.status(404).json({
        success: false,
        message: "Deployment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Git configuration updated successfully",
      data: deployment,
    });
  } catch (error: any) {
    logger.error(`Error updating git config: ${error.message}`, {
      error: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update environment variables
export const UpdateEnvironmentVariablesController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { deploymentId } = req.params;
    const environmentVariables: EnvironmentVariable[] = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    logger.info(
      `Updating environment variables for userId: ${userId}, deploymentId: ${deploymentId}`
    );

    const deployment = await deploymentService.updateEnvironmentVariables(
      userId,
      deploymentId,
      environmentVariables
    );

    if (!deployment) {
      res.status(404).json({
        success: false,
        message: "Deployment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Environment variables updated successfully",
      data: deployment,
    });
  } catch (error: any) {
    logger.error(`Error updating environment variables: ${error.message}`, {
      error: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update architecture components
export const UpdateArchitectureComponentsController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { deploymentId } = req.params;
    const components: ArchitectureComponent[] = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    logger.info(
      `Updating architecture components for userId: ${userId}, deploymentId: ${deploymentId}`
    );

    // Validate architecture components
    const validationErrors =
      DeploymentValidators.validateArchitectureComponents(components);
    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Architecture components validation failed",
        errors: validationErrors,
      });
      return;
    }

    const deployment = await deploymentService.updateArchitectureComponents(
      userId,
      deploymentId,
      components
    );

    if (!deployment) {
      res.status(404).json({
        success: false,
        message: "Deployment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Architecture components updated successfully",
      data: deployment,
    });
  } catch (error: any) {
    logger.error(`Error updating architecture components: ${error.message}`, {
      error: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Add chat message and get AI response
export const AddChatMessageController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;

    const { text } = req.body.message;
    const { projectId } = req.body;
    console.log("projectId", projectId);
    console.log("text", text);
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }
    if (!projectId) {
      res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
      return;
    }

    console.log("text", text);

    if (!text || typeof text !== "string") {
      res.status(400).json({
        success: false,
        message: "Message is required and must be a string",
      });
      return;
    }

    logger.info(
      `Adding chat message for userId: ${userId}, projectId: ${projectId}`
    );

    // Create a chat message with timestamp and initialize structured response fields
    const chatMessage: ChatMessage = {
      sender: "user",
      text: text,
      timestamp: new Date(),
      // User messages don't need these fields, but initialize them for consistency
      isRequestingDetails: false,
      isProposingArchitecture: false,
    };

    // The enhanced addChatMessage method will automatically generate an AI response
    // when it receives a user message
    const chatMessageResponse = await deploymentService.addChatMessage(
      userId,
      projectId,
      chatMessage
    );

    if (!chatMessageResponse) {
      res.status(404).json({
        success: false,
        message: "Chat message not found",
      });
      return;
    }

    res.status(200).json(chatMessageResponse);
  } catch (error: any) {
    logger.error(`Error processing chat message: ${error.message}`, {
      error: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Start deployment pipeline
export const StartPipelineController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { deploymentId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    logger.info(
      `Starting pipeline for userId: ${userId}, deploymentId: ${deploymentId}`
    );

    const deployment = await deploymentService.startDeploymentPipeline(
      userId,
      deploymentId
    );

    if (!deployment) {
      res.status(404).json({
        success: false,
        message: "Deployment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Deployment pipeline started successfully",
      data: deployment,
    });
  } catch (error: any) {
    logger.error(`Error starting pipeline: ${error.message}`, {
      error: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Failed to start deployment pipeline",
      error: error.message,
    });
  }
};

// Get pipeline status
export const GetPipelineStatusController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { deploymentId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    logger.info(
      `Getting pipeline status for userId: ${userId}, deploymentId: ${deploymentId}`
    );

    const deployment = await deploymentService.getDeploymentById(
      userId,
      deploymentId
    );

    if (!deployment) {
      res.status(404).json({
        success: false,
        message: "Deployment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Pipeline status retrieved successfully",
      data: {
        status: deployment.status,
        pipelines: deployment.pipelines,
        costEstimation: deployment.costEstimation,
      },
    });
  } catch (error: any) {
    logger.error(`Error getting pipeline status: ${error.message}`, {
      error: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Estimate deployment cost
export const EstimateCostController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.uid;
    const { deploymentId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    logger.info(
      `Estimating cost for userId: ${userId}, deploymentId: ${deploymentId}`
    );

    const costEstimation = await deploymentService.estimateDeploymentCost(
      userId,
      deploymentId
    );

    if (!costEstimation) {
      res.status(404).json({
        success: false,
        message: "Deployment not found or cost estimation failed",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Cost estimation calculated successfully",
      data: costEstimation,
    });
  } catch (error: any) {
    logger.error(`Error estimating cost: ${error.message}`, {
      error: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Legacy method for backward compatibility
export const GenerateDeploymentController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = "sA6ZeSlrP9Ri8tCNAncPNKi83Nz2";
  const { projectId, deploymentId } = req.body;

  logger.info(
    `GenerateDeploymentController called with projectId: ${projectId}, deploymentId: ${deploymentId}`
  );

  try {
    if (!userId) {
      logger.warn("Authentication missing: userId is undefined");
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }
    if (!projectId && !deploymentId) {
      logger.warn(
        "Missing required parameters: either projectId or deploymentId must be provided"
      );
      res.status(400).json({
        success: false,
        message: "Either Project ID or Deployment ID is required",
      });
      return;
    }

    let deployment;

    deployment = await deploymentService.generateDeployment(
      userId,
      projectId,
      deploymentId
    );

    // Count generated Terraform files for the response message
    const hasGeneratedFiles =
      deployment.generatedTerraformFiles &&
      (deployment.generatedTerraformFiles.main ||
        deployment.generatedTerraformFiles.variables ||
        deployment.generatedTerraformFiles.variablesMap);

    // Count non-empty files
    let fileCount = 0;
    if (deployment.generatedTerraformFiles) {
      if (deployment.generatedTerraformFiles.main) fileCount++;
      if (deployment.generatedTerraformFiles.variables) fileCount++;
      if (deployment.generatedTerraformFiles.variablesMap) fileCount++;
    }

    // Customize the message based on whether we generated for an existing deployment or created a new one
    let message;
    if (deploymentId) {
      message = hasGeneratedFiles
        ? `Generated ${fileCount} Terraform files for existing deployment ${deploymentId}`
        : `No Terraform files generated for deployment ${deploymentId}`;
    } else {
      message = hasGeneratedFiles
        ? `New deployment created successfully with ${fileCount} Terraform files generated`
        : "New deployment created successfully";
    }

    res.status(201).json({
      success: true,
      message,
      data: deployment,
    });
  } catch (error: any) {
    logger.error(
      `Error generating deployment for projectId: ${projectId}. Error: ${error.message}`,
      {
        error: error.stack,
      }
    );

    res.status(500).json({
      success: false,
      message: "Failed to generate deployment",
      error: error.message,
    });
  }
};
