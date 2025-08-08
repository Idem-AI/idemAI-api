import { Request, Response } from "express";
import { ArchetypeService } from "../services/archetype.service";
import {
  CreateArchetypePayload,
  UpdateArchetypePayload,
} from "../models/archetypes.model";
import { CustomRequest } from "../interfaces/express.interface";
import logger from "../config/logger";

const archetypeService = new ArchetypeService();

/**
 * Create a new archetype
 */
export const createArchetypeController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }
  const payload: CreateArchetypePayload = req.body;

  logger.info(`Creating archetype for user: ${userId}`, {
    userId,
    payload,
  });

  try {
    const archetype = await archetypeService.createArchetype(userId, payload);

    logger.info(`Archetype created successfully:`, {
      userId,
      archetypeId: archetype.id,
      name: archetype.name,
    });

    res.status(201).json({
      success: true,
      message: "Archetype created successfully",
      data: archetype,
    });
    return;
  } catch (error) {
    logger.error(`Error creating archetype for user ${userId}:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      payload,
    });

    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create archetype",
    });
    return;
  }
};

/**
 * Get all archetypes for a user
 */
export const getArchetypesController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  logger.info(`Retrieving archetypes for user: ${userId}`, { userId });

  try {
    const archetypes = await archetypeService.getArchetypes(userId);

    logger.info(`Retrieved ${archetypes.length} archetypes for user: ${userId}`, {
      userId,
      count: archetypes.length,
    });

    res.status(200).json({
      success: true,
      message: "Archetypes retrieved successfully",
      data: archetypes,
    });
    return;
  } catch (error) {
    logger.error(`Error retrieving archetypes for user ${userId}:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userId,
    });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve archetypes",
    });
    return;
  }
};

/**
 * Get archetype by ID
 */
export const getArchetypeByIdController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }
  const archetypeId = req.params.archetypeId;

  logger.info(`Retrieving archetype: ${archetypeId} for user: ${userId}`, {
    userId,
    archetypeId,
  });

  try {
    const archetype = await archetypeService.getArchetypeById(userId, archetypeId);

    if (!archetype) {
      logger.warn(`Archetype not found:`, { userId, archetypeId });
      res.status(404).json({
        success: false,
        message: "Archetype not found",
      });
      return;
    }

    logger.info(`Archetype retrieved successfully:`, {
      userId,
      archetypeId,
      name: archetype.name,
    });

    res.status(200).json({
      success: true,
      message: "Archetype retrieved successfully",
      data: archetype,
    });
    return;
  } catch (error) {
    logger.error(`Error retrieving archetype ${archetypeId} for user ${userId}:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      archetypeId,
    });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve archetype",
    });
    return;
  }
};

/**
 * Update archetype
 */
export const updateArchetypeController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }
  const archetypeId = req.params.archetypeId;
  const payload: UpdateArchetypePayload = req.body;

  logger.info(`Updating archetype: ${archetypeId} for user: ${userId}`, {
    userId,
    archetypeId,
    payload,
  });

  try {
    const archetype = await archetypeService.updateArchetype(userId, archetypeId, payload);

    if (!archetype) {
      logger.warn(`Archetype not found for update:`, { userId, archetypeId });
      res.status(404).json({
        success: false,
        message: "Archetype not found",
      });
      return;
    }

    logger.info(`Archetype updated successfully:`, {
      userId,
      archetypeId,
      name: archetype.name,
    });

    res.status(200).json({
      success: true,
      message: "Archetype updated successfully",
      data: archetype,
    });
    return;
  } catch (error) {
    logger.error(`Error updating archetype ${archetypeId} for user ${userId}:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      archetypeId,
      payload,
    });

    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update archetype",
    });
    return;
  }
};

/**
 * Delete archetype
 */
