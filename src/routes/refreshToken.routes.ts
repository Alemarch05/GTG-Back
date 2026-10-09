import { Router } from 'express';
import { RefreshTokenController } from '../controllers/refreshToken.controller';

const router = Router();
const controller = new RefreshTokenController();

/**
 * @route POST /api/auth/refresh-token
 * @desc Valida y rota el refresh token para emitir una nueva sesión
 */
router.post('/refresh-token', controller.rotateToken);

/**
 * @route POST /api/auth/revoke-sessions
 * @desc Revoca todas las sesiones concurrentes de un usuario específico
 */
router.post('/revoke-sessions', controller.revokeSessions);

export default router;