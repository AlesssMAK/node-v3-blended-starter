import { celebrate } from 'celebrate';
import { Router } from 'express';
import {
  loginSchema,
  registerSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';

const router = Router();

router.post('/auth/register', celebrate(registerSchema), registerUser);

router.post('/auth/login', celebrate(loginSchema), loginUser);

router.post('/auth/logout', logoutUser);

router.post('/auth/refresh', refreshUserSession);

router.post(
  '/auth/request-reset-email',
  celebrate(requestResetEmailSchema),
  requestResetEmail,
);

router.post(
  '/auth/reset-password',
  celebrate(resetPasswordSchema),
  resetPassword,
);

export default router;
