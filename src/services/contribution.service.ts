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
}