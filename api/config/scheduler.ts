import cron from "node-cron";
import { cleanupExpiredTokens } from "../scripts/cleanupExpiredTokens";
import logger from "./logger";

/**
 * Configuration et démarrage des tâches programmées
 */
export function startScheduledTasks(): void {
  logger.info("Starting scheduled tasks");

  // Nettoyage des refresh tokens expirés - tous les jours à 2h du matin
  cron.schedule("0 2 * * *", async () => {
    logger.info("Running scheduled cleanup of expired refresh tokens");
    try {
      await cleanupExpiredTokens();
    } catch (error) {
      logger.error("Scheduled cleanup failed:", error);
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  logger.info("Scheduled tasks configured successfully");
}

/**
 * Arrêt des tâches programmées
 */
export function stopScheduledTasks(): void {
  logger.info("Stopping scheduled tasks");
  cron.destroy();
}
