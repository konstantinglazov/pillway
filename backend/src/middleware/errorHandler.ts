import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/** Shape returned to callers on every error. */
interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  /** Populated only for Zod validation errors. */
  issues?: { field: string; message: string }[];
}

/**
 * Express error-handling middleware (four-argument signature required).
 *
 * Handles:
 *  - ZodError                         → 400 with field-level issue detail
 *  - PrismaClientKnownRequestError    → 409 (unique constraint) or 400
 *  - PrismaClientValidationError      → 400
 *  - All others                       → 500
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Zod validation failure
  if (err instanceof ZodError) {
    const body: ErrorResponse = {
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      issues: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    };
    res.status(400).json(body);
    return;
  }

  // Prisma known error (constraint violation, record not found, etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('[Prisma] KnownRequestError:', err.code, err.message);

    // P2002 = unique constraint violation (e.g. duplicate placeId — should not
    // happen because we use upsert, but guard against it anyway).
    const status = err.code === 'P2002' ? 409 : 400;

    const body: ErrorResponse = {
      success: false,
      message: 'Database constraint error',
      code: err.code,
    };
    res.status(status).json(body);
    return;
  }

  // Prisma validation error (bad field types, missing required fields)
  if (err instanceof Prisma.PrismaClientValidationError) {
    console.error('[Prisma] ValidationError:', err.message);
    res.status(400).json({ success: false, message: 'Invalid database query', code: 'DB_VALIDATION' });
    return;
  }

  // Generic / unknown errors — log fully, return minimal detail to client.
  console.error('[Server] Unhandled error:', err);
  const body: ErrorResponse = {
    success: false,
    message: err instanceof Error ? err.message : 'Internal server error',
  };
  res.status(500).json(body);
}
