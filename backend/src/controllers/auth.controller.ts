import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/prisma';

const RegisterSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
});

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

function signToken(userId: string): string {
  const secret  = process.env['JWT_SECRET']!;
  const expires = (process.env['JWT_EXPIRES_IN'] ?? '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign({ sub: userId }, secret, { expiresIn: expires });
}

/** POST /auth/register */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, fullName } = RegisterSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, fullName },
      select: { id: true, email: true, fullName: true },
    });

    res.status(201).json({ success: true, token: signToken(user.id), user });
  } catch (err) {
    next(err);
  }
}

/** POST /auth/login */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    res.json({
      success: true,
      token: signToken(user.id),
      user: { id: user.id, email: user.email, fullName: user.fullName },
    });
  } catch (err) {
    next(err);
  }
}
