import admin from "firebase-admin";
import {
  CollectionReference,
  DocumentReference,
  Timestamp,
  FieldValue,
} from "firebase-admin/firestore";
import { IRepository } from "./IRepository";
import logger from "../config/logger";

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

/**
 * A generic Firestore repository implementation.
 * @template T The type of the document, must have an 'id' property and optionally 'createdAt', 'updatedAt' as Date.
 */
export class FirestoreRepository<
  T extends { id?: string; createdAt?: Date; updatedAt?: Date }
> implements IRepository<T>
{
  private collectionName: string;
  private userSpecificCollection: boolean;

  /**
   * @param collectionName The name of the Firestore collection.
   * @param userSpecificCollection Whether the collection is nested under users/{userId}/
   */
  constructor(collectionName: string, userSpecificCollection: boolean = false) {
    this.collectionName = collectionName;
    this.userSpecificCollection = userSpecificCollection;
    logger.info(
      `FirestoreRepository initialized for collection: ${collectionName}, userSpecific: ${userSpecificCollection}`
    );
  }

  private getCollection(userId?: string): CollectionReference {
    if (this.userSpecificCollection && userId) {
      // For user-specific collections, use the path: users/{userId}/{collectionName}
      return db.collection(`users/${userId}/${this.collectionName}`);
    }
    // For global collections
    return db.collection(this.collectionName);
  }

  private getDocument(id: string, userId?: string): DocumentReference {
    return this.getCollection(userId).doc(id);
  }

  // Helper to convert Firestore Timestamps in data to Date objects
  private fromFirestore(
    data: admin.firestore.DocumentData | undefined
  ): T | null {
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

  async create(
    item: Omit<T, "id" | "createdAt" | "updatedAt">,
    userId?: string
  ): Promise<T> {
    logger.info(
      `FirestoreRepository.create called for collection: ${
        this.collectionName
      }, userId: ${userId || "N/A"}`
    );
    try {
      const collectionRef = this.getCollection(userId);
      const dataToSave = this.toFirestore({
        ...item,
        createdAt: new Date(), // Set by application logic, converted by toFirestore
        updatedAt: new Date(), // Set by application logic, converted by toFirestore
      } as Partial<T>); // Cast to Partial<T> as id is not yet present

      const docRef = await collectionRef.add(dataToSave);
      // Return the entity with its new ID and converted dates
      const createdItem = {
        id: docRef.id,
        ...this.fromFirestore(dataToSave)!,
        ...item,
      } as T;
      logger.info(
        `Document created successfully in ${
          this.userSpecificCollection && userId
            ? `users/${userId}/${this.collectionName}`
            : this.collectionName
        }, documentId: ${docRef.id}`
      );
      return createdItem;
    } catch (error: any) {
      logger.error(
        `Error creating document in ${
          this.userSpecificCollection && userId
            ? `users/${userId}/${this.collectionName}`
            : this.collectionName
        }: ${error.message}`,
        { stack: error.stack, item }
      );
      throw error;
    }
  }

  async findById(id: string, userId?: string): Promise<T | null> {
    const collectionPath =
      this.userSpecificCollection && userId
        ? `users/${userId}/${this.collectionName}`
        : this.collectionName;
    logger.info(
      `FirestoreRepository.findById called for collection: ${collectionPath}, documentId: ${id}, userId: ${
        userId || "N/A"
      }`
    );
    try {
      const docRef = this.getDocument(id, userId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        logger.warn(
          `Document not found in ${collectionPath}, documentId: ${id}, userId: ${
            userId || "N/A"
          }`
        );
        return null;
      }
      // Convert Firestore data (with Timestamps) to application data (with Dates)
      const foundItem = this.fromFirestore({
        id: docSnap.id,
        ...docSnap.data(),
      });
      logger.info(
        `Document found successfully in ${collectionPath}, documentId: ${id}, userId: ${
          userId || "N/A"
        }`
      );
      return foundItem;
    } catch (error: any) {
      logger.error(
        `Error finding document ${id} in ${collectionPath}, userId: ${
          userId || "N/A"
        }: ${error.message}`,
        { stack: error.stack }
      );
      throw error;
    }
  }

  async findAll(userId?: string): Promise<T[]> {
    const collectionPath =
      this.userSpecificCollection && userId
        ? `users/${userId}/${this.collectionName}`
        : this.collectionName;
    logger.info(
      `FirestoreRepository.findAll called for collection: ${collectionPath}, userId: ${
        userId || "N/A"
      }`
    );
    try {
      const collectionRef = this.getCollection(userId);
      const snapshot = await collectionRef.orderBy("createdAt", "desc").get(); // Assuming createdAt exists for ordering
      const items = snapshot.docs.map(
        (doc) => this.fromFirestore({ id: doc.id, ...doc.data() }) as T
      );
      logger.info(`Found ${items.length} documents in ${collectionPath}`);
      return items;
    } catch (error: any) {
      logger.error(
        `Error finding all documents in ${collectionPath}: ${error.message}`,
        { stack: error.stack }
      );
      throw error;
    }
  }

  async update(
    id: string,
    item: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>,
    userId?: string
  ): Promise<T | null> {
    const collectionPath =
      this.userSpecificCollection && userId
        ? `users/${userId}/${this.collectionName}`
        : this.collectionName;
    logger.info(
      `FirestoreRepository.update called for collection: ${collectionPath}, documentId: ${id}, userId: ${
        userId || "N/A"
      }`
    );
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
        logger.warn(
          `Document ${id} not found after update attempt in ${collectionPath}`
        );
        return null;
      }
      const updatedItem = this.fromFirestore({
        id: updatedDocSnap.id,
        ...updatedDocSnap.data(),
      });
      logger.info(
        `Document updated successfully in ${collectionPath}, documentId: ${id}`
      );
      return updatedItem;
    } catch (error: any) {
      logger.error(
        `Error updating document ${id} in ${collectionPath}: ${error.message}`,
        { stack: error.stack, item }
      );
      throw error;
    }
  }

  async delete(id: string, userId?: string): Promise<boolean> {
    const collectionPath =
      this.userSpecificCollection && userId
        ? `users/${userId}/${this.collectionName}`
        : this.collectionName;
    logger.info(
      `FirestoreRepository.delete called for collection: ${collectionPath}, documentId: ${id}, userId: ${
        userId || "N/A"
      }`
    );
    try {
      const docRef = this.getDocument(id, userId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        logger.warn(
          `Document ${id} not found in ${collectionPath} for deletion`
        );
        return false;
      }
      await docRef.delete();
      logger.info(
        `Document deleted successfully from ${collectionPath}, documentId: ${id}`
      );
      return true;
    } catch (error: any) {
      logger.error(
        `Error deleting document ${id} in ${collectionPath}: ${error.message}`,
        { stack: error.stack }
      );
      throw error;
    }
  }
}
