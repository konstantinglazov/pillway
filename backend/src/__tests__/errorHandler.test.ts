import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { Prisma } from '@prisma/client';
import { errorHandler } from '../middleware/errorHandler';

const mockReq = {} as Request;
const mockNext = jest.fn() as NextFunction;

function mockRes(): { status: jest.Mock; json: jest.Mock; res: Response } {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as Response;
  return { status, json, res };
}

describe('errorHandler middleware', () => {
  describe('ZodError', () => {
    it('responds 400 with VALIDATION_ERROR code and issues', () => {
      const schema = z.object({ name: z.string().min(1) });
      let zodErr!: ZodError;
      try { schema.parse({ name: '' }); } catch (e) { zodErr = e as ZodError; }

      const { status, json, res } = mockRes();
      errorHandler(zodErr, mockReq, res, mockNext);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, code: 'VALIDATION_ERROR' })
      );
      const body = json.mock.calls[0][0];
      expect(body.issues.length).toBeGreaterThan(0);
      expect(body.issues[0]).toHaveProperty('field');
      expect(body.issues[0]).toHaveProperty('message');
    });
  });

  describe('PrismaClientKnownRequestError', () => {
    it('responds 409 for P2002 (unique constraint)', () => {
      const err = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.0.0',
      });

      const { status, json, res } = mockRes();
      errorHandler(err, mockReq, res, mockNext);

      expect(status).toHaveBeenCalledWith(409);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, code: 'P2002' })
      );
    });

    it('responds 400 for other Prisma known errors', () => {
      const err = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '7.0.0',
      });

      const { status, json, res } = mockRes();
      errorHandler(err, mockReq, res, mockNext);

      expect(status).toHaveBeenCalledWith(400);
    });
  });

  describe('PrismaClientValidationError', () => {
    it('responds 400 with DB_VALIDATION code', () => {
      const err = new Prisma.PrismaClientValidationError('Invalid query', {
        clientVersion: '7.0.0',
      });

      const { status, json, res } = mockRes();
      errorHandler(err, mockReq, res, mockNext);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, code: 'DB_VALIDATION' })
      );
    });
  });

  describe('generic Error', () => {
    it('responds 500 with a generic message (never leaks err.message)', () => {
      const err = new Error('Something went wrong');

      const { status, json, res } = mockRes();
      errorHandler(err, mockReq, res, mockNext);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Internal server error' })
      );
    });

    it('responds 500 with generic message for non-Error throws', () => {
      const { status, json, res } = mockRes();
      errorHandler('oops', mockReq, res, mockNext);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Internal server error' })
      );
    });
  });
});
