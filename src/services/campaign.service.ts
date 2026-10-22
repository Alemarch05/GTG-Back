import { CampaignRepository, CampaignData } from '../repositories/campaign.repository';

export class CampaignService {
  private repository: CampaignRepository;

  constructor() {
    this.repository = new CampaignRepository();
  }

  async createCampaign(data: CampaignData) {
    if (!data.userId || !data.title || !data.targetAmount || !data.expiresAt) {
      throw new Error('Faltan campos obligatorios');
    }
    if (data.targetAmount <= 0) {
      throw new Error('El monto objetivo debe ser mayor a 0');
    }
    return await this.repository.create(data);
  }

  async getAllCampaigns() {
    return await this.repository.findAll();
  }

  async getCampaignById(id: string) {
    const campaign = await this.repository.findById(id);
    if (!campaign) {
      throw new Error('Campaña no encontrada');
    }
    return campaign;
  }
}