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
}