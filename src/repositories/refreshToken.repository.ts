import { pool } from '../config/database';

export class RefreshTokenRepository {
  // Crear un nuevo Refresh Token en la base de datos
  async create(userId: number, tokenHash: string, expiresAt: Date): Promise<any> {
    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token_hash, expires_at, is_revoked, created_at;
    `;
    const values = [userId, tokenHash, expiresAt];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Buscar un token por su hash que no esté revocado
  async findByTokenHash(tokenHash: string): Promise<any> {
    const query = `
      SELECT * FROM refresh_tokens 
      WHERE token_hash = $1 AND is_revoked = FALSE;
    `;
    const result = await pool.query(query, [tokenHash]);
    return result.rows[0];
  }

  // Revocar un token específico (para la rotación)
  async revokeToken(id: number): Promise<void> {
    const query = `
      UPDATE refresh_tokens 
      SET is_revoked = TRUE 
      WHERE id = $1;
    `;
    await pool.query(query, [id]);
  }

  // Revocar todas las sesiones concurrentes de un usuario
  async revokeAllUserTokens(userId: number): Promise<void> {
    const query = `
      UPDATE refresh_tokens 
      SET is_revoked = TRUE 
      WHERE user_id = $1;
    `;
    await pool.query(query, [userId]);
  }
}