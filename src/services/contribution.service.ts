import { ContributionRepository } from '../repositories/contribution.repository';
import { CreateContributionDTO, Contribution } from '../types/contribution.types';

export class ContributionService {
  private repository: ContributionRepository;

  constructor() {
    this.repository = new ContributionRepository();
  }

  async makeContribution(data: CreateContributionDTO): Promise<Contribution> {
    if (data.amount <= 0) {
      throw new Error('El monto del aporte debe ser mayor a 0');
    }
    return await this.repository.create(data);
  }

  async getCampaignContributions(campaignId: string): Promise<Contribution[]> {
    return await this.repository.findByCampaignId(campaignId);
  }

  async getContributionById(id: string): Promise<Contribution> {
    const contribution = await this.repository.findById(id);
    if (!contribution) {
      throw new Error('Aporte no encontrado');
    }
    return contribution;
  }

  async changeContributionStatus(id: string, status: 'HELD' | 'RELEASED' | 'REFUNDED'): Promise<Contribution> {
    const validStatuses = ['HELD', 'RELEASED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Estado inválido para el aporte');
    }

    const updated = await this.repository.updateStatus(id, status);
    if (!updated) {
      throw new Error('Aporte no encontrado para actualizar');
    }
    return updated;
  }

  async cancelContribution(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error('No se pudo cancelar el aporte. ID no encontrado.');
    }
  }
}