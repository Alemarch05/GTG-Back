import { Request, Response } from 'express';
import { RefreshTokenService } from '../services/refreshToken.service';

export class RefreshTokenController {
  private refreshTokenService = new RefreshTokenService();

  // Endpoint para revocar un token (Logout)
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'El token de refresco es requerido' });
        return;
      }

      await this.refreshTokenService.revokeToken(refreshToken);
      res.status(200).json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      res.status(500).json({ error: 'Error interno del servidor al cerrar sesión' });
    }
  };

  // Endpoint opcional para revocar todas las sesiones del usuario
  revokeAllSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.body.userId; 

      if (!userId) {
        res.status(400).json({ error: 'ID de usuario requerido' });
        return;
      }

      await this.refreshTokenService.revokeUserSessions(userId);
      res.status(200).json({ message: 'Todas las sesiones del usuario han sido revocadas' });
    } catch (error) {
      console.error('Error al revocar sesiones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
}