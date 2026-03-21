import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';
import { authenticate } from '../middleware/authMiddleware';

import { body } from 'express-validator';
import { validate } from '../middleware/validateMiddleware';

const router = Router();

router.use(authenticate); // All transaction routes are protected

router.post('/sync', transactionController.syncTransactions);
router.get('/', transactionController.getTransactions);

router.post(
  '/',
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').notEmpty().withMessage('Category is required'),
    validate
  ],
  transactionController.createTransaction
);

router.put(
  '/:id',
  [
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    validate
  ],
  transactionController.updateTransaction
);

router.delete('/:id', transactionController.deleteTransaction);

export default router;
