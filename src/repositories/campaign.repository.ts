import { pool } from '../config/database'; // o tu conexión a PostgreSQL
import { Campaign } from '../types/campaign.types';

export class CampaignRepository {
  /**
   * Obtiene todas las campañas registradas
   */
  async findAll(): Promise<Campaign[]> {
    const query = `
      SELECT 
        id,
        title,
        description,
        goal_amount,
        current_amount,
        category,
        status,
        creator_id,
        image_url,
        created_at,
        updated_at
      FROM campaigns
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query<Campaign>(query);
    return rows;
  }

  /**
   * Obtiene el detalle de una campaña por su UUID
   */
  async findById(id: string): Promise<Campaign | null> {
    const query = `
      SELECT 
        id,
        title,
        description,
        goal_amount,
        current_amount,
        category,
        status,
        creator_id,
        image_url,
        created_at,
        updated_at
      FROM campaigns
      WHERE id = $1;
    `;
    const { rows } = await pool.query<Campaign>(query, [id]);
    return rows[0] || null;
  }
}