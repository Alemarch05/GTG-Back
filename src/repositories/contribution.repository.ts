import { pool } from '../config/database';
import { Contribution, CreateContributionDTO } from '../types/contribution.types';

export class ContributionRepository {
  // Registrar un aporte en custodia virtual ('HELD')
  async create(data: CreateContributionDTO): Promise<Contribution> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN'); // Transacción ACID

      // 1. Insertar el aporte en custodia
      const queryContribution = `
        INSERT INTO contributions (campaign_id, user_id, amount, status)
        VALUES ($1, $2, $3, 'HELD')
        RETURNING *;
      `;
      const resContribution = await client.query(queryContribution, [
        data.campaign_id,
        data.user_id,
        data.amount
      ]);

      // 2. Sumar al acumulado de la campaña con bloqueo pesimista
      const queryUpdateCampaign = `
        UPDATE campaigns 
        SET current_amount = current_amount + $1 
        WHERE id = $2;
      `;
      await client.query(queryUpdateCampaign, [data.amount, data.campaign_id]);

      await client.query('COMMIT');
      return resContribution.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Obtener aportes de una campaña
  async findByCampaignId(campaignId: string): Promise<Contribution[]> {
    const query = `SELECT * FROM contributions WHERE campaign_id = $1 ORDER BY created_at DESC;`;
    const res = await pool.query(query, [campaignId]);
    return res.rows;
  }
}