import { Router } from 'express';
import { ContributionController } from '../controllers/contribution.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /contributions:
 *   post:
<<<<<<< HEAD
 *     summary: Realizar un aporte a una campaña
=======
 *     summary: Registrar un nuevo aporte en custodia virtual
>>>>>>> Dev
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
<<<<<<< HEAD
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
=======
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
router.post('/', authenticateToken, (req, res) => ContributionController.create(req, res));
router.get('/', (req, res) => ContributionController.getAll(req, res));
>>>>>>> Dev

/**
 * @openapi
 * /contributions/campaign/{campaignId}:
 *   get:
<<<<<<< HEAD
 *     summary: Obtener los aportes de una campaña específica
=======
 *     summary: Obtener todos los aportes asociados a una campaña
>>>>>>> Dev
 *     tags: [Contributions]
 *     parameters:
 *       - in: path
 *         name: campaignId
<<<<<<< HEAD
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de aportes de la campaña
 */
router.get('/campaign/:campaignId', ContributionController.getByCampaign);
=======
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
>>>>>>> Dev

/**
 * @openapi
 * /contributions/{id}:
 *   get:
<<<<<<< HEAD
 *     summary: Obtener un aporte por su ID
=======
 *     summary: Obtener el detalle de un aporte por su ID
>>>>>>> Dev
 *     tags: [Contributions]
 *     parameters:
 *       - in: path
 *         name: id
<<<<<<< HEAD
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Detalle del aporte
 */
router.get('/:id', ContributionController.getById);
=======
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
>>>>>>> Dev

/**
 * @openapi
 * /contributions/{id}/status:
 *   patch:
<<<<<<< HEAD
 *     summary: Actualizar el estado de un aporte (RELEASED, REFUNDED)
=======
 *     summary: Actualizar el estado del aporte (RELEASED o REFUNDED)
>>>>>>> Dev
 *     tags: [Contributions]
 *     parameters:
 *       - in: path
 *         name: id
<<<<<<< HEAD
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
=======
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del aporte
>>>>>>> Dev
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
<<<<<<< HEAD
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
=======
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
>>>>>>> Dev

export default router;