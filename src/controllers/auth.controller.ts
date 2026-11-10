import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, error: 'Refresh token es requerido.' });
        return;
      }
      const result = await authService.refresh(refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(403).json({ success: false, error: error.message });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente.' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async revokeAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (userId) {
        await authService.revokeAll(userId);
      }
      res.status(200).json({ success: true, message: 'Todas las sesiones fueron revocadas.' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}