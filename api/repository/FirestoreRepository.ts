import admin from 'firebase-admin';
import { CollectionReference, DocumentReference, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { IRepository } from './IRepository';
import logger from '../config/logger';

const db = admin.firestore();

/**
 * A generic Firestore repository implementation.
 * @template T The type of the document, must have an 'id' property and optionally 'createdAt', 'updatedAt' as Date.
 */
export class FirestoreRepository<T extends { id?: string; createdAt?: Date; updatedAt?: Date }> implements IRepository<T> {
  private collectionName: string;

  /**
   * @param collectionName The name of the Firestore collection.
   */
  constructor(collectionName: string) {
    this.collectionName = collectionName;
    logger.info(`FirestoreRepository initialized for collection: ${collectionName}`);
  }

  private getCollection(userId?: string): CollectionReference {
    if (userId) {
      return db.collection(`users/${userId}/${this.collectionName}`);
    }
    return db.collection(this.collectionName);
  }

  private getDocument(id: string, userId?: string): DocumentReference {
    return this.getCollection(userId).doc(id);
  }

  // Helper to convert Firestore Timestamps in data to Date objects
  private fromFirestore(data: admin.firestore.DocumentData | undefined): T | null {
    if (!data) return null;
    const entity = { ...data } as any; // Use 'any' for intermediate transformation
    if (data.createdAt && data.createdAt instanceof Timestamp) {
      entity.createdAt = data.createdAt.toDate();
    }
    if (data.updatedAt && data.updatedAt instanceof Timestamp) {
      entity.updatedAt = data.updatedAt.toDate();
    }
    return entity as T;
  }

  // Helper to convert Date objects in item to Firestore Timestamps
  private toFirestore(item: Partial<T>): any {
    const firestoreData = { ...item } as any;
    if (item.createdAt && item.createdAt instanceof Date) {
      firestoreData.createdAt = Timestamp.fromDate(item.createdAt);
    }
    if (item.updatedAt && item.updatedAt instanceof Date) {
      firestoreData.updatedAt = Timestamp.fromDate(item.updatedAt);
    }
    return firestoreData;
  }

  async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<T> {
    logger.info(`FirestoreRepository.create called for collection: ${this.collectionName}, userId: ${userId || 'N/A'}`);
    try {
      const collectionRef = this.getCollection(userId);
      const dataToSave = this.toFirestore({
        ...item,
        createdAt: new Date(), // Set by application logic, converted by toFirestore
        updatedAt: new Date(), // Set by application logic, converted by toFirestore
      } as Partial<T>); // Cast to Partial<T> as id is not yet present

      const docRef = await collectionRef.add(dataToSave);
      // Return the entity with its new ID and converted dates
      const createdItem = { id: docRef.id, ...this.fromFirestore(dataToSave)!, ...item } as T;
      logger.info(`Document created successfully in ${this.collectionName}, userId: ${userId || 'N/A'}, documentId: ${docRef.id}`);
      return createdItem;
    } catch (error: any) {
      logger.error(`Error creating document in ${this.collectionName}, userId: ${userId || 'N/A'}: ${error.message}`, { stack: error.stack, item });
      throw error;
    }
  }

  async findById(id: string, userId?: string): Promise<T | null> {
    logger.info(`FirestoreRepository.findById called for collection: ${this.collectionName}, documentId: ${id}, userId: ${userId || 'N/A'}`);
    try {
      const docRef = this.getDocument(id, userId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        logger.warn(`Document not found in ${this.collectionName}, documentId: ${id}, userId: ${userId || 'N/A'}`);
        return null;
      }
      // Convert Firestore data (with Timestamps) to application data (with Dates)
      const foundItem = this.fromFirestore({ id: docSnap.id, ...docSnap.data() });
      logger.info(`Document found successfully in ${this.collectionName}, documentId: ${id}, userId: ${userId || 'N/A'}`);
      return foundItem;
    } catch (error: any) {
      logger.error(`Error finding document ${id} in ${this.collectionName}, userId: ${userId || 'N/A'}: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }

  async findAll(userId?: string): Promise<T[]> {
    logger.info(`FirestoreRepository.findAll called for collection: ${this.collectionName}, userId: ${userId || 'N/A'}`);
    try {
      const collectionRef = this.getCollection(userId);
      const snapshot = await collectionRef.orderBy('createdAt', 'desc').get(); // Assuming createdAt exists for ordering
      const items = snapshot.docs.map(doc => this.fromFirestore({ id: doc.id, ...doc.data() }) as T);
      logger.info(`Found ${items.length} documents in ${this.collectionName}, userId: ${userId || 'N/A'}`);
      return items;
    } catch (error: any) {
      logger.error(`Error finding all documents in ${this.collectionName}, userId: ${userId || 'N/A'}: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }

  async update(id: string, item: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>, userId?: string): Promise<T | null> {
    logger.info(`FirestoreRepository.update called for collection: ${this.collectionName}, documentId: ${id}, userId: ${userId || 'N/A'}`);
    try {
      const docRef = this.getDocument(id, userId);
      const dataToUpdate = this.toFirestore({
        ...item,
        updatedAt: new Date(), // Set by application logic, converted by toFirestore
      } as Partial<T>); // Item is already partial

      await docRef.update(dataToUpdate);
      const updatedDocSnap = await docRef.get();
      if (!updatedDocSnap.exists) {
        // This case should ideally not be reached if update is on an existing doc, but good for robustness
        logger.warn(`Document ${id} not found after update attempt in ${this.collectionName}, userId: ${userId || 'N/A'}`);
        return null;
      }
      const updatedItem = this.fromFirestore({ id: updatedDocSnap.id, ...updatedDocSnap.data() });
      logger.info(`Document updated successfully in ${this.collectionName}, documentId: ${id}, userId: ${userId || 'N/A'}`);
      return updatedItem;
    } catch (error: any) {
      logger.error(`Error updating document ${id} in ${this.collectionName}, userId: ${userId || 'N/A'}: ${error.message}`, { stack: error.stack, item });
      throw error;
    }
  }

  async delete(id: string, userId?: string): Promise<boolean> {
    logger.info(`FirestoreRepository.delete called for collection: ${this.collectionName}, documentId: ${id}, userId: ${userId || 'N/A'}`);
    try {
      const docRef = this.getDocument(id, userId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        logger.warn(`Document ${id} not found in ${this.collectionName} for deletion, userId: ${userId || 'N/A'}`);
        return false;
      }
      await docRef.delete();
      logger.info(`Document deleted successfully from ${this.collectionName}, documentId: ${id}, userId: ${userId || 'N/A'}`);
      return true;
    } catch (error: any) {
      logger.error(`Error deleting document ${id} in ${this.collectionName}, userId: ${userId || 'N/A'}: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }
}
