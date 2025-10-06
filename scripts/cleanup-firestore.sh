#!/bin/bash

# Script de nettoyage des fichiers Firestore obsolètes
# À exécuter après migration complète vers MongoDB

echo "🧹 Nettoyage des fichiers Firestore obsolètes..."

# Backup avant suppression
BACKUP_DIR="./backup-firestore-$(date +%Y%m%d-%H%M%S)"
echo "📦 Création du backup dans: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Backup du FirestoreRepository
if [ -f "api/repository/FirestoreRepository.ts" ]; then
    cp "api/repository/FirestoreRepository.ts" "$BACKUP_DIR/"
    echo "✅ Backup de FirestoreRepository.ts"
fi

# Backup de l'ancien MongoDBRepository
if [ -f "api/repository/MongoDBRepository.ts" ]; then
    cp "api/repository/MongoDBRepository.ts" "$BACKUP_DIR/"
    echo "✅ Backup de MongoDBRepository.ts (ancienne version)"
fi

echo ""
echo "⚠️  Les fichiers suivants seront supprimés:"
echo "   - api/repository/FirestoreRepository.ts"
echo "   - api/repository/MongoDBRepository.ts (ancienne version)"
echo ""
echo "📝 Note: MongoDBRepository.v2.ts sera renommé en MongoDBRepository.ts"
echo ""

read -p "Continuer? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

# Suppression des fichiers Firestore
if [ -f "api/repository/FirestoreRepository.ts" ]; then
    rm "api/repository/FirestoreRepository.ts"
    echo "🗑️  Supprimé: FirestoreRepository.ts"
fi

# Suppression de l'ancienne version MongoDB
if [ -f "api/repository/MongoDBRepository.ts" ]; then
    rm "api/repository/MongoDBRepository.ts"
    echo "🗑️  Supprimé: MongoDBRepository.ts (ancienne version)"
fi

# Renommer la nouvelle version
if [ -f "api/repository/MongoDBRepository.v2.ts" ]; then
    mv "api/repository/MongoDBRepository.v2.ts" "api/repository/MongoDBRepository.ts"
    echo "✅ Renommé: MongoDBRepository.v2.ts → MongoDBRepository.ts"
fi

echo ""
echo "✅ Nettoyage terminé!"
echo "📦 Backup disponible dans: $BACKUP_DIR"
echo ""
echo "🔄 Prochaines étapes:"
echo "   1. Vérifier que l'application fonctionne correctement"
echo "   2. Supprimer firebase-admin du package.json si plus utilisé pour l'auth"
echo "   3. Exécuter: npm install"
echo "   4. Tester tous les endpoints API"
echo "   5. Supprimer le backup si tout fonctionne: rm -rf $BACKUP_DIR"
