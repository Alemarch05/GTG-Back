import { ContributionRepository } from '../repositories/contribution.repository';
import { CreateContributionDTO, Contribution } from '../types/contribution.types';
import { CampaignRepository } from '../repositories/campaign.repository';

export class ContributionService {
  private repository: ContributionRepository;
  private campaignRepository: CampaignRepository;

  constructor() {
    this.repository = new ContributionRepository();
    this.campaignRepository = new CampaignRepository();
  }

  async makeContribution(data: CreateContributionDTO): Promise<Contribution> {
    if (data.amount <= 0) {
      throw new Error('El monto del aporte debe ser mayor a 0');
    }

    const campaign = await this.campaignRepository.findById(data.campaign_id);
    if (!campaign) {
      throw new Error('404: Campaña no encontrada');
    }

    if (campaign.user_id === data.user_id) {
      throw new Error('403: No puedes realizar aportes a tu propia campaña');
    }

    return await this.repository.create(data);
  }

  async getCampaignContributions(campaignId: string): Promise<Contribution[]> {
    return await this.repository.findByCampaignId(campaignId);
  }

  async getAllContributions(): Promise<Contribution[]> {
    return await this.repository.findAll();
  }

  async getContributionById(id: string): Promise<Contribution> {
    const contribution = await this.repository.findById(id);
    if (!contribution) {
      throw new Error('Aporte no encontrado');
    }
    return contribution;
  }

  // Obtener historial personal del usuario
  async getMyHistory(userId: string) {
    const history = await this.repository.findHistoryByUserId(userId);
    const totalContributed = history.reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      total_contributed: totalContributed,
      contributions: history
    };
  }

  async changeContributionStatus(id: string, status: 'RELEASED' | 'REFUNDED'): Promise<Contribution> {
    if (!['RELEASED', 'REFUNDED'].includes(status)) {
      throw new Error('Estado inválido. Solo se permite RELEASED o REFUNDED');
    }
    const updated = await this.repository.updateStatus(id, status);
    if (!updated) {
      throw new Error('Aporte no encontrado');
    }
    return updated;
  }

  async cancelContribution(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error('No se pudo cancelar, el aporte no existe');
    }
  }

  async settleExpired(): Promise<number> {
  return await this.repository.processExpiredCampaigns();
}
}