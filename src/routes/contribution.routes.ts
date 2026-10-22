import { Router } from 'express';
import { ContributionController } from '../controllers/contribution.controller';

const router = Router();

/**
 * @openapi
 * /contributions:
 *   post:
 *     summary: Realizar un aporte a una campaña
 *     tags: [Contributions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [campaign_id, user_id, amount]
 *             properties:
 *               campaign_id:
 *                 type: string
 *                 format: uuid
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Aporte registrado en custodia exitosamente
 *       400:
 *         description: Error en la validación o campaña inactiva
 */
router.post('/', ContributionController.create);

/**
 * @openapi
 * /contributions:
 *   get:
 *     summary: Obtener todos los aportes
 *     tags: [Contributions]
 *     responses:
 *       200:
 *         description: Lista de todos los aportes
 */
router.get('/', ContributionController.getAll);

/**
 * @openapi
 * /contributions/campaign/{campaignId}:
 *   get:
 *     summary: Obtener los aportes de una campaña específica
 *     tags: [Contributions]
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de aportes de la campaña
 */
router.get('/campaign/:campaignId', ContributionController.getByCampaign);

/**
 * @openapi
 * /contributions/{id}:
 *   get:
 *     summary: Obtener un aporte por su ID
 *     tags: [Contributions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Detalle del aporte
 */
router.get('/:id', ContributionController.getById);

/**
 * @openapi
 * /contributions/{id}/status:
 *   patch:
 *     summary: Actualizar el estado de un aporte (RELEASED, REFUNDED)
 *     tags: [Contributions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [RELEASED, REFUNDED]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:id/status', ContributionController.updateStatus);

/**
 * @openapi
 * /contributions/{id}:
 *   delete:
 *     summary: Cancelar un aporte
 *     tags: [Contributions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Aporte cancelado exitosamente
 */
router.delete('/:id', ContributionController.delete);

export default router;