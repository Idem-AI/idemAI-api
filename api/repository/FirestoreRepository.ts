import admin from 'firebase-admin';
import { CollectionReference, DocumentReference, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { IRepository } from './IRepository';

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
    try {
      const collectionRef = this.getCollection(userId);
      const dataToSave = this.toFirestore({
        ...item,
        createdAt: new Date(), // Set by application logic, converted by toFirestore
        updatedAt: new Date(), // Set by application logic, converted by toFirestore
      } as Partial<T>); // Cast to Partial<T> as id is not yet present

      const docRef = await collectionRef.add(dataToSave);
      // Return the entity with its new ID and converted dates
      return { id: docRef.id, ...this.fromFirestore(dataToSave)!, ...item } as T; // Merge to ensure all original fields are present
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async findById(id: string, userId?: string): Promise<T | null> {
    try {
      const docRef = this.getDocument(id, userId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return null;
      }
      // Convert Firestore data (with Timestamps) to application data (with Dates)
      return this.fromFirestore({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
      console.error(`Error finding document ${id} in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async findAll(userId?: string): Promise<T[]> {
    try {
      const collectionRef = this.getCollection(userId);
      const snapshot = await collectionRef.orderBy('createdAt', 'desc').get(); // Assuming createdAt exists for ordering
      return snapshot.docs.map(doc => this.fromFirestore({ id: doc.id, ...doc.data() }) as T);
    } catch (error) {
      console.error(`Error finding all documents in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async update(id: string, item: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>, userId?: string): Promise<T | null> {
    try {
      const docRef = this.getDocument(id, userId);
      const dataToUpdate = this.toFirestore({
        ...item,
        updatedAt: new Date(), // Set by application logic, converted by toFirestore
      } as Partial<T>); // Item is already partial

      await docRef.update(dataToUpdate);
      const updatedDocSnap = await docRef.get();
      if (!updatedDocSnap.exists) {
        return null;
      }
      return this.fromFirestore({ id: updatedDocSnap.id, ...updatedDocSnap.data() });
    } catch (error) {
      console.error(`Error updating document ${id} in ${this.collectionName}:`, error);
      throw error;
    }
  }

  async delete(id: string, userId?: string): Promise<boolean> {
    try {
      const docRef = this.getDocument(id, userId);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        console.log(`Document ${id} not found in ${this.collectionName} for deletion.`);
        return false;
      }
      await docRef.delete();
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id} in ${this.collectionName}:`, error);
      throw error;
    }
  }
}
