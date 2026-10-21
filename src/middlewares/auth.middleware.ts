import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';

const refreshTokenRepo = new RefreshTokenRepository();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret_key';
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const dbToken = await refreshTokenRepo.findByTokenHash(tokenHash);

    if (!dbToken || dbToken.is_revoked) {
      return res.status(401).json({ success: false, message: 'Token revocado o sesión finalizada.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token inválido o expirado.' });
  }
}