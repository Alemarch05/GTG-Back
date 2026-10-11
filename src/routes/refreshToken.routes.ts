import { Router } from 'express';
import { RefreshTokenController } from '../controllers/refreshToken.controller';

const router = Router();
const refreshTokenController = new RefreshTokenController();

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión revocando el refresh token actual
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       400:
 *         description: El token de refresco es requerido
 */
router.post('/logout', (req, res) => refreshTokenController.logout(req, res));

/**
 * @openapi
 * /auth/revoke-all:
 *   post:
 *     summary: Revocar todas las sesiones del usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Todas las sesiones del usuario han sido revocadas
 *       400:
 *         description: ID de usuario requerido
 */
router.post('/revoke-all', (req, res) => refreshTokenController.revokeAllSessions(req, res));

export default router;