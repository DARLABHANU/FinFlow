import { Router } from 'express';
import * as authController from '../controllers/authController';

import { body } from 'express-validator';
import { validate } from '../middleware/validateMiddleware';

import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    validate
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  authController.login
);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
