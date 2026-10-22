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

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        await authService.logout(token);
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