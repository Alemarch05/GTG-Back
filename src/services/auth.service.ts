import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';
import { LoginDTO, AuthResponse } from '../types/auth.types';

export class AuthService {
  private userRepository: UserRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async login(credentials: LoginDTO): Promise<any> {
    const { email, password } = credentials;
    if (!email || !password) throw new Error('El correo y la contraseña son obligatorios.');

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) throw new Error('Credenciales inválidas.');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Credenciales inválidas.');

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('CRITICAL ERROR: Variables de entorno JWT no definidas.');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 

    await this.refreshTokenRepository.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }

  async refresh(oldRefreshToken: string): Promise<any> {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('CRITICAL ERROR: Variables de entorno JWT no definidas.');
    }

    const tokenHash = this.hashToken(oldRefreshToken);
    const dbToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!dbToken || dbToken.is_revoked) {
      throw new Error('Refresh token inválido o revocado.');
    }

    try {
      const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET) as any;
      const payload = { id: decoded.id, email: decoded.email, role: decoded.role };

      // Generar nuevo par
      const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
      const newRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

      // Rotación en BD: Revocar el viejo y guardar el nuevo
      await this.refreshTokenRepository.revokeToken(tokenHash);
      
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);
      
      await this.refreshTokenRepository.create({
        user_id: decoded.id,
        token_hash: this.hashToken(newRefreshToken),
        expires_at: newExpiresAt,
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error('Refresh token expirado. Por favor, inicia sesión nuevamente.');
    }
  }

  async logout(refreshToken: string): Promise<boolean> {
    const tokenHash = this.hashToken(refreshToken);
    return await this.refreshTokenRepository.revokeToken(tokenHash);
  }

  async revokeAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllUserTokens(userId);
  }
}