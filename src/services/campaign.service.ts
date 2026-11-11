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

  async updateCampaign(
  campaignId: string,
  userId: string,
  data: UpdateCampaignDTO
  ) {
    const campaign = await this.repository.findById(campaignId);
  
    if (!campaign) {
      throw new Error('404: Campaña no encontrada');
    }
  
    if (campaign.user_id !== userId) {
      throw new Error('403: No tienes permiso para editar esta campaña');
    }
  
    const now = new Date();
  
    // No permitir editar campañas cerradas ni campañas cuyo plazo ya venció,
    // aunque el proceso automático todavía no las haya liquidado.
    if (
      campaign.status !== 'ACTIVE' ||
      new Date(campaign.expires_at).getTime() <= now.getTime()
    ) {
      throw new Error('400: No puedes editar una campaña vencida o cerrada');
    }
  
    // Si envían una nueva fecha, debe ser válida y futura.
    if (data.expires_at !== undefined) {
      const newExpiration = new Date(data.expires_at);
    
      if (
        Number.isNaN(newExpiration.getTime()) ||
        newExpiration.getTime() <= now.getTime()
      ) {
        throw new Error('400: La fecha de vencimiento debe ser válida y futura');
      }
    }
  
    // No calcular ni enviar status: la edición no debe cerrar la campaña.
    return await this.repository.update(campaignId, data);
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