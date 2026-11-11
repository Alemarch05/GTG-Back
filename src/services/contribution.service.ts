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
    const totalPending = history
      .filter((item) => item.status === 'HELD')
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const totalReleased = history
      .filter((item) => item.status === 'RELEASED')
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const totalRefunded = history
      .filter((item) => item.status === 'REFUNDED')
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const contributions = history.map((item) => ({
      contribution_id: item.contribution_id,
      amount: Number(item.amount),
      created_at: item.created_at,
      status: item.status,
      campaign_id: item.campaign_id,
      campaign_title: item.campaign_title,
      campaign_status: item.campaign_status
    }));

    return {
      summary: {
        total_contributed: totalContributed,
        total_pending: totalPending,
        total_released: totalReleased,
        total_refunded: totalRefunded
      },
      total_contributed: totalContributed,
      contributions
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