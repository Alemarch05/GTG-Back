import crypto from 'crypto';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';
import { RefreshToken } from '../types/refreshToken.types';

export class RefreshTokenService {
  private refreshTokenRepository = new RefreshTokenRepository();

  // Generar un token opaco y seguro, guardando su hash en la base de datos
  async generateRefreshToken(userId: string): Promise<string> {
    // 1. Generar token aleatorio plano que se le entregará al cliente
    const rawToken = crypto.randomBytes(40).toString('hex');

    // 2. Hashear el token por seguridad (nunca guardamos tokens planos en BD)
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    // 3. Definir tiempo de expiración (por ejemplo, 7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 4. Guardar en la base de datos
    await this.refreshTokenRepository.create({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    // Retornamos el token plano (este es el único momento en que se ve)
    return rawToken;
  }

  // Validar si un refresh token es válido y activo
  async validateRefreshToken(rawToken: string): Promise<RefreshToken | null> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      return null;
    }

    // Verificar si ya fue revocado
    if (storedToken.is_revoked) {
      return null;
    }

    // Verificar si ya expiró
    if (new Date() > new Date(storedToken.expires_at)) {
      return null;
    }

    return storedToken;
  }

  // Revocar un token específico (Logout)
  async revokeToken(rawToken: string): Promise<boolean> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    return await this.refreshTokenRepository.revokeToken(tokenHash);
  }

  // Revocar todas las sesiones de un usuario
  async revokeUserSessions(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllUserTokens(userId);
  }
}