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
  public static getRepository<T extends BaseEntity>(collectionName: string): IRepository<T> {
    logger.info(`RepositoryFactory.getRepository called for collection: ${collectionName}, SGBD: ${activeSGBD}`);
    switch (activeSGBD) {
      case SGBDType.FIRESTORE:
        logger.info(`Creating FirestoreRepository for collection: ${collectionName}`);
        return new FirestoreRepository<T>(collectionName);
      // case SGBDType.MONGODB:
      //   // Assuming you would have a MongoDBRepository that implements IRepository
      //   // import { MongoDBRepository } from './MongoDBRepository'; 
      //   // return new MongoDBRepository<T>(collectionName);
      // case SGBDType.POSTGRESQL:
      //   // Assuming you would have a PostgreSQLRepository that implements IRepository
      //   // import { PostgreSQLRepository } from './PostgreSQLRepository';
      //   // return new PostgreSQLRepository<T>(collectionName, someDbConnection); // Might need db connection
      default:
        logger.error(`Unsupported SGBD type: ${activeSGBD} requested for collection: ${collectionName}`);
        throw new Error(`Unsupported SGBD type: ${activeSGBD}`);
    }
  }
}
