import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';

const router = Router();
const campaignController = new CampaignController();

/**
 * @openapi
 * /campaigns:
 *   get:
 *     summary: Obtener la lista de campañas
 *     tags: [Campaigns]
 *     responses:
 *       200:
 *         description: Lista de campañas obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', campaignController.getAllCampaigns);

/**
 * @openapi
 * /campaigns/{id}:
 *   get:
 *     summary: Obtener el detalle de una campaña
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (UUID) de la campaña
 *     responses:
 *       200:
 *         description: Detalle de la campaña
 *       404:
 *         description: Campaña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', campaignController.getCampaignById);

export default router;