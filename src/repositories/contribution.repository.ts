import { pool } from '../config/database';
import { Contribution, CreateContributionDTO } from '../types/contribution.types';

export class ContributionRepository {
  //Registrar un aporte en custodia virtual ('HELD')
  async create(data: CreateContributionDTO): Promise<Contribution> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN'); // Transacción ACID
      
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

      if (campaign.status !== 'ACTIVE') {
        throw new Error('La campaña no está activa para recibir aportes');
      }
      if (new Date(campaign.expires_at) < new Date()) {
        throw new Error('La campaña ya ha expirado');
      }
      const currentAmount = Number(campaign.current_amount);
      const targetAmount = Number(campaign.target_amount);

      if (currentAmount >= targetAmount) {
        throw new Error('La campaña ya alcanzó su meta y no acepta más aportes');
      }

      if (currentAmount + data.amount > targetAmount) {
        throw new Error('El aporte supera el monto que falta para alcanzar la meta');
      }
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


      const newAmount = parseFloat(campaign.current_amount) + data.amount;

        const queryUpdateCampaign = `
          UPDATE campaigns
          SET current_amount = $1
          WHERE id = $2;
        `;

        await client.query(queryUpdateCampaign, [
          newAmount,
          data.campaign_id
        ]);
      
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

  // Obtener aportes de un usuario (para el historial del usuario autenticado)
  async findByUserId(userId: string): Promise<Contribution[]> {
const query = `
  SELECT 
    con.id AS id,
    con.amount,
    con.status AS status,
    con.created_at,
    camp.id AS campaign_id,
    camp.title AS campaign_title,
    camp.status AS campaign_status
  FROM contributions con
  INNER JOIN campaigns camp ON con.campaign_id = camp.id
  WHERE con.user_id = $1
  ORDER BY con.created_at DESC;
`;    const res = await pool.query(query, [userId]);
    return res.rows;
  }

  async findHistoryByUserId(userId: string) {
    const query = `
      SELECT 
        con.id AS contribution_id,
        con.amount,
        con.created_at,
        con.status,
        camp.id AS campaign_id,
        camp.title AS campaign_title,
        camp.status AS campaign_status
      FROM contributions con
      INNER JOIN campaigns camp ON con.campaign_id = camp.id
      WHERE con.user_id = $1
      ORDER BY con.created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Obtener un aporte por ID
  async findById(id: string): Promise<Contribution | null> {
    const res = await pool.query(`SELECT * FROM contributions WHERE id = $1;`, [id]);
    return res.rows[0] || null;
  }

  // Actualizar estado individual
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

  // Eliminar / Cancelar aporte
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

  // TRANSACCIONAL ALL-OR-NOTHING (EXPIRACIÓN DE CAMPAÑAS)
  async processExpiredCampaigns(): Promise<number> {
    const client = await pool.connect();
    let processedCount = 0;

    try {
      await client.query('BEGIN'); // Transacción ACID

      //Bloqueo pesimista: Seleccionar campañas activas cuya fecha límite ya vencio
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