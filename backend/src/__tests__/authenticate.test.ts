import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/authenticate';

const JWT_SECRET = 'pillway-dev-secret-change-in-production';

beforeAll(() => { process.env['JWT_SECRET'] = JWT_SECRET; });

function makeReq(authHeader?: string): Request {
  return { headers: { authorization: authHeader } } as unknown as Request;
}

function makeRes(): { status: jest.Mock; json: jest.Mock; res: Response } {
  const json   = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { status, json, res: { status, json } as unknown as Response };
}

function makeToken(payload: object = { sub: 'user-1' }, opts: jwt.SignOptions = { expiresIn: '1h' }): string {
  return jwt.sign(payload, JWT_SECRET, opts);
}

describe('authenticate middleware', () => {
  describe('missing or malformed header', () => {
    it('returns 401 when Authorization header is absent', () => {
      const { status, json, res } = makeRes();
      const next = jest.fn();
      authenticate(makeReq(), res, next);
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when header does not start with "Bearer "', () => {
      const { status, json, res } = makeRes();
      const next = jest.fn();
      authenticate(makeReq('Token abc123'), res, next);
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Missing or malformed Authorization header' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when header is just "Bearer " with no token', () => {
      const { status, json, res } = makeRes();
      const next = jest.fn();
      authenticate(makeReq('Bearer '), res, next);
      expect(status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('invalid token', () => {
    it('returns 401 for a structurally invalid token', () => {
      const { status, res } = makeRes();
      const next = jest.fn();
      authenticate(makeReq('Bearer bad.token.here'), res, next);
      expect(status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when the token is signed with the wrong secret', () => {
      const token = jwt.sign({ sub: 'user-1' }, 'wrong-secret', { expiresIn: '1h' });
      const { status, res } = makeRes();
      const next = jest.fn();
      authenticate(makeReq(`Bearer ${token}`), res, next);
      expect(status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 for an expired token', () => {
      const token = makeToken({ sub: 'user-1' }, { expiresIn: -1 });
      const { status, json, res } = makeRes();
      const next = jest.fn();
      authenticate(makeReq(`Bearer ${token}`), res, next);
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid or expired token' })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('valid token', () => {
    it('calls next() and attaches userId to req', () => {
      const token = makeToken({ sub: 'user-abc-123' });
      const req   = makeReq(`Bearer ${token}`);
      const { res } = makeRes();
      const next  = jest.fn();
      authenticate(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect((req as any).userId).toBe('user-abc-123');
    });

    it('does not call res.status() when token is valid', () => {
      const token = makeToken({ sub: 'user-1' });
      const { status, res } = makeRes();
      const next = jest.fn();
      authenticate(makeReq(`Bearer ${token}`), res, next);
      expect(status).not.toHaveBeenCalled();
    });
  });
});
