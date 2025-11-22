import { celebrate } from 'celebrate';
import { Router } from 'express';
import { loginSchema, registerSchema } from '../validations/authValidation.js';
import { loginUser, registerUser } from '../controllers/authController.js';

const router = Router();

router.post('/auth/register', celebrate(registerSchema), registerUser);

router.post('/auth/login', celebrate(loginSchema), loginUser);

export default router;
