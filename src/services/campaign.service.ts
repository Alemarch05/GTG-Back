import { CampaignRepository } from '../repositories/campaign.repository';
import { Campaign } from '../types/campaign.types';

export class CampaignService {
  private campaignRepository: CampaignRepository;

  constructor() {
    this.campaignRepository = new CampaignRepository();
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return await this.campaignRepository.findAll();
  }

  async getCampaignById(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new Error('CAMPAIGN_NOT_FOUND');
    }
    return campaign;
  }
}