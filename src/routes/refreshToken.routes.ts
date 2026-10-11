import { Router } from 'express';
import { RefreshTokenController } from '../controllers/refreshToken.controller';

const router = Router();
const refreshTokenController = new RefreshTokenController();

// Ruta para Logout (revocar el token actual)
router.post('/logout', refreshTokenController.logout);

// Ruta para revocar todas las sesiones del usuario
router.post('/revoke-all', refreshTokenController.revokeAllSessions);

export default router;