import admin from 'firebase-admin';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../api/schemas/user.schema';
import { Project } from '../api/schemas/project.schema';
import { Archetype } from '../api/schemas/archetype.schema';

dotenv.config();

/**
 * Script de migration des données Firestore vers MongoDB
 * 
 * Usage:
 *   ts-node scripts/migrate-firestore-to-mongodb.ts
 * 
 * Options:
 *   --dry-run : Simule la migration sans écrire dans MongoDB
 *   --collection=<name> : Migre uniquement une collection spécifique
 *   --batch-size=<number> : Taille des lots (défaut: 100)
 */

interface MigrationStats {
  collection: string;
  total: number;
  migrated: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

class FirestoreToMongoDBMigration {
  private dryRun: boolean = false;
  private batchSize: number = 100;
  private targetCollection?: string;
  private stats: Map<string, MigrationStats> = new Map();

  constructor() {
    this.parseArgs();
  }

  private parseArgs(): void {
    const args = process.argv.slice(2);
    
    for (const arg of args) {
      if (arg === '--dry-run') {
        this.dryRun = true;
      } else if (arg.startsWith('--collection=')) {
        this.targetCollection = arg.split('=')[1];
      } else if (arg.startsWith('--batch-size=')) {
        this.batchSize = parseInt(arg.split('=')[1], 10);
      }
    }
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initialisation de la migration Firestore → MongoDB\n');
    
    if (this.dryRun) {
      console.log('⚠️  MODE DRY-RUN: Aucune donnée ne sera écrite dans MongoDB\n');
    }

    // Initialiser Firebase Admin
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    }

    console.log('✅ Firebase Admin initialisé');

    // Connecter à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lexis-api';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connecté\n');
  }

  async migrateCollection(
    collectionName: string,
    Model: mongoose.Model<any>,
    transformFn?: (doc: any) => any
  ): Promise<void> {
    console.log(`📦 Migration de la collection: ${collectionName}`);
    
    const stats: MigrationStats = {
      collection: collectionName,
      total: 0,
      migrated: 0,
      failed: 0,
      errors: []
    };

    try {
      const db = admin.firestore();
      const snapshot = await db.collection(collectionName).get();
      
      stats.total = snapshot.size;
      console.log(`   Total de documents: ${stats.total}`);

      if (snapshot.empty) {
        console.log('   ⚠️  Collection vide\n');
        this.stats.set(collectionName, stats);
        return;
      }

      // Traiter par lots
      const batches: any[][] = [];
      let currentBatch: any[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const transformed = transformFn ? transformFn({ id: doc.id, ...data }) : { _id: doc.id, ...data };
        
        currentBatch.push(transformed);
        
        if (currentBatch.length >= this.batchSize) {
          batches.push([...currentBatch]);
          currentBatch = [];
        }
      });

      if (currentBatch.length > 0) {
        batches.push(currentBatch);
      }

      console.log(`   Traitement en ${batches.length} lot(s) de ${this.batchSize} max`);

      // Migrer chaque lot
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`   Lot ${i + 1}/${batches.length} (${batch.length} documents)...`);

        for (const doc of batch) {
          try {
            if (!this.dryRun) {
              // Utiliser updateOne avec upsert pour éviter les doublons
              await Model.updateOne(
                { _id: doc._id },
                { $set: doc },
                { upsert: true }
              );
            }
            stats.migrated++;
          } catch (error) {
            stats.failed++;
            stats.errors.push({
              id: doc._id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error(`   ❌ Erreur pour document ${doc._id}:`, error);
          }
        }
      }

      console.log(`   ✅ Migration terminée: ${stats.migrated}/${stats.total} réussis\n`);
      
    } catch (error) {
      console.error(`   ❌ Erreur lors de la migration de ${collectionName}:`, error);
    }

