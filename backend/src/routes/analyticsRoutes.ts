import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/spending-breakdown', analyticsController.getSpendingBreakdown);
router.get('/monthly-trends', analyticsController.getMonthlyTrends);
router.get('/heatmap', analyticsController.getHeatmapData);

export default router;
