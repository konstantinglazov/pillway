import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login } from '../controllers/auth.controller';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again in 15 minutes.' },
});

export const authRouter: Router = Router();

authRouter.post('/register', authLimiter, register);
authRouter.post('/login',    authLimiter, login);
