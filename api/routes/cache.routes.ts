import { Router } from 'express';
import { CacheController } from '../controllers/cache.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CacheStats:
 *       type: object
 *       properties:
 *         totalKeys:
 *           type: number
 *           description: Nombre total de clés en cache
 *         memoryUsage:
 *           type: string
 *           description: Utilisation mémoire Redis
 *         hitRate:
 *           type: number
 *           description: Taux de succès du cache (%)
 *         missRate:
 *           type: number
 *           description: Taux d'échec du cache (%)
 *         totalHits:
 *           type: number
 *           description: Nombre total de hits
 *         totalMisses:
 *           type: number
 *           description: Nombre total de misses
 *     CacheKeyCheck:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           description: Clé de cache
 *         exists:
 *           type: boolean
 *           description: Si la clé existe
 *         ttl:
 *           type: number
 *           nullable: true
 *           description: TTL restant en secondes
 */

/**
 * @swagger
 * /api/cache/stats:
 *   get:
 *     summary: Obtient les statistiques du cache Redis
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Statistiques du cache récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CacheStats'
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 */
router.get('/stats', CacheController.getCacheStats);

/**
 * @swagger
 * /api/cache/clear:
 *   delete:
 *     summary: Vide complètement le cache Redis
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache vidé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 */
router.delete('/clear', authenticate, CacheController.clearCache);

/**
 * @swagger
 * /api/cache/user/{userId}:
 *   delete:
 *     summary: Invalide le cache pour un utilisateur spécifique
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID de l'utilisateur (optionnel, utilise l'utilisateur connecté par défaut)
 *     responses:
 *       200:
 *         description: Cache utilisateur invalidé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedKeys:
 *                       type: number
 *       400:
 *         description: ID utilisateur requis
 *       500:
 *         description: Erreur serveur
 */
router.delete('/user/:userId?', authenticate, CacheController.invalidateUserCache);

/**
 * @swagger
 * /api/cache/project/{projectId}:
 *   delete:
 *     summary: Invalide le cache pour un projet spécifique
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du projet
 *     responses:
 *       200:
 *         description: Cache projet invalidé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedKeys:
 *                       type: number
 *       400:
 *         description: ID projet requis
 *       500:
 *         description: Erreur serveur
 */
router.delete('/project/:projectId', authenticate, CacheController.invalidateProjectCache);

/**
 * @swagger
 * /api/cache/pattern:
 *   delete:
 *     summary: Invalide le cache par pattern
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pattern
 *             properties:
 *               pattern:
 *                 type: string
 *                 description: Pattern de clés à supprimer (ex: "user:123:*")
 *     responses:
 *       200:
 *         description: Cache invalidé par pattern avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedKeys:
 *                       type: number
 *       400:
 *         description: Pattern requis
 *       500:
 *         description: Erreur serveur
 */
router.delete('/pattern', authenticate, CacheController.invalidateCacheByPattern);

/**
 * @swagger
 * /api/cache/key:
 *   get:
 *     summary: Vérifie si une clé existe dans le cache
 *     tags: [Cache]
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clé de cache à vérifier
 *       - in: query
 *         name: prefix
 *         schema:
 *           type: string
 *         required: false
 *         description: Préfixe de la clé
 *     responses:
 *       200:
 *         description: Vérification de clé effectuée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CacheKeyCheck'
 *                 message:
 *                   type: string
 *       400:
 *         description: Clé requise
 *       500:
 *         description: Erreur serveur
 */
router.get('/key', CacheController.checkCacheKey);

/**
 * @swagger
 * /api/cache/ttl:
 *   put:
 *     summary: Met à jour le TTL d'une clé de cache
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - ttl
 *             properties:
 *               key:
 *                 type: string
 *                 description: Clé de cache
 *               ttl:
 *                 type: number
 *                 description: Nouveau TTL en secondes
 *               prefix:
 *                 type: string
 *                 description: Préfixe de la clé
 *     responses:
 *       200:
 *         description: TTL mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     ttl:
 *                       type: number
 *       400:
 *         description: Clé et TTL requis
 *       404:
 *         description: Clé non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/ttl', authenticate, CacheController.updateCacheTTL);

export default router;
