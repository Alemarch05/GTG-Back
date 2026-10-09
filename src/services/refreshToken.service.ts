import { RefreshTokenRepository } from '../repositories/refreshToken.repository';

export class RefreshTokenService {
  private refreshTokenRepo = new RefreshTokenRepository();

  // Guardar un nuevo refresh token con una duración configurable (ej. 7 días)
  async saveToken(userId: number, tokenHash: string, expiresInDays: number = 7) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    return await this.refreshTokenRepo.create(userId, tokenHash, expiresAt);
  }

  // Validar vigencia y aplicar rotación de Refresh Token
  async validateAndRotate(tokenHash: string): Promise<number> {
    const storedToken = await this.refreshTokenRepo.findByTokenHash(tokenHash);
    
    if (!storedToken) {
      throw new Error('Refresh Token inválido o ya fue revocado.');
    }

    // Verificar si el token ya expiró por fecha
    if (new Date() > new Date(storedToken.expires_at)) {
      await this.refreshTokenRepo.revokeToken(storedToken.id);
      throw new Error('Refresh Token expirado.');
    }

    // Rotación: Invalidamos el token actual para que no pueda ser reutilizado
    await this.refreshTokenRepo.revokeToken(storedToken.id);

    return storedToken.user_id;
  }

  // Revocar todas las sesiones de un usuario (Control de sesiones concurrentes)
  async revokeUserSessions(userId: number): Promise<void> {
    await this.refreshTokenRepo.revokeAllUserTokens(userId);
  }
}
