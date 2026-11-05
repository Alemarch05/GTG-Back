import { CampaignRepository, CampaignData } from '../repositories/campaign.repository';
import { UpdateCampaignDTO } from '../types/campaign.types';

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

  async updateCampaign(campaignId: string, userId: string, data: UpdateCampaignDTO) {
    const campaign = await this.repository.findById(campaignId);
    if (!campaign) throw new Error('404: Campaña no encontrada');

    if (campaign.user_id !== userId) {
      throw new Error('403: No tienes permiso para editar esta campaña');
    }
    
    const effectiveTarget = data.target_amount !== undefined ? Number(data.target_amount) : Number(campaign.target_amount);
    const effectiveExpiresAt = data.expires_at ? new Date(data.expires_at) : new Date(campaign.expires_at);
    const currentAmount = Number(campaign.current_amount);

    let newStatus = campaign.status;
    const now = new Date(); 

    if (currentAmount >= effectiveTarget) {
      newStatus = 'SUCCESSFUL'; 
    } else if (effectiveExpiresAt <= now) {
      newStatus = 'FAILED'; 
    } else {
      newStatus = 'ACTIVE'; 
    }

    return await this.repository.update(campaignId, { ...data, status: newStatus });
  }

  async deleteCampaign(campaignId: string, userId: string) {
    const campaign = await this.repository.findById(campaignId);
    if (!campaign) throw new Error('404: Campaña no encontrada');

    if (campaign.user_id !== userId) {
      throw new Error('403: No tienes permiso para eliminar esta campaña');
    }

    if (new Date(campaign.expires_at) > new Date()) {
      throw new Error('400: No puedes eliminar una campaña que aún está vigente');
    }

    await this.repository.delete(campaignId);
  }
}