import { pool } from '../config/database';
import { RefreshToken, CreateRefreshTokenDTO } from '../types/refreshToken.types';

export class RefreshTokenRepository {

  // Guardar un nuevo token de refresco en la BD
  async create(data: CreateRefreshTokenDTO): Promise<RefreshToken> {
    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token_hash, expires_at, is_revoked, created_at;
    `;
    const values = [data.user_id, data.token_hash, data.expires_at];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Buscar un token por su hash
  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const query = `
      SELECT id, user_id, token_hash, expires_at, is_revoked, created_at
      FROM refresh_tokens
      WHERE token_hash = $1;
    `;
    const result = await pool.query(query, [tokenHash]);
    return result.rows[0] || null;
  }

  // Revocar un token específico (útil para el logout)
  async revokeToken(tokenHash: string): Promise<boolean> {
    const query = `
      UPDATE refresh_tokens
      SET is_revoked = TRUE
      WHERE token_hash = $1;
    `;
    const result = await pool.query(query, [tokenHash]);
    return (result.rowCount ?? 0) > 0;
  }

  // Revocar todos los tokens de un usuario (por seguridad/cambio de clave)
  async revokeAllUserTokens(userId: string): Promise<void> {
    const query = `
      UPDATE refresh_tokens
      SET is_revoked = TRUE
      WHERE user_id = $1;
    `;
    await pool.query(query, [userId]);
  }
}