import request from 'supertest';
import app from '../index';

jest.mock('../config/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn() },
    $disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('bcryptjs', () => ({
  hash:    jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

import { prisma } from '../config/prisma';
import bcrypt from 'bcryptjs';

const users    = prisma.user    as unknown as { findUnique: jest.Mock; create: jest.Mock };
const bcryptCompare = bcrypt.compare as jest.Mock;

afterAll(async () => { await prisma.$disconnect(); });

describe('POST /auth/register', () => {
  beforeEach(() => {
    users.findUnique.mockResolvedValue(null);
    users.create.mockResolvedValue({
      id: 'user-1', email: 'test@test.com', fullName: 'Test User',
    });
  });

  it('returns 201 with a token on valid registration', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'test@test.com', password: 'password123', fullName: 'Test User',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@test.com');
  });

  it('returns 409 when email is already registered', async () => {
    users.findUnique.mockResolvedValue({ id: 'existing' });

    const res = await request(app).post('/auth/register').send({
      email: 'test@test.com', password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already registered');
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'not-an-email', password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'test@test.com', password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /auth/login', () => {
  const mockUser = {
    id: 'user-1', email: 'test@test.com', fullName: 'Test', passwordHash: 'hashed',
  };

  it('returns 200 with a token on valid credentials', async () => {
    users.findUnique.mockResolvedValue(mockUser);
    bcryptCompare.mockResolvedValue(true);

    const res = await request(app).post('/auth/login').send({
      email: 'test@test.com', password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('returns 401 when user does not exist', async () => {
    users.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/auth/login').send({
      email: 'nobody@test.com', password: 'password123',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('returns 401 when password is wrong', async () => {
    users.findUnique.mockResolvedValue(mockUser);
    bcryptCompare.mockResolvedValue(false);

    const res = await request(app).post('/auth/login').send({
      email: 'test@test.com', password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });
});
