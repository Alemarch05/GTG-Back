import { Router } from 'express';
import { ContributionController } from '../controllers/contribution.controller';

const router = Router();

router.post('/', ContributionController.create);
router.get('/', ContributionController.getAll);
router.get('/campaign/:campaignId', ContributionController.getByCampaign);
router.get('/:id', ContributionController.getById);
router.patch('/:id/status', ContributionController.updateStatus);
router.delete('/:id', ContributionController.delete);

export default router;