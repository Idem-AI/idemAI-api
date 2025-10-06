export enum SGBDType {
  MONGODB = 'mongodb',
  // FIRESTORE = 'firestore', // Deprecated - MongoDB only
}

// MongoDB uniquement - configuration simplifiée
export const activeSGBD: SGBDType = SGBDType.MONGODB;
