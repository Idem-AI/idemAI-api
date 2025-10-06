import * as mongoose from 'mongoose';
import { IRepository } from './IRepository';
import logger from '../config/logger';
import { mongoConnection } from '../config/mongodb.config';

// Base interface for MongoDB documents
interface MongoDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Create a flexible schema that accepts any fields - compatible with Mongoose 5.x
const createFlexibleSchema = (): mongoose.Schema => {
  const schema = new mongoose.Schema({}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false, // Disable __v field
    strict: false, // Allow any fields not defined in schema
    toJSON: {
      transform: function(doc: any, ret: any) {
        // Use customId if available, otherwise use _id
        ret.id = ret.customId || ret._id.toString();
        delete ret._id;
        delete ret.customId;
        return ret;
      }
    },
    toObject: {
      transform: function(doc: any, ret: any) {
        // Use customId if available, otherwise use _id
        ret.id = ret.customId || ret._id.toString();
        delete ret._id;
        delete ret.customId;
        return ret;
      }
    }
  });
  
  return schema;
};

export class MongoDBRepository<T extends { id?: string; createdAt?: Date; updatedAt?: Date }> 
  implements IRepository<T> {
  
  private models: Map<string, mongoose.Model<MongoDocument>> = new Map();

  constructor() {
    // Ensure MongoDB connection is established
    if (!mongoConnection.isConnectionActive()) {
      logger.warn('MongoDB not connected in MongoDBRepository constructor');
    }
  }

  /**
   * Get or create a Mongoose model for the given collection
   */
  private getModel(collectionPath: string): mongoose.Model<MongoDocument> {
    // Extract collection name from path (remove userId prefix if present)
    const collectionName = this.extractCollectionName(collectionPath);
    
    if (this.models.has(collectionName)) {
      return this.models.get(collectionName)!;
    }

    // Create a dynamic schema for this collection
    const schema = createFlexibleSchema();
    
    const model = mongoose.model<MongoDocument>(collectionName, schema);
    this.models.set(collectionName, model);
    
    logger.info(`Created MongoDB model for collection: ${collectionName}`);
    return model;
  }

  /**
   * Extract collection name from Firestore-style path
   * Examples: 
   * - "users/userId/projects" -> "projects"
   * - "projects" -> "projects"
   */
  private extractCollectionName(collectionPath: string): string {
    const parts = collectionPath.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Build MongoDB filter from collection path
   * For user-specific collections, add userId to filter
   */
  private buildFilter(collectionPath: string, additionalFilter: any = {}): any {
    const filter = { ...additionalFilter };
    
    // If path contains userId, extract it and add to filter
    const pathParts = collectionPath.split('/');
    if (pathParts.length >= 3 && pathParts[0] === 'users') {
      filter.userId = pathParts[1];
    }
    
    return filter;
  }

  /**
   * Add userId to document data if collection path indicates user-specific data
   */
  private addUserIdToData(collectionPath: string, data: any): any {
    const pathParts = collectionPath.split('/');
    if (pathParts.length >= 3 && pathParts[0] === 'users') {
      return { ...data, userId: pathParts[1] };
    }
    return data;
  }

  async create(
    item: Omit<T, "id" | "createdAt" | "updatedAt">,
    collectionPath: string,
    id?: string
  ): Promise<T> {
    try {
      logger.info('MongoDBRepository.create called', { 
        collectionPath, 
        customId: id ? 'provided' : 'auto-generated'
      });

      const Model = this.getModel(collectionPath);
      const dataWithUserId = this.addUserIdToData(collectionPath, item);
      
      const document = new Model(dataWithUserId);
      
      // Set custom ID if provided
      if (id) {
        // If the ID is not a valid ObjectId format, use it as a custom field
        if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
          logger.info('MongoDBRepository.create - using ObjectId format', { id });
          document._id = new mongoose.Types.ObjectId(id);
        } else {
          logger.info('MongoDBRepository.create - using customId format', { id, idLength: id.length });
          document.set('customId', id);
        }
      }
      
      const savedDoc = await document.save();
      const result = savedDoc.toObject() as unknown as T;
      
      logger.info('MongoDBRepository.create successful', { 
        collectionPath,
        documentId: result.id
      });
      
      return result;
    } catch (error) {
      logger.error('MongoDBRepository.create failed', { 
        collectionPath, 
        customId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async findById(id: string, collectionPath: string): Promise<T | null> {
    try {
      logger.info('MongoDBRepository.findById called', { 
        documentId: id, 
        collectionPath 
      });

      const Model = this.getModel(collectionPath);
      
      // Build filter based on ID format
      let idFilter: any;
      if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
        logger.info('MongoDBRepository.findById - using ObjectId format', { id });
        idFilter = { _id: new mongoose.Types.ObjectId(id) };
      } else {
        logger.info('MongoDBRepository.findById - using customId format', { id, idLength: id.length });
        idFilter = { customId: id };
      }
      
      const filter = this.buildFilter(collectionPath, idFilter);
      logger.info('MongoDBRepository.findById - filter built', { filter });
      
      let document = await Model.findOne(filter);
      
      // If not found and we searched by customId, try also searching by _id (fallback)
      if (!document && !mongoose.Types.ObjectId.isValid(id)) {
        logger.info('MongoDBRepository.findById - trying fallback search by both customId and _id');
        const fallbackFilter = this.buildFilter(collectionPath, {
          $or: [
            { customId: id },
            ...(id.length === 24 ? [{ _id: id }] : [])
          ]
        });
        document = await Model.findOne(fallbackFilter);
      }
      
      if (!document) {
        logger.info('MongoDBRepository.findById - document not found', { 
          documentId: id, 
          collectionPath 
        });
        return null;
      }

      const result = document.toObject() as unknown as T;
      
      logger.info('MongoDBRepository.findById successful', { 
        documentId: id, 
        collectionPath 
      });
      
      return result;
    } catch (error) {
      logger.error('MongoDBRepository.findById failed', { 
        documentId: id, 
        collectionPath,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async findAll(collectionPath: string): Promise<T[]> {
    try {
      logger.info('MongoDBRepository.findAll called', { collectionPath });

      const Model = this.getModel(collectionPath);
      const filter = this.buildFilter(collectionPath);
      
      const documents = await Model.find(filter).sort({ createdAt: -1 });
      const results = documents.map((doc: any) => doc.toObject() as unknown as T);
      
      logger.info('MongoDBRepository.findAll successful', { 
        collectionPath, 
        count: results.length 
      });
      
      return results;
    } catch (error) {
      logger.error('MongoDBRepository.findAll failed', { 
        collectionPath,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async update(
    id: string,
    item: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>,
    collectionPath: string
  ): Promise<T | null> {
    try {
      logger.info('MongoDBRepository.update called', { 
        documentId: id, 
        collectionPath 
      });

      const Model = this.getModel(collectionPath);
      
      // Build filter based on ID format
      let idFilter: any;
      if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
        idFilter = { _id: new mongoose.Types.ObjectId(id) };
      } else {
        // Search by customId for non-ObjectId formats
        idFilter = { customId: id };
      }
      
      const filter = this.buildFilter(collectionPath, idFilter);
      
      // Add userId to update data if needed
      const updateData = this.addUserIdToData(collectionPath, item);
      
      const document = await Model.findOneAndUpdate(
        filter,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      if (!document) {
        logger.warn('MongoDBRepository.update - document not found', { 
          documentId: id, 
          collectionPath 
        });
        return null;
      }

      const result = document.toObject() as unknown as T;
      
      logger.info('MongoDBRepository.update successful', { 
        documentId: id, 
        collectionPath 
      });
      
      return result;
    } catch (error) {
      logger.error('MongoDBRepository.update failed', { 
        documentId: id, 
        collectionPath,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async delete(id: string, collectionPath: string): Promise<boolean> {
    try {
      logger.info('MongoDBRepository.delete called', { 
        documentId: id, 
        collectionPath 
      });

      const Model = this.getModel(collectionPath);
      
      // Build filter based on ID format
      let idFilter: any;
      if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
        idFilter = { _id: new mongoose.Types.ObjectId(id) };
      } else {
        // Search by customId for non-ObjectId formats
        idFilter = { customId: id };
      }
      
      const filter = this.buildFilter(collectionPath, idFilter);
      
      const result = await Model.findOneAndDelete(filter);
      const success = result !== null;
      
      if (success) {
        logger.info('MongoDBRepository.delete successful', { 
          documentId: id, 
          collectionPath 
        });
      } else {
        logger.warn('MongoDBRepository.delete - document not found', { 
          documentId: id, 
          collectionPath 
        });
      }
      
      return success;
    } catch (error) {
      logger.error('MongoDBRepository.delete failed', { 
        documentId: id, 
        collectionPath,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
}
