import { Router } from 'express';
import { ContributionController } from '../controllers/contribution.controller';

const router = Router();

/**
 * @openapi
 * /contributions:
 *   post:
 *     summary: Registrar un nuevo aporte en custodia virtual
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
 *                 example: "d12a3b4c-5678-90ab-cdef-1234567890ab"
 *               user_id:
 *                 type: string
 *                 example: "a0000000-0000-0000-0000-000000000001"
 *               amount:
 *                 type: number
 *                 example: 150.00
 *     responses:
 *       201:
 *         description: Aporte en custodia registrado exitosamente
 *       400:
 *         description: Todos los campos son obligatorios o monto inválido
 *       500:
 *         description: Error interno del servidor
 *   get:
 *     summary: Obtener la lista general de aportes
 *     tags: [Contributions]
 *     responses:
 *       200:
 *         description: Lista de aportes obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', (req, res) => ContributionController.create(req, res));
router.get('/', (req, res) => ContributionController.getAll(req, res));

/**
 * @openapi
 * /contributions/campaign/{campaignId}:
 *   get:
 *     summary: Obtener todos los aportes asociados a una campaña
 *     tags: [Contributions]
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la campaña
 *     responses:
 *       200:
 *         description: Lista de aportes de la campaña
 *       500:
 *         description: Error interno del servidor
 */
router.get('/campaign/:campaignId', (req, res) => ContributionController.getByCampaign(req, res));

/**
 * @openapi
 * /contributions/{id}:
 *   get:
 *     summary: Obtener el detalle de un aporte por su ID
 *     tags: [Contributions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del aporte
 *     responses:
 *       200:
 *         description: Detalle del aporte encontrado
 *       404:
 *         description: Aporte no encontrado
 *   delete:
 *     summary: Cancelar un aporte y descontar el monto de la campaña
 *     tags: [Contributions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del aporte a cancelar
 *     responses:
 *       200:
 *         description: Aporte cancelado exitosamente
 *       400:
 *         description: Error al cancelar el aporte o ID no encontrado
 */
router.get('/:id', (req, res) => ContributionController.getById(req, res));
router.delete('/:id', (req, res) => ContributionController.delete(req, res));

/**
 * @openapi
 * /contributions/{id}/status:
 *   patch:
 *     summary: Actualizar el estado del aporte (RELEASED o REFUNDED)
 *     tags: [Contributions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del aporte
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
 *                 example: "RELEASED"
 *     responses:
 *       200:
 *         description: Estado del aporte actualizado
 *       400:
 *         description: Estado inválido o requerimiento incompleto
 */
router.patch('/:id/status', (req, res) => ContributionController.updateStatus(req, res));

/**
 * @openapi
 * /contributions/settle-expired:
 *   post:
 *     summary: Ejecutar manualmente la expiración y liquidación All-or-Nothing de campañas
 *     tags: [Contributions]
 *     responses:
 *       200:
 *         description: Campañas evaluadas y aportes actualizados a RELEASED o REFUNDED
 *       500:
 *         description: Error interno del servidor
 */
router.post('/settle-expired', (req, res) => ContributionController.settleExpiredCampaigns(req, res));

export default router;