export const deleteArchetypeController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }
  const archetypeId = req.params.archetypeId;

  logger.info(`Deleting archetype: ${archetypeId} for user: ${userId}`, {
    userId,
    archetypeId,
  });

  try {
    const deleted = await archetypeService.deleteArchetype(userId, archetypeId);

    if (!deleted) {
      logger.warn(`Archetype not found for deletion:`, { userId, archetypeId });
      res.status(404).json({
        success: false,
        message: "Archetype not found",
      });
      return;
    }

    logger.info(`Archetype deleted successfully:`, {
      userId,
      archetypeId,
    });

    res.status(200).json({
      success: true,
      message: "Archetype deleted successfully",
    });
    return;
  } catch (error) {
    logger.error(`Error deleting archetype ${archetypeId} for user ${userId}:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      archetypeId,
    });

    res.status(500).json({
      success: false,
      message: "Failed to delete archetype",
    });
    return;
  }
};

/**
 * Get archetypes by provider
 */
export const getArchetypesByProviderController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }
  const provider = req.params.provider as "aws" | "gcp" | "azure";

  logger.info(`Retrieving archetypes by provider: ${provider} for user: ${userId}`, {
    userId,
    provider,
  });

  try {
    const archetypes = await archetypeService.getArchetypesByProvider(userId, provider);

    logger.info(`Retrieved ${archetypes.length} archetypes for provider ${provider} and user: ${userId}`, {
      userId,
      provider,
      count: archetypes.length,
    });

    res.status(200).json({
      success: true,
      message: "Archetypes retrieved successfully",
      data: archetypes,
    });
    return;
  } catch (error) {
    logger.error(`Error retrieving archetypes by provider ${provider} for user ${userId}:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      provider,
    });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve archetypes",
    });
    return;
  }
};

/**
 * Get archetypes by category
 */
export const getArchetypesByCategoryController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }
  const category = req.params.category;

  logger.info(`Retrieving archetypes by category: ${category} for user: ${userId}`, {
    userId,
    category,
  });

  try {
    const archetypes = await archetypeService.getArchetypesByCategory(userId, category);

    logger.info(`Retrieved ${archetypes.length} archetypes for category ${category} and user: ${userId}`, {
      userId,
      category,
      count: archetypes.length,
    });

    res.status(200).json({
      success: true,
      message: "Archetypes retrieved successfully",
      data: archetypes,
    });
    return;
  } catch (error) {
    logger.error(`Error retrieving archetypes by category ${category} for user ${userId}:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      category,
    });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve archetypes",
    });
    return;
  }
};

/**
 * Generate Terraform tfvars for an archetype
 */
export const generateTerraformTfvarsController = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.uid;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }
  const archetypeId = req.params.archetypeId;
  const customValues = req.body.customValues || {};

  logger.info(`Generating Terraform tfvars for archetype: ${archetypeId} and user: ${userId}`, {
    userId,
    archetypeId,
    customValuesKeys: Object.keys(customValues),
  });

  try {
    // Get the archetype
    const archetype = await archetypeService.getArchetypeById(userId, archetypeId);

    if (!archetype) {
      logger.warn(`Archetype not found for tfvars generation:`, { userId, archetypeId });
      res.status(404).json({
        success: false,
        message: "Archetype not found",
      });
      return;
    }

    // Generate tfvars content
    const tfvarsContent = archetypeService.generateTerraformTfvars(archetype, customValues);

    logger.info(`Terraform tfvars generated successfully for archetype: ${archetypeId}`, {
      userId,
      archetypeId,
      contentLength: tfvarsContent.length,
    });

    res.status(200).json({
      success: true,
      message: "Terraform tfvars generated successfully",
      data: {
        archetypeId,
        archetypeName: archetype.name,
        provider: archetype.provider,
        tfvarsContent,
      },
    });
    return;
  } catch (error) {
    logger.error(`Error generating Terraform tfvars for archetype ${archetypeId} and user ${userId}:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      archetypeId,
    });

    res.status(500).json({
      success: false,
      message: "Failed to generate Terraform tfvars",
    });
    return;
  }
};
