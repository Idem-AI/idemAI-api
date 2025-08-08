import {
  ArchetypeModel,
  CreateArchetypePayload,
  UpdateArchetypePayload,
  ArchetypeValidators,
} from "../models/archetypes.model";
import { RepositoryFactory } from "../repository/RepositoryFactory";
import { IRepository } from "../repository/IRepository";
import logger from "../config/logger";

export class ArchetypeService {
  private archetypeRepository: IRepository<ArchetypeModel>;

  constructor() {
    this.archetypeRepository =
      RepositoryFactory.getRepository<ArchetypeModel>();
    logger.info("ArchetypeService initialized.");
  }

  /**
   * Create a new archetype
   */
  async createArchetype(
    userId: string,
    payload: CreateArchetypePayload
  ): Promise<ArchetypeModel> {
    logger.info(`Creating archetype for user: ${userId}`, { payload });

    try {
      // Validate payload
      const validationErrors =
        ArchetypeValidators.validateCreatePayload(payload);
      if (validationErrors.length > 0) {
        logger.warn(`Validation errors for archetype creation:`, {
          validationErrors,
        });
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      // Create archetype model
      const archetypeData: Omit<
        ArchetypeModel,
        "id" | "createdAt" | "updatedAt"
      > = {
        name: payload.name,
        description: payload.description,
        provider: payload.provider,
        category: payload.category,
        tags: payload.tags || [],
        icon: payload.icon || "",
        version: payload.version || "1.0.0",
        terraformVariables: payload.terraformVariables,
        defaultValues: payload.defaultValues || {},
        isActive: payload.isActive !== undefined ? payload.isActive : true,
        createdBy: userId,
      };

      const createdArchetype = await this.archetypeRepository.create(
        archetypeData,
        `users/${userId}/archetypes`
      );

      logger.info(`Archetype created successfully:`, {
        archetypeId: createdArchetype.id,
        userId,
        name: createdArchetype.name,
      });

      return createdArchetype;
    } catch (error) {
      logger.error(`Error creating archetype for user ${userId}:`, {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        payload,
      });
      throw error;
    }
  }

  /**
   * Get all archetypes for a user
   */
  async getArchetypes(userId: string): Promise<ArchetypeModel[]> {
    logger.info(`Retrieving archetypes for user: ${userId}`);

    try {
      const archetypes = await this.archetypeRepository.findAll(
        `users/${userId}/archetypes`
      );

      logger.info(
        `Retrieved ${archetypes.length} archetypes for user: ${userId}`
      );
      return archetypes;
    } catch (error) {
      logger.error(`Error retrieving archetypes for user ${userId}:`, {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Get archetype by ID
   */
  async getArchetypeById(
    userId: string,
    archetypeId: string
  ): Promise<ArchetypeModel | null> {
    logger.info(`Retrieving archetype: ${archetypeId} for user: ${userId}`);

    try {
      const archetype = await this.archetypeRepository.findById(
        archetypeId,
        `users/${userId}/archetypes`
      );

      if (archetype) {
        logger.info(`Archetype found:`, {
          archetypeId,
          userId,
          name: archetype.name,
        });
      } else {
        logger.warn(`Archetype not found:`, { archetypeId, userId });
      }

      return archetype;
    } catch (error) {
      logger.error(
        `Error retrieving archetype ${archetypeId} for user ${userId}:`,
        {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          archetypeId,
        }
      );
      throw error;
    }
  }

  /**
   * Update archetype
   */
  async updateArchetype(
    userId: string,
    archetypeId: string,
    payload: UpdateArchetypePayload
  ): Promise<ArchetypeModel | null> {
    logger.info(`Updating archetype: ${archetypeId} for user: ${userId}`, {
      payload,
    });

    try {
      // Check if archetype exists
      const existingArchetype = await this.archetypeRepository.findById(
        archetypeId,
        `users/${userId}/archetypes`
      );
      if (!existingArchetype) {
        logger.warn(`Archetype not found for update:`, { archetypeId, userId });
        return null;
      }

      // Validate terraform variables if provided
      if (payload.terraformVariables) {
        for (const variable of payload.terraformVariables) {
          const validationErrors =
            ArchetypeValidators.validateTerraformVariable(variable);
          if (validationErrors.length > 0) {
            logger.warn(`Validation errors for terraform variable:`, {
              validationErrors,
              variable,
            });
            throw new Error(
              `Terraform variable validation failed: ${validationErrors.join(
                ", "
              )}`
            );
          }
        }
      }

      // Update archetype
      const updatedArchetype = await this.archetypeRepository.update(
        archetypeId,
        payload,
        `users/${userId}/archetypes`
      );

      if (updatedArchetype) {
        logger.info(`Archetype updated successfully:`, {
          archetypeId,
          userId,
          name: updatedArchetype.name,
        });
      }

      return updatedArchetype;
    } catch (error) {
      logger.error(
        `Error updating archetype ${archetypeId} for user ${userId}:`,
        {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          archetypeId,
          payload,
        }
      );
      throw error;
    }
  }

  /**
   * Delete archetype
   */
  async deleteArchetype(userId: string, archetypeId: string): Promise<boolean> {
    logger.info(`Deleting archetype: ${archetypeId} for user: ${userId}`);

    try {
      // Check if archetype exists
      const existingArchetype = await this.archetypeRepository.findById(
        archetypeId,
        `users/${userId}/archetypes`
      );
      if (!existingArchetype) {
        logger.warn(`Archetype not found for deletion:`, {
          archetypeId,
          userId,
        });
        return false;
      }

      // Delete archetype
      const deleted = await this.archetypeRepository.delete(
        archetypeId,
        `users/${userId}/archetypes`
      );

      if (deleted) {
        logger.info(`Archetype deleted successfully:`, {
          archetypeId,
          userId,
          name: existingArchetype.name,
        });
      }

      return deleted;
    } catch (error) {
      logger.error(
        `Error deleting archetype ${archetypeId} for user ${userId}:`,
        {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          archetypeId,
        }
      );
      throw error;
    }
  }

  /**
   * Get archetypes by provider
   */
  async getArchetypesByProvider(
    userId: string,
    provider: "aws" | "gcp" | "azure"
  ): Promise<ArchetypeModel[]> {
    logger.info(
      `Retrieving archetypes by provider: ${provider} for user: ${userId}`
    );

    try {
      const allArchetypes = await this.archetypeRepository.findAll(userId);
      const filteredArchetypes = allArchetypes.filter(
        (archetype) => archetype.provider === provider && archetype.isActive
      );

      logger.info(
        `Retrieved ${filteredArchetypes.length} archetypes for provider ${provider} and user: ${userId}`
      );
      return filteredArchetypes;
    } catch (error) {
      logger.error(
        `Error retrieving archetypes by provider ${provider} for user ${userId}:`,
        {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          provider,
        }
      );
      throw error;
    }
  }

  /**
   * Get archetypes by category
   */
  async getArchetypesByCategory(
    userId: string,
    category: string
  ): Promise<ArchetypeModel[]> {
    logger.info(
      `Retrieving archetypes by category: ${category} for user: ${userId}`
    );

    try {
      const allArchetypes = await this.archetypeRepository.findAll(userId);
      const filteredArchetypes = allArchetypes.filter(
        (archetype) => archetype.category === category && archetype.isActive
      );

      logger.info(
        `Retrieved ${filteredArchetypes.length} archetypes for category ${category} and user: ${userId}`
      );
      return filteredArchetypes;
    } catch (error) {
      logger.error(
        `Error retrieving archetypes by category ${category} for user ${userId}:`,
        {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          category,
        }
      );
      throw error;
    }
  }

  /**
   * Generate Terraform tfvars content from archetype
   */
  generateTerraformTfvars(
    archetype: ArchetypeModel,
    customValues: Record<string, any> = {}
  ): string {
    logger.info(`Generating Terraform tfvars for archetype: ${archetype.id}`, {
      archetypeId: archetype.id,
      customValuesKeys: Object.keys(customValues),
    });

    try {
      let tfvarsContent = `# Terraform variables for ${archetype.name}\n`;
      tfvarsContent += `# Generated from archetype: ${archetype.id}\n`;
      tfvarsContent += `# Provider: ${archetype.provider}\n`;
      tfvarsContent += `# Category: ${archetype.category}\n`;
      tfvarsContent += `# Version: ${archetype.version}\n\n`;

      // Process each terraform variable
      for (const variable of archetype.terraformVariables) {
        tfvarsContent += `# ${variable.description}\n`;

        // Use custom value if provided, otherwise use default or archetype default
        let value = customValues[variable.name];
        if (value === undefined) {
          value =
            variable.default !== undefined
              ? variable.default
              : archetype.defaultValues[variable.name];
        }

        // Format value based on type
        const formattedValue = this.formatTerraformValue(value, variable.type);
        tfvarsContent += `${variable.name} = ${formattedValue}\n\n`;
      }

      logger.info(
        `Generated Terraform tfvars content for archetype: ${archetype.id}`
      );
      return tfvarsContent;
    } catch (error) {
      logger.error(
        `Error generating Terraform tfvars for archetype ${archetype.id}:`,
        {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          archetypeId: archetype.id,
        }
      );
      throw error;
    }
  }

  /**
   * Format value according to Terraform type
   */
  private formatTerraformValue(value: any, type: string): string {
    if (value === null || value === undefined) {
      return "null";
    }

    switch (type) {
      case "string":
        return `"${value}"`;
      case "number":
        return String(value);
      case "bool":
        return String(value);
      case "list(string)":
        if (Array.isArray(value)) {
          return `[${value.map((v) => `"${v}"`).join(", ")}]`;
        }
        return "[]";
      case "list(number)":
        if (Array.isArray(value)) {
          return `[${value.join(", ")}]`;
        }
        return "[]";
      case "map(string)":
        if (typeof value === "object" && value !== null) {
          const entries = Object.entries(value).map(
            ([k, v]) => `"${k}" = "${v}"`
          );
          return `{\n  ${entries.join(",\n  ")}\n}`;
        }
        return "{}";
      case "map(number)":
        if (typeof value === "object" && value !== null) {
          const entries = Object.entries(value).map(
            ([k, v]) => `"${k}" = ${v}`
          );
          return `{\n  ${entries.join(",\n  ")}\n}`;
        }
        return "{}";
      case "object":
        if (typeof value === "object" && value !== null) {
          return JSON.stringify(value, null, 2);
        }
        return "{}";
      default:
        return `"${value}"`;
    }
  }
}
