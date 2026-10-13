import { pool } from '../config/database';
import { PoolClient } from 'pg';
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

  // READ ONE BY ID: Obtener detalle de un aporte específico
  async findById(id: string): Promise<Contribution | null> {
    const query = `SELECT * FROM contributions WHERE id = $1;`;
    const res = await pool.query(query, [id]);
    return res.rows.length ? res.rows[0] : null;
  }

  // UPDATE STATUS: Cambiar estado (ej: 'RELEASED' o 'REFUNDED')
  async updateStatus(id: string, status: 'HELD' | 'RELEASED' | 'REFUNDED'): Promise<Contribution | null> {
    const query = `
      UPDATE contributions 
      SET status = $1 
      WHERE id = $2 
      RETURNING *;
    `;
    const res = await pool.query(query, [status, id]);
    return res.rows.length ? res.rows[0] : null;
  }

  // DELETE / CANCEL: Anular aporte y descontar del acumulado de la campaña
  async delete(id: string): Promise<boolean> {
    const client: PoolClient = await pool.connect();
    try {
      await client.query('BEGIN');

      // Buscar el aporte para saber el monto y la campaña
      const findQuery = `SELECT * FROM contributions WHERE id = $1 FOR UPDATE;`;
      const findRes = await client.query(findQuery, [id]);

      if (findRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      const contribution: Contribution = findRes.rows[0];

      // Descontar el monto de la campaña
      const updateCampaignQuery = `
        UPDATE campaigns 
        SET current_amount = current_amount - $1 
        WHERE id = $2;
      `;
      await client.query(updateCampaignQuery, [contribution.amount, contribution.campaign_id]);

      // Eliminar el registro del aporte
      const deleteQuery = `DELETE FROM contributions WHERE id = $1;`;
      await client.query(deleteQuery, [id]);

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