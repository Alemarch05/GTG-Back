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

  if (!process.env.JWT_SECRET) {
    throw new Error('CRITICAL ERROR: La variable de entorno JWT_SECRET no está definida.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; email: string; role: string };
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token inválido o expirado.' });
  }
}