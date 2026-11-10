import { Router } from 'express';
import { RefreshTokenController } from '../controllers/refreshToken.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const refreshTokenController = new RefreshTokenController();

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión revocando el refresh token actual
 *     tags: [RefreshTokens]
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
 *     summary: Revocar todas las sesiones del usuario autenticado
 *     tags: [RefreshTokens]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las sesiones del usuario han sido revocadas
 *       401:
 *         description: No autorizado (Token faltante o inválido)
 */
// Protegemos la ruta con 'authenticateToken' para que inyecte req.user y eliminemos el userId inseguro del body
router.post('/revoke-all', authenticateToken, (req, res) => refreshTokenController.revokeAllSessions(req, res));

export default router;