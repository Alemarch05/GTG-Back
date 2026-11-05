import { pool } from '../config/database';
import { UpdateCampaignDTO } from '../types/campaign.types';

export interface CampaignData {
  userId: string;
  title: string;
  description: string;
  targetAmount: number;
  expiresAt: string;
}

export class CampaignRepository {
  async create(data: CampaignData) {
    const query = `
      INSERT INTO campaigns (user_id, title, description, target_amount, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      data.userId,
      data.title,
      data.description,
      data.targetAmount,
      data.expiresAt
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async findAll() {
    const query = `
      SELECT * FROM campaigns 
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async findById(id: string) {
    const query = `
      SELECT * FROM campaigns 
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
  
  async update(id: string, data: UpdateCampaignDTO & { status?: string }) {
    const query = `
    UPDATE campaigns 
    SET title = COALESCE($1, title),
    description = COALESCE($2, description),
    target_amount = COALESCE($3, target_amount),
    expires_at = COALESCE($4, expires_at),
    status = COALESCE($5, status)
    WHERE id = $6 
    RETURNING *;
    `;
    
    const values = [data.title, data.description, data.target_amount, data.expires_at, data.status, id];
    const res = await pool.query(query, values);
    return res.rows[0];
  }

  async delete(id: string) {
    await pool.query(`DELETE FROM campaigns WHERE id = $1;`, [id]);
  }
}