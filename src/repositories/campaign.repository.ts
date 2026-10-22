import { pool } from '../config/database';

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
}