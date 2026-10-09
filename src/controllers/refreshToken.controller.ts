import { Request, Response, NextFunction } from 'express';
import { RefreshTokenService } from '../services/refreshToken.service';

export class RefreshTokenController {
  private refreshTokenService = new RefreshTokenService();

  // Controlador para rotar el Refresh Token y emitir nueva sesión
  rotateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Obtenemos el refresh token ya sea desde cookies seguras o del cuerpo JSON
      const token = req.cookies?.refreshToken || req.body.refreshToken;

      if (!token) {
        return res.status(401).json({ error: 'Refresh Token no provisto en la petición.' });
      }

      const userId = await this.refreshTokenService.validateAndRotate(token);

      return res.status(200).json({
        message: 'Token rotado exitosamente con esquema seguro.',
        userId
      });
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  };

  // Controlador para revocar todas las sesiones del usuario (Cierre de sesión concurrente)
  revokeSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'El ID de usuario es obligatorio.' });
      }

      await this.refreshTokenService.revokeUserSessions(userId);
      return res.status(200).json({ message: 'Todas las sesiones del usuario han sido revocadas correctamente.' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}