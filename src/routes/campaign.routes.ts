import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller';
import { authenticateToken } from '../middlewares/auth.middleware';


const router = Router();
const campaignController = new CampaignController();

// Tus rutas anteriores...
router.put('/:id', authenticateToken, CampaignController.update);
router.delete('/:id', authenticateToken, CampaignController.delete);

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
router.post('/', authenticateToken, (req, res) => campaignController.create(req, res));

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
router.get('/', authenticateToken, (req, res) => campaignController.getAll(req, res));

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
router.get('/:id', authenticateToken, (req, res) => campaignController.getById(req, res));

/**
 * @openapi
 * /campaigns/{id}:
 *   put:
 *     summary: Actualizar o editar una campaña existente
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               target_amount:
 *                 type: number
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Campaña actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       403:
 *         description: No autorizado (no eres el dueño)
 *       404:
 *         description: Campaña no encontrada
 *   delete:
 *     summary: Eliminar una campaña finalizada
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaña eliminada exitosamente
 *       400:
 *         description: No se puede eliminar una campaña vigente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Campaña no encontrada
 */
router.put('/:id', CampaignController.update);

router.delete('/:id', CampaignController.delete);

export default router;
