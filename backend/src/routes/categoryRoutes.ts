import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, categoryController.getCategories);
router.post('/', authenticate, categoryController.createCategory);

export default router;
