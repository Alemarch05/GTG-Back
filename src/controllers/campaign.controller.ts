import { Request, Response } from 'express';
import { CampaignService } from '../services/campaign.service';

export class CampaignController {
  private service: CampaignService;

  constructor() {
    this.service = new CampaignService();
  }

  async create(req: Request, res: Response) {
    try {
      const campaign = await this.service.createCampaign(req.body);
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
}