import mongoose, { Model, Document, FilterQuery } from 'mongoose';
import { IRepository } from './IRepository';
import logger from '../config/logger';
import { MongoDBConnection } from '../config/mongodb.config';
import { User, IUserDocument } from '../schemas/user.schema';
import { Project, IProjectDocument } from '../schemas/project.schema';
import { Archetype, IArchetypeDocument } from '../schemas/archetype.schema';

/**
 * MongoDB Repository avec bonnes pratiques Mongoose
 * - Utilise des schémas typés pour validation
 * - Gestion optimisée des connexions
 * - Indexation appropriée
 * - Méthodes utilitaires avancées
 * - Logging complet avec Winston
 */
export class MongoDBRepository<
  T extends { id?: string; createdAt?: Date; updatedAt?: Date }
> implements IRepository<T> {
  
  private static modelRegistry: Map<string, Model<any>> = new Map();
  private static isInitialized = false;

  constructor() {
    if (!MongoDBRepository.isInitialized) {
      this.registerModels();
      MongoDBRepository.isInitialized = true;
    }
    logger.info('MongoDBRepository initialized with typed schemas');
  }

  /**
   * Enregistre tous les modèles Mongoose avec leurs schémas typés
   * Permet la validation et l'indexation automatique
   */
  private registerModels(): void {
    try {
      MongoDBRepository.modelRegistry.set('users', User);
      MongoDBRepository.modelRegistry.set('projects', Project);
      MongoDBRepository.modelRegistry.set('archetypes', Archetype);
      
      logger.info('Mongoose models registered successfully', {
        models: Array.from(MongoDBRepository.modelRegistry.keys())
      });
    } catch (error) {
      logger.error('Failed to register Mongoose models', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Récupère le modèle Mongoose approprié pour une collection
   * Utilise les schémas typés quand disponibles, sinon crée un schéma générique
   */
  private getModel(collectionPath: string): Model<any> {
    const baseCollection = this.extractBaseCollection(collectionPath);
    
    // Vérifie si un modèle typé existe
    if (MongoDBRepository.modelRegistry.has(baseCollection)) {
      return MongoDBRepository.modelRegistry.get(baseCollection)!;
    }

    // Pour les collections inconnues, utilise un schéma flexible
    return this.getOrCreateGenericModel(collectionPath);
  }

  /**
   * Crée un modèle générique pour les collections non typées
   */
  private getOrCreateGenericModel(collectionPath: string): Model<any> {
    // Vérifie si le modèle existe déjà dans mongoose
    if (mongoose.models[collectionPath]) {
      return mongoose.models[collectionPath];
    }

    // Crée un schéma flexible
    const genericSchema = new mongoose.Schema(
      {},
      {
        strict: false, // Accepte tous les champs
        timestamps: true, // createdAt/updatedAt automatiques
        collection: collectionPath,
        toJSON: {
          virtuals: true,
          transform: (doc: any, ret: any) => {
            ret.id = ret._id?.toString() || ret._id;
            delete ret._id;
            if (ret.__v !== undefined) delete ret.__v;
            return ret;
          }
        }
      }
    );

    const model = mongoose.model(collectionPath, genericSchema);
    logger.info(`Created generic Mongoose model for collection: ${collectionPath}`);
    return model;
  }

  /**
   * Extrait le nom de collection de base depuis un chemin
   * Exemple: "users/userId/projects" -> "projects"
   */
  private extractBaseCollection(collectionPath: string): string {
    const parts = collectionPath.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Construit un filtre MongoDB depuis un chemin de collection
   * Ajoute automatiquement userId pour les collections user-specific
   */
  private buildFilter(collectionPath: string, additionalFilter: any = {}): any {
    const filter = { ...additionalFilter };
    
    const pathParts = collectionPath.split('/');
    if (pathParts.length >= 3 && pathParts[0] === 'users') {
      filter.userId = pathParts[1];
    }
    
    return filter;
  }

  /**
   * Ajoute userId aux données si nécessaire
   */
  private addUserIdToData(collectionPath: string, data: any): any {
    const pathParts = collectionPath.split('/');
    if (pathParts.length >= 3 && pathParts[0] === 'users') {
      return { ...data, userId: pathParts[1] };
    }
    return data;
  }

  /**
   * Convertit un document MongoDB en entité applicative
   * Gère la conversion _id -> id et les dates
   */
  private fromMongoDB(doc: any): T | null {
    if (!doc) return null;

    const obj = doc.toJSON ? doc.toJSON() : (doc.toObject ? doc.toObject() : doc);
    
    // Assure que l'id existe
    if (!obj.id && obj._id) {
      obj.id = obj._id.toString();
    }

    // Nettoie les champs MongoDB
    delete obj._id;
    delete obj.__v;

    // Assure que les dates sont des objets Date
    if (obj.createdAt && !(obj.createdAt instanceof Date)) {
      obj.createdAt = new Date(obj.createdAt);
    }
    if (obj.updatedAt && !(obj.updatedAt instanceof Date)) {
      obj.updatedAt = new Date(obj.updatedAt);
    }

    return obj as T;
  }

  /**
   * Convertit une entité applicative en document MongoDB
   * Gère la conversion id -> _id et supprime les undefined
   */
  private toMongoDB(item: Partial<T>): any {
    const doc: any = { ...item };

    // Convertit id en _id si présent
    if (doc.id) {
      doc._id = doc.id;
      delete doc.id;
    }

    // Supprime les valeurs undefined (Mongoose n'aime pas)
    Object.keys(doc).forEach(key => {
      if (doc[key] === undefined) {
        delete doc[key];
      }
    });

    return doc;
  }

  // ==================== CRUD Operations ====================

  async create(
    item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
    collectionPath: string,
    id?: string
  ): Promise<T> {
    const startTime = Date.now();
    logger.info('MongoDBRepository.create called', {
      collectionPath,
      customId: id || 'auto-generated'
    });

    try {
      await MongoDBConnection.getInstance().connect();
      const Model = this.getModel(collectionPath);

      const dataWithUserId = this.addUserIdToData(collectionPath, item);
      const dataToSave: any = this.toMongoDB({
        ...dataWithUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Partial<T>);

      // Si un ID personnalisé est fourni
      if (id) {
        dataToSave._id = id;
      }

      // Utilise create() pour de meilleures performances
      const savedDoc = await Model.create(dataToSave);
      const result = this.fromMongoDB(savedDoc);

      const duration = Date.now() - startTime;
      logger.info('MongoDBRepository.create successful', {
        collectionPath,
        documentId: result?.id,
        duration: `${duration}ms`
      });

      return result!;
    } catch (error) {
      logger.error('MongoDBRepository.create failed', {
        collectionPath,
        customId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string, collectionPath: string): Promise<T | null> {
    const startTime = Date.now();
    logger.info('MongoDBRepository.findById called', {
      collectionPath,
      documentId: id
    });

    try {
      await MongoDBConnection.getInstance().connect();
      const Model = this.getModel(collectionPath);

      // Construit le filtre avec userId si nécessaire
      const filter = this.buildFilter(collectionPath, { _id: id });

      // Utilise lean() pour de meilleures performances
      const doc = await Model.findOne(filter).lean().exec();

      if (!doc) {
        logger.warn('MongoDBRepository.findById - document not found', {
          collectionPath,
          documentId: id
        });
        return null;
      }

      const result = this.fromMongoDB(doc);

      const duration = Date.now() - startTime;
      logger.info('MongoDBRepository.findById successful', {
        collectionPath,
        documentId: id,
        duration: `${duration}ms`
      });

      return result;
    } catch (error) {
      logger.error('MongoDBRepository.findById failed', {
        collectionPath,
        documentId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Failed to find document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(collectionPath: string): Promise<T[]> {
    const startTime = Date.now();
    logger.info('MongoDBRepository.findAll called', { collectionPath });

    try {
      await MongoDBConnection.getInstance().connect();
      const Model = this.getModel(collectionPath);

      const filter = this.buildFilter(collectionPath);

      // Utilise lean() et trie par date de création
      const docs = await Model.find(filter)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const results = docs.map(doc => this.fromMongoDB(doc)!).filter(Boolean);

      const duration = Date.now() - startTime;
      logger.info('MongoDBRepository.findAll successful', {
        collectionPath,
        count: results.length,
        duration: `${duration}ms`
      });

      return results;
    } catch (error) {
      logger.error('MongoDBRepository.findAll failed', {
        collectionPath,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Failed to find documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(
    id: string,
    item: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>,
    collectionPath: string
  ): Promise<T | null> {
    const startTime = Date.now();
    logger.info('MongoDBRepository.update called', {
      collectionPath,
      documentId: id
    });

    try {
      await MongoDBConnection.getInstance().connect();
      const Model = this.getModel(collectionPath);

      const dataWithUserId = this.addUserIdToData(collectionPath, item);
      const dataToUpdate = this.toMongoDB({
        ...dataWithUserId,
        updatedAt: new Date(),
      } as Partial<T>);

      // Supprime les champs qui ne doivent pas être mis à jour
      delete dataToUpdate._id;
      delete dataToUpdate.createdAt;

      const filter = this.buildFilter(collectionPath, { _id: id });

      // findOneAndUpdate avec options optimales
      const updatedDoc = await Model.findOneAndUpdate(
        filter,
        { $set: dataToUpdate },
        {
          new: true, // Retourne le document mis à jour
          runValidators: true, // Exécute les validateurs du schéma
          lean: true // Retourne un objet plain pour performance
        }
      ).exec();

      if (!updatedDoc) {
        logger.warn('MongoDBRepository.update - document not found', {
          collectionPath,
          documentId: id
        });
        return null;
      }

      const result = this.fromMongoDB(updatedDoc);

      const duration = Date.now() - startTime;
      logger.info('MongoDBRepository.update successful', {
        collectionPath,
        documentId: id,
        duration: `${duration}ms`
      });

      return result;
    } catch (error) {
      logger.error('MongoDBRepository.update failed', {
        collectionPath,
        documentId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string, collectionPath: string): Promise<boolean> {
    const startTime = Date.now();
    logger.info('MongoDBRepository.delete called', {
      collectionPath,
      documentId: id
    });

    try {
      await MongoDBConnection.getInstance().connect();
      const Model = this.getModel(collectionPath);

      const filter = this.buildFilter(collectionPath, { _id: id });

      // Utilise deleteOne pour de meilleures performances
      const result = await Model.deleteOne(filter).exec();

      const success = result.deletedCount > 0;

      const duration = Date.now() - startTime;
      if (success) {
        logger.info('MongoDBRepository.delete successful', {
          collectionPath,
          documentId: id,
          duration: `${duration}ms`
        });
      } else {
        logger.warn('MongoDBRepository.delete - document not found', {
          collectionPath,
          documentId: id
        });
      }

      return success;
    } catch (error) {
      logger.error('MongoDBRepository.delete failed', {
        collectionPath,
        documentId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== Méthodes Utilitaires Avancées ====================

  /**
   * Recherche avec filtre personnalisé
   */
  async findWithFilter(
    collectionPath: string,
    filter: FilterQuery<any>,
    options?: { limit?: number; skip?: number; sort?: any }
  ): Promise<T[]> {
    logger.info('MongoDBRepository.findWithFilter called', {
      collectionPath,
      filter
    });

    try {
      await MongoDBConnection.getInstance().connect();
      const Model = this.getModel(collectionPath);

      const fullFilter = this.buildFilter(collectionPath, filter);
      let query = Model.find(fullFilter);

      if (options?.sort) {
        query = query.sort(options.sort);
      } else {
        query = query.sort({ createdAt: -1 });
      }

      if (options?.skip) {
        query = query.skip(options.skip);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const docs = await query.lean().exec();
      const results = docs.map(doc => this.fromMongoDB(doc)!).filter(Boolean);

      logger.info('MongoDBRepository.findWithFilter successful', {
        collectionPath,
        count: results.length
      });

      return results;
    } catch (error) {
      logger.error('MongoDBRepository.findWithFilter failed', {
        collectionPath,
        filter,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to find documents with filter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Compte les documents dans une collection
   */
  async count(collectionPath: string, filter: FilterQuery<any> = {}): Promise<number> {
    try {
      await MongoDBConnection.getInstance().connect();
      const Model = this.getModel(collectionPath);
      const fullFilter = this.buildFilter(collectionPath, filter);
      const count = await Model.countDocuments(fullFilter).exec();
      return count;
    } catch (error) {
      logger.error('MongoDBRepository.count failed', {
        collectionPath,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to count documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Vérifie si un document existe
   */
  async exists(id: string, collectionPath: string): Promise<boolean> {
    try {
      await MongoDBConnection.getInstance().connect();
      const Model = this.getModel(collectionPath);
      const filter = this.buildFilter(collectionPath, { _id: id });
      const exists = await Model.exists(filter).exec();
      return exists !== null;
    } catch (error) {
      logger.error('MongoDBRepository.exists failed', {
        collectionPath,
        documentId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Recherche avec pagination
   */
  async findWithPagination(
    collectionPath: string,
    page: number = 1,
    limit: number = 10,
    filter: FilterQuery<any> = {},
    sort: any = { createdAt: -1 }
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    try {
      await MongoDBConnection.getInstance().connect();
      const Model = this.getModel(collectionPath);

      const fullFilter = this.buildFilter(collectionPath, filter);
      const skip = (page - 1) * limit;

      const [docs, total] = await Promise.all([
        Model.find(fullFilter).sort(sort).skip(skip).limit(limit).lean().exec(),
        Model.countDocuments(fullFilter).exec()
      ]);

      const data = docs.map(doc => this.fromMongoDB(doc)!).filter(Boolean);
      const totalPages = Math.ceil(total / limit);

      logger.info('MongoDBRepository.findWithPagination successful', {
        collectionPath,
        page,
        limit,
        total,
        totalPages
      });

      return { data, total, page, totalPages };
    } catch (error) {
      logger.error('MongoDBRepository.findWithPagination failed', {
        collectionPath,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to find documents with pagination: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
