import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';

const router = Router();
const campaignController = new CampaignController();

/**
 * @openapi
 * /campaigns:
 *   post:
 *     summary: Crear una nueva campaña
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, title, description, targetAmount, expiresAt]
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Campaña creada exitosamente
 *       400:
 *         description: Error en la validación de datos
 */
router.post('/', (req, res) => campaignController.create(req, res));

/**
 * @openapi
 * /campaigns:
 *   get:
 *     summary: Obtener todas las campañas
 *     tags: [Campaigns]
 *     responses:
 *       200:
 *         description: Lista de campañas obtenida exitosamente
 */
router.get('/', (req, res) => campaignController.getAll(req, res));

/**
 * @openapi
 * /campaigns/{id}:
 *   get:
 *     summary: Obtener una campaña por ID
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Campaña obtenida exitosamente
 *       404:
 *         description: Campaña no encontrada
 */
router.get('/:id', (req, res) => campaignController.getById(req, res));

export default router;