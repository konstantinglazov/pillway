import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string; // user UUID
}

/**
 * Verifies the Bearer JWT in the Authorization header.
 * On success attaches `req.userId` for downstream controllers.
 * On failure responds 401 immediately.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing or malformed Authorization header' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env['JWT_SECRET']!) as JwtPayload;
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