    this.stats.set(collectionName, stats);
  }

  private transformUser(doc: any): any {
    // Convertir les dates Firestore dans refreshTokens
    const refreshTokens = doc.refreshTokens?.map((token: any) => ({
      token: token.token,
      expiresAt: token.expiresAt?._seconds 
        ? new Date(token.expiresAt._seconds * 1000) 
        : (token.expiresAt?.toDate?.() || token.expiresAt),
      createdAt: token.createdAt?._seconds 
        ? new Date(token.createdAt._seconds * 1000) 
        : (token.createdAt?.toDate?.() || token.createdAt),
      lastUsed: token.lastUsed?._seconds 
        ? new Date(token.lastUsed._seconds * 1000) 
        : (token.lastUsed?.toDate?.() || token.lastUsed),
      deviceInfo: token.deviceInfo,
      ipAddress: token.ipAddress
    })) || [];

    // Convertir les dates dans githubIntegration
    const githubIntegration = doc.githubIntegration ? {
      ...doc.githubIntegration,
      connectedAt: doc.githubIntegration.connectedAt?._seconds
        ? new Date(doc.githubIntegration.connectedAt._seconds * 1000)
        : (doc.githubIntegration.connectedAt?.toDate?.() || doc.githubIntegration.connectedAt),
      lastUsed: doc.githubIntegration.lastUsed?._seconds
        ? new Date(doc.githubIntegration.lastUsed._seconds * 1000)
        : (doc.githubIntegration.lastUsed?.toDate?.() || doc.githubIntegration.lastUsed)
    } : undefined;

    // Convertir les dates dans policyAcceptance
    const policyAcceptance = doc.policyAcceptance ? {
      ...doc.policyAcceptance,
      lastAcceptedAt: doc.policyAcceptance.lastAcceptedAt?._seconds
        ? new Date(doc.policyAcceptance.lastAcceptedAt._seconds * 1000)
        : (doc.policyAcceptance.lastAcceptedAt?.toDate?.() || doc.policyAcceptance.lastAcceptedAt)
    } : undefined;

    return {
      _id: doc.id, // Utiliser l'UID Firebase comme _id MongoDB
      email: doc.email,
      displayName: doc.displayName,
      photoURL: doc.photoURL,
      subscription: doc.subscription || 'free',
      createdAt: doc.createdAt?.toDate?.() || new Date(),
      lastLogin: doc.lastLogin?.toDate?.() || new Date(),
      quota: doc.quota || {},
      roles: doc.roles || ['user'],
      githubIntegration,
      refreshTokens,
      policyAcceptance,
      updatedAt: doc.updatedAt?.toDate?.() || new Date()
    };
  }

  private transformProject(doc: any): any {
    // Valider que l'ID est un string (pas un objet)
    const projectId = typeof doc.id === 'string' ? doc.id : doc.id?.id;
    if (!projectId || typeof projectId !== 'string') {
      throw new Error(`Invalid project ID: ${JSON.stringify(doc.id)}`);
    }

    // Convertir TOUS les champs objets en strings (code)
    const type = doc.type?.code || doc.type;
    const targets = doc.targets?.code || doc.targets;
    const scope = doc.scope?.code || doc.scope;
    const teamSize = doc.teamSize?.code || doc.teamSize;
    const budgetIntervals = doc.budgetIntervals?.code || doc.budgetIntervals;
    
    // Convertir policyAcceptance avec dates Firestore
    const policyAcceptance = doc.policyAcceptance ? {
      ...doc.policyAcceptance,
      acceptedAt: doc.policyAcceptance.acceptedAt?._seconds
        ? new Date(doc.policyAcceptance.acceptedAt._seconds * 1000)
        : (doc.policyAcceptance.acceptedAt?.toDate?.() || doc.policyAcceptance.acceptedAt)
    } : undefined;

    // Convertir activeChatMessages avec dates Firestore
    const activeChatMessages = doc.activeChatMessages?.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp?._seconds
        ? new Date(msg.timestamp._seconds * 1000)
        : (msg.timestamp?.toDate?.() || msg.timestamp || new Date())
    })) || [];

    // Nettoyer selectedPhases - filtrer les objets invalides (références circulaires)
    const selectedPhases = Array.isArray(doc.selectedPhases) 
      ? doc.selectedPhases.filter((phase: any) => typeof phase === 'string' || !phase.id)
      : [];

    return {
      _id: projectId,
      name: doc.name,
      description: doc.description,
      type,
      constraints: doc.constraints || [],
      teamSize,
      scope,
      budgetIntervals,
      targets,
      userId: doc.userId,
      selectedPhases,
      analysisResultModel: doc.analysisResultModel || {},
      deployments: doc.deployments || [],
      activeChatMessages,
      policyAcceptance,
      additionalInfos: doc.additionalInfos || {},
      createdAt: doc.createdAt?.toDate?.() || new Date(),
      updatedAt: doc.updatedAt?.toDate?.() || new Date()
    };
  }

  private transformArchetype(doc: any): any {
    return {
      _id: doc.id,
      name: doc.name,
      description: doc.description,
      provider: doc.provider,
      category: doc.category,
      tags: doc.tags || [],
      icon: doc.icon,
      terraformVariables: doc.terraformVariables || [],
      estimatedCost: doc.estimatedCost,
      complexity: doc.complexity || 'intermediate',
      userId: doc.userId,
      createdAt: doc.createdAt?.toDate?.() || new Date(),
      updatedAt: doc.updatedAt?.toDate?.() || new Date()
    };
  }

  async migrateUserProjects(): Promise<void> {
    console.log(`📦 Migration des projets utilisateurs (sous-collections)`);
    
    const stats: MigrationStats = {
      collection: 'user-projects',
      total: 0,
      migrated: 0,
      failed: 0,
      errors: []
    };

    try {
      const db = admin.firestore();
      
      // Récupérer tous les utilisateurs
      const usersSnapshot = await db.collection('users').get();
      console.log(`   Trouvé ${usersSnapshot.size} utilisateurs`);

      // Pour chaque utilisateur, récupérer ses projets
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const projectsSnapshot = await db.collection('users').doc(userId).collection('projects').get();
        
        if (projectsSnapshot.empty) {
          continue;
        }

        console.log(`   Utilisateur ${userId}: ${projectsSnapshot.size} projet(s)`);
        stats.total += projectsSnapshot.size;

        // Migrer chaque projet
        for (const projectDoc of projectsSnapshot.docs) {
          try {
            const data = projectDoc.data();
            const transformed = this.transformProject({ id: projectDoc.id, ...data });

            if (!this.dryRun) {
              await Project.updateOne(
                { _id: transformed._id },
                { $set: transformed },
                { upsert: true }
              );
            }
            stats.migrated++;
          } catch (error) {
            stats.failed++;
            stats.errors.push({
              id: projectDoc.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            console.error(`   ❌ Erreur pour projet ${projectDoc.id}:`, error);
          }
        }
      }

      console.log(`   ✅ Migration terminée: ${stats.migrated}/${stats.total} projets migrés\n`);
      
    } catch (error) {
      console.error(`   ❌ Erreur lors de la migration des projets utilisateurs:`, error);
    }

    this.stats.set('user-projects', stats);
  }

  async run(): Promise<void> {
    try {
      await this.initialize();

      const collections = [
        { name: 'users', model: User, transform: this.transformUser.bind(this) },
        { name: 'archetypes', model: Archetype, transform: this.transformArchetype.bind(this) }
      ];

      // Filtrer par collection si spécifié
      if (this.targetCollection) {
        if (this.targetCollection === 'projects') {
          // Migration spéciale pour les projets (sous-collections)
          await this.migrateUserProjects();
        } else {
          const toMigrate = collections.filter(c => c.name === this.targetCollection);
          if (toMigrate.length === 0) {
            console.error(`❌ Collection "${this.targetCollection}" non trouvée`);
            return;
          }
          for (const { name, model, transform } of toMigrate) {
            await this.migrateCollection(name, model, transform);
          }
        }
      } else {
        // Migrer toutes les collections
        for (const { name, model, transform } of collections) {
          await this.migrateCollection(name, model, transform);
        }
        // Migrer les projets (sous-collections)
        await this.migrateUserProjects();
      }

      // Afficher le résumé
      this.printSummary();

    } catch (error) {
      console.error('❌ Erreur fatale lors de la migration:', error);
      throw error;
    } finally {
      await mongoose.disconnect();
      console.log('\n✅ Déconnexion de MongoDB');
    }
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('='.repeat(60) + '\n');

    let totalDocs = 0;
    let totalMigrated = 0;
    let totalFailed = 0;

    this.stats.forEach((stats, collection) => {
      console.log(`📦 ${collection}:`);
      console.log(`   Total: ${stats.total}`);
      console.log(`   Migrés: ${stats.migrated} ✅`);
      console.log(`   Échoués: ${stats.failed} ❌`);
      
      if (stats.errors.length > 0) {
        console.log(`   Erreurs:`);
        stats.errors.slice(0, 5).forEach(err => {
          console.log(`     - ${err.id}: ${err.error}`);
        });
        if (stats.errors.length > 5) {
          console.log(`     ... et ${stats.errors.length - 5} autres erreurs`);
        }
      }
      console.log('');

      totalDocs += stats.total;
      totalMigrated += stats.migrated;
      totalFailed += stats.failed;
    });

    console.log('='.repeat(60));
    console.log(`TOTAL: ${totalMigrated}/${totalDocs} documents migrés`);
    if (totalFailed > 0) {
      console.log(`⚠️  ${totalFailed} échecs`);
    }
    console.log('='.repeat(60) + '\n');

    if (this.dryRun) {
      console.log('ℹ️  Mode dry-run: Aucune donnée n\'a été écrite dans MongoDB');
      console.log('   Relancez sans --dry-run pour effectuer la migration réelle\n');
    }
  }
}

// Exécuter la migration
const migration = new FirestoreToMongoDBMigration();
migration.run()
  .then(() => {
    console.log('✅ Migration terminée avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration échouée:', error);
    process.exit(1);
  });
