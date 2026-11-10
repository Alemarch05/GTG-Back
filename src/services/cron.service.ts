import cron from 'node-cron';
import { ContributionRepository } from '../repositories/contribution.repository';

const contributionRepository = new ContributionRepository();

export class CronService {
  /**
   * Tarea programada que revisa campañas expiradas automáticamente cada minuto.
   */
  static initCronJobs() {
    console.log('Motor Transaccional All-or-Nothing activado (Cron Job)');

    cron.schedule('* * * * *', async () => {
      try {
        const processed = await contributionRepository.processExpiredCampaigns();
        if (processed > 0) {
          console.log(`[All-or-Nothing] Se procesaron y cerraron ${processed} campañas expiradas.`);
        }
      } catch (error) {
        console.error('[Cron Error] Falló el procesamiento de campañas expiradas:', error);
      }
    });
  }
}