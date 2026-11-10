import { Request, Response } from 'express';
import { CampaignService } from '../services/campaign.service';

const service = new CampaignService();

export class CampaignController {
  private service: CampaignService;

  constructor() {
    this.service = new CampaignService();
  }

  async create(req: Request, res: Response) {
    try {
    const userId = (req as any).user?.id || req.body.user_id;

      if (!userId) {
        return res.status(401).json({ error: 'No autorizado. Se requiere autenticación para crear una campaña.' });
      }

      // Combinamos los datos enviados por el cuerpo con el user_id verificado por el servidor
      const campaignData = {
        ...req.body,
        user_id: userId, // Forzamos el ID real del token
      };

      const campaign = await this.service.createCampaign(campaignData);
      return res.status(201).json(campaign);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const campaigns = await this.service.getAllCampaigns();
      return res.status(200).json(campaigns);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const campaign = await this.service.getCampaignById(req.params.id as string);
      return res.status(200).json(campaign);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string; // <--- Añade "as string"
      const userId = (req as any).user?.id || req.body.user_id;
      const updateData = req.body;

      const updated = await service.updateCampaign(id, userId, updateData);
      return res.status(200).json({ message: 'Campaña actualizada', data: updated });
    } catch (error: any) {
      if (error.message.startsWith('403')) return res.status(403).json({ error: error.message });
      if (error.message.startsWith('404')) return res.status(404).json({ error: error.message });
      return res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string; // <--- Añade "as string"
      const userId = (req as any).user?.id || req.body.user_id;

      await service.deleteCampaign(id, userId);
      return res.status(200).json({ message: 'Campaña eliminada exitosamente' });
    } catch (error: any) {
      if (error.message.startsWith('403')) return res.status(403).json({ error: error.message });
      if (error.message.startsWith('404')) return res.status(404).json({ error: error.message });
      return res.status(400).json({ error: error.message });
    }
  }
}