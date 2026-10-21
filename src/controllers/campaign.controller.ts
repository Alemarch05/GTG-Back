import { Request, Response } from 'express';
import { CampaignService } from '../services/campaign.service';

export class CampaignController {
  private campaignService: CampaignService;

  constructor() {
    this.campaignService = new CampaignService();
  }

  getAllCampaigns = async (_req: Request, res: Response): Promise<void> => {
    try {
      const campaigns = await this.campaignService.getAllCampaigns();
      res.status(200).json(campaigns);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la lista de campañas' });
    }
  };

  getCampaignById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string; 
      const campaign = await this.campaignService.getCampaignById(id);
      res.status(200).json(campaign);
    } catch (error: any) {
      if (error.message === 'CAMPAIGN_NOT_FOUND') {
        res.status(404).json({ message: 'Campaña no encontrada' });
        return;
      }
      res.status(500).json({ message: 'Error al obtener el detalle de la campaña' });
    }
  };
}