import logger from "../config/logger";
import {
  FinalizeProjectRequest,
} from "../models/policyAcceptance.model";
import { ProjectModel, ProjectPolicyAcceptance } from "../models/project.model";
import { projectService } from "./project.service";

export class PolicyAcceptanceService {
  constructor() {
    // Utilise le ProjectService pour gérer les opérations sur les projets
  }
  /**
   * Finalise un projet en enregistrant l'acceptation des politiques
   */
  async finalizeProject(
    userId: string,
    projectId: string,
    acceptanceData: FinalizeProjectRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ProjectModel> {
    logger.info(
      `Finalizing project - UserId: ${userId}, ProjectId: ${projectId}`
    );

    // Validation des acceptations obligatoires
    if (!acceptanceData.privacyPolicyAccepted) {
      throw new Error("Privacy policy acceptance is required");
    }
    if (!acceptanceData.termsOfServiceAccepted) {
      throw new Error("Terms of service acceptance is required");
    }
    if (!acceptanceData.betaPolicyAccepted) {
      throw new Error("Beta policy acceptance is required");
    }

    // Récupérer le projet via ProjectService
    const project = await projectService.getUserProjectById(userId, projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Vérifier si le projet a déjà été finalisé
    if (project.policyAcceptance) {
      logger.warn(
        `Project already finalized - UserId: ${userId}, ProjectId: ${projectId}`
      );
      throw new Error("Project has already been finalized");
    }

    // Créer l'objet d'acceptation des politiques
    const policyAcceptance: ProjectPolicyAcceptance = {
      privacyPolicyAccepted: acceptanceData.privacyPolicyAccepted,
      termsOfServiceAccepted: acceptanceData.termsOfServiceAccepted,
      betaPolicyAccepted: acceptanceData.betaPolicyAccepted,
      marketingAccepted: acceptanceData.marketingAccepted || false,
      acceptedAt: new Date(),
      ipAddress,
      userAgent,
    };

    // Mettre à jour le projet via ProjectService
    await projectService.editUserProject(userId, projectId, {
      policyAcceptance,
    });

    // Récupérer le projet mis à jour
    const savedProject = await projectService.getUserProjectById(
      userId,
      projectId
    );
    if (!savedProject) {
      throw new Error("Failed to retrieve updated project");
    }

    logger.info(
      `Project finalized successfully - UserId: ${userId}, ProjectId: ${projectId}`
    );
    return savedProject;
  }

  /**
   * Vérifie si un utilisateur a accepté les politiques pour un projet
   */
  async isPolicyAccepted(userId: string, projectId: string): Promise<boolean> {
    try {
      const project = await projectService.getUserProjectById(
        userId,
        projectId
      );
      return project?.policyAcceptance !== undefined;
    } catch (error) {
      logger.error(
        `Error checking policy acceptance - UserId: ${userId}, ProjectId: ${projectId}`,
        error
      );
      return false;
    }
  }

  /**
   * Récupère l'acceptation des politiques pour un utilisateur et un projet
   */
  async getPolicyAcceptance(
    userId: string,
    projectId: string
  ): Promise<ProjectPolicyAcceptance | null> {
    try {
      const project = await projectService.getUserProjectById(
        userId,
        projectId
      );
      return project?.policyAcceptance || null;
    } catch (error) {
      logger.error(
        `Error fetching policy acceptance - UserId: ${userId}, ProjectId: ${projectId}`,
        error
      );
      return null;
    }
  }

  /**
   * Récupère toutes les acceptations de politiques pour un utilisateur
   */
  async getUserPolicyAcceptances(
    userId: string
  ): Promise<ProjectPolicyAcceptance[]> {
    try {
      logger.info(`Fetching all policy acceptances for userId: ${userId}`);
      const projects = await projectService.getAllUserProjects(userId);
      const acceptances = projects
        .filter((project) => project.policyAcceptance)
        .map((project) => project.policyAcceptance!);
      return acceptances;
    } catch (error) {
      logger.error(
        `Error fetching user policy acceptances - UserId: ${userId}`,
        error
      );
      return [];
    }
  }
}

// Export singleton instance
export const policyAcceptanceService = new PolicyAcceptanceService();
