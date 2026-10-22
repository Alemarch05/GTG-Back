import { pool } from '../config/database';
import { Contribution, CreateContributionDTO } from '../types/contribution.types';

export class ContributionRepository {
  // Registrar un aporte en custodia virtual ('HELD') y aplicar reglas All-or-Nothing
  async create(data: CreateContributionDTO): Promise<Contribution> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN'); // Transacción ACID

      // 1. Bloqueo pesimista: Leer la campaña y bloquearla para otros procesos
      const queryCampaign = `
        SELECT current_amount, target_amount, status, expires_at 
        FROM campaigns 
        WHERE id = $1 FOR UPDATE;
      `;
      const campaignRes = await client.query(queryCampaign, [data.campaign_id]);
      
      if (campaignRes.rows.length === 0) {
        throw new Error('Campaña no encontrada');
      }
      const campaign = campaignRes.rows[0];

      // 2. Validaciones de Negocio
      if (campaign.status !== 'ACTIVE') {
        throw new Error('La campaña no está activa para recibir aportes');
      }
      if (new Date(campaign.expires_at) < new Date()) {
        throw new Error('La campaña ya ha expirado');
      }

      // 3. Insertar el aporte en custodia
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

      // 4. Calcular el nuevo monto de la campaña
      const newAmount = parseFloat(campaign.current_amount) + data.amount;
      let newCampaignStatus = campaign.status;

      // 5. Lógica All-or-Nothing: Si llega a la meta, la campaña es exitosa
      if (newAmount >= parseFloat(campaign.target_amount)) {
        newCampaignStatus = 'SUCCESSFUL';
      }

      // 6. Actualizar la campaña
      const queryUpdateCampaign = `
        UPDATE campaigns 
        SET current_amount = $1, status = $2 
        WHERE id = $3;
      `;
      await client.query(queryUpdateCampaign, [newAmount, newCampaignStatus, data.campaign_id]);

      await client.query('COMMIT');
      return resContribution.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  // Obtener todos los aportes
  async findAll(): Promise<Contribution[]> {
    const res = await pool.query(`SELECT * FROM contributions ORDER BY created_at DESC;`);
    return res.rows;
  }

  // Obtener aportes de una campaña
  async findByCampaignId(campaignId: string): Promise<Contribution[]> {
    const query = `SELECT * FROM contributions WHERE campaign_id = $1 ORDER BY created_at DESC;`;
    const res = await pool.query(query, [campaignId]);
    return res.rows;
  }
  async findById(id: string): Promise<Contribution | null> {
    const res = await pool.query(`SELECT * FROM contributions WHERE id = $1;`, [id]);
    return res.rows[0] || null;
  }

  async updateStatus(id: string, status: 'RELEASED' | 'REFUNDED'): Promise<Contribution | null> {
    const query = `
      UPDATE contributions 
      SET status = $1 
      WHERE id = $2 
      RETURNING *;
    `;
    const res = await pool.query(query, [status, id]);
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const findRes = await client.query(`SELECT * FROM contributions WHERE id = $1 FOR UPDATE;`, [id]);
      if (findRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      const contribution = findRes.rows[0];

      await client.query(`DELETE FROM contributions WHERE id = $1;`, [id]);
      await client.query(
        `UPDATE campaigns SET current_amount = GREATEST(0, current_amount - $1) WHERE id = $2;`,
        [contribution.amount, contribution.campaign_id]
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}