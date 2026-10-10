import { Request, Response } from 'express';
import { ContributionService } from '../services/contribution.service';

const service = new ContributionService();

export class ContributionController {
  static async create(req: Request, res: Response) {
    try {
      const { campaign_id, user_id, amount } = req.body;

      if (!campaign_id || !user_id || !amount) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      }

      const contribution = await service.makeContribution({
        campaign_id,
        user_id,
        amount: Number(amount)
      });

      return res.status(201).json({
        message: 'Aporte en custodia registrado exitosamente',
        data: contribution
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  }

    static async getByCampaign(req: Request, res: Response) {
  try {
    const campaignId = req.params.campaignId as string;

    if (!campaignId) {
      return res.status(400).json({ error: 'El ID de la campaña es obligatorio' });
    }

    const contributions = await service.getCampaignContributions(campaignId);
    return res.status(200).json({ data: contributions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
}   