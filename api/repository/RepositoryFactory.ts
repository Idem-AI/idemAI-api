import { IRepository } from './IRepository';
import { FirestoreRepository } from './FirestoreRepository';
import { activeSGBD, SGBDType } from './database.config';
import logger from '../config/logger';

// Define a base type for entities that might have createdAt/updatedAt as Date
// This ensures the factory can work with the generic constraint of IRepository
interface BaseEntity {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RepositoryFactory {
  /**
   * Get a repository instance for the specified collection
   * @param collectionName The name of the collection
   * @param userSpecificCollection Whether the collection is stored under users/{userId}/{collectionName}
   * @returns A repository instance for the specified collection
   */
  public static getRepository<T extends BaseEntity>(
    collectionName: string, 
    userSpecificCollection: boolean = false
  ): IRepository<T> {
    logger.info(`RepositoryFactory.getRepository called for collection: ${collectionName}, userSpecific: ${userSpecificCollection}, SGBD: ${activeSGBD}`);
    
    switch (activeSGBD) {
      case SGBDType.FIRESTORE:
        logger.info(`Creating FirestoreRepository for collection: ${collectionName}, userSpecific: ${userSpecificCollection}`);
        return new FirestoreRepository<T>(collectionName, userSpecificCollection);
      // case SGBDType.MONGODB:
      //   // Assuming you would have a MongoDBRepository that implements IRepository
      //   // import { MongoDBRepository } from './MongoDBRepository'; 
      //   // return new MongoDBRepository<T>(collectionName, userSpecificCollection);
      // case SGBDType.POSTGRESQL:
      //   // Assuming you would have a PostgreSQLRepository that implements IRepository
      //   // import { PostgreSQLRepository } from './PostgreSQLRepository';
      //   // return new PostgreSQLRepository<T>(collectionName, userSpecificCollection, someDbConnection);
      default:
        logger.error(`Unsupported SGBD type: ${activeSGBD} requested for collection: ${collectionName}`);
        throw new Error(`Unsupported SGBD type: ${activeSGBD}`);
    }
  }
}
