import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión revocando el token actual
 *     tags: [RefreshTokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.post('/logout', authenticateToken, (req, res) => authController.logout(req, res));

/**
 * @openapi
 * /auth/revoke-all:
 *   post:
 *     summary: Revocar todas las sesiones del usuario
 *     tags: [RefreshTokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesiones revocadas
 */
router.post('/revoke-all', authenticateToken, (req, res) => authController.revokeAll(req, res));

export default router;