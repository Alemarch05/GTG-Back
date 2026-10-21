import { pool } from '../config/database';
import { Contribution, CreateContributionDTO } from '../types/contribution.types';

export class ContributionRepository {
  // 1. Registrar un aporte en custodia virtual ('HELD')
  async create(data: CreateContributionDTO): Promise<Contribution> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN'); // Transacción ACID

      // Insertar el aporte en custodia
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

      // Sumar al acumulado de la campaña
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

  // 2. Obtener todos los aportes
  async findAll(): Promise<Contribution[]> {
    const res = await pool.query(`SELECT * FROM contributions ORDER BY created_at DESC;`);
    return res.rows;
  }

  // 3. Obtener aportes de una campaña
  async findByCampaignId(campaignId: string): Promise<Contribution[]> {
    const query = `SELECT * FROM contributions WHERE campaign_id = $1 ORDER BY created_at DESC;`;
    const res = await pool.query(query, [campaignId]);
    return res.rows;
  }

  // 4. Obtener aportes de un usuario (para el historial del usuario autenticado)
  async findByUserId(userId: string): Promise<Contribution[]> {
    const query = `SELECT * FROM contributions WHERE user_id = $1 ORDER BY created_at DESC;`;
    const res = await pool.query(query, [userId]);
    return res.rows;
  }

  // 5. Obtener un aporte por ID
  async findById(id: string): Promise<Contribution | null> {
    const res = await pool.query(`SELECT * FROM contributions WHERE id = $1;`, [id]);
    return res.rows[0] || null;
  }

  // 6. Actualizar estado individual
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

  // 7. Eliminar / Cancelar aporte
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

  // BLOQUE 4: MOTOR TRANSACCIONAL ALL-OR-NOTHING (EXPIRACIÓN DE CAMPAÑAS)
  async processExpiredCampaigns(): Promise<number> {
    const client = await pool.connect();
    let processedCount = 0;

    try {
      await client.query('BEGIN'); // Transacción ACID

      // 1. Bloqueo pesimista: Seleccionar campañas activas cuya fecha límite ya vencio
      const expiredCampaignsQuery = `
        SELECT id, target_amount, current_amount 
        FROM campaigns 
        WHERE status = 'ACTIVE' AND expires_at <= CURRENT_TIMESTAMP
        FOR UPDATE;
      `;
      const { rows: expiredCampaigns } = await client.query(expiredCampaignsQuery);

      for (const campaign of expiredCampaigns) {
        const isGoalReached = Number(campaign.current_amount) >= Number(campaign.target_amount);
        
        // Si alcanzo la meta se liberan los fondos ('RELEASED'), de lo contrario se reembolsan ('REFUNDED')
        const newContributionStatus = isGoalReached ? 'RELEASED' : 'REFUNDED';
        const newCampaignStatus = isGoalReached ? 'SUCCESSFUL' : 'FAILED';

        // 2. Actualizar las contribuciones en custodia ('HELD') de esta campaña
        await client.query(
          `UPDATE contributions 
           SET status = $1 
           WHERE campaign_id = $2 AND status = 'HELD';`,
          [newContributionStatus, campaign.id]
        );

        // 3. Actualizar el estado de la campaña
        await client.query(
          `UPDATE campaigns SET status = $1 WHERE id = $2;`,
          [newCampaignStatus, campaign.id]
        );

        processedCount++;
      }

      await client.query('COMMIT');
      return processedCount;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error en motor transaccional All-or-Nothing:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}