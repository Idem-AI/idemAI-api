import { IRepository } from './IRepository';
import { MongoDBRepository } from './MongoDBRepository.v2';
import { activeSGBD, SGBDType } from './database.config';
import logger from '../config/logger';

/**
 * Factory class pour obtenir l'implémentation MongoDB du repository.
 * Simplifié pour utiliser uniquement MongoDB avec Mongoose.
 */
export class RepositoryFactory {
  /**
   * Retourne une instance du repository MongoDB avec schémas typés.
   * @template T Le type de l'entité.
   * @returns Une instance de IRepository<T> utilisant MongoDB/Mongoose.
   */
  static getRepository<
    T extends { id?: string; createdAt?: Date; updatedAt?: Date }
  >(): IRepository<T> {
    logger.info(
      `RepositoryFactory.getRepository called - using MongoDB with Mongoose`
    );

    switch (activeSGBD) {
      case SGBDType.MONGODB:
        logger.info('Returning MongoDBRepository instance with typed schemas');
        return new MongoDBRepository<T>();
      default:
        logger.error(`Unsupported SGBD type: ${activeSGBD}`);
        throw new Error(`Unsupported SGBD type: ${activeSGBD}. Only MongoDB is supported.`);
    }
  }
}
