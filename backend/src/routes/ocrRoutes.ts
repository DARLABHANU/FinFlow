import express from 'express';
import { processReceipt } from '../controllers/ocrController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/scan', authenticate, processReceipt);

export default router;
