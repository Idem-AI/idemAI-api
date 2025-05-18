import { IRepository } from './IRepository';
import { FirestoreRepository } from './FirestoreRepository';
import { activeSGBD, SGBDType } from './database.config';

// Define a base type for entities that might have createdAt/updatedAt as Date
// This ensures the factory can work with the generic constraint of IRepository
interface BaseEntity {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RepositoryFactory {
  public static getRepository<T extends BaseEntity>(collectionName: string): IRepository<T> {
    switch (activeSGBD) {
      case SGBDType.FIRESTORE:
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
        throw new Error(`Unsupported SGBD type: ${activeSGBD}`);
    }
  }
}
