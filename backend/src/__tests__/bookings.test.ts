import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../index';

jest.mock('../config/prisma', () => ({
  prisma: {
    pharmacy: { upsert: jest.fn() },
    booking:  { create: jest.fn(), findMany: jest.fn() },
    $disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

import { prisma } from '../config/prisma';

const pharmacy = prisma.pharmacy as unknown as { upsert: jest.Mock };
const booking  = prisma.booking  as unknown as { create: jest.Mock; findMany: jest.Mock };

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const JWT_SECRET   = 'pillway-dev-secret-change-in-production';

function makeToken(userId = TEST_USER_ID): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '1h' });
}

const validBody = {
  pharmacy: {
    name:              'Test Pharmacy',
    formatted_address: '123 Main St, Toronto, ON',
    lat:  43.65,
    lng: -79.38,
    place_id: 'place_abc',
  },
  service_type:        'Transfer Prescription',
  additional_services: ['Delivery'],
  prescription_notes:  'Brand X only',
};

afterAll(async () => { await prisma.$disconnect(); });

describe('POST /api/bookings', () => {
  beforeEach(() => {
    pharmacy.upsert.mockResolvedValue({ id: 'pharm-1' });
    booking.create.mockResolvedValue({ id: 'booking-1' });
  });

  it('returns 201 with booking_id on valid request', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, booking_id: 'booking-1' });
  });

  it('attaches userId from JWT — not from request body', async () => {
    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(validBody);

    expect(booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: TEST_USER_ID }),
      })
    );
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).post('/api/bookings').send(validBody);
    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', 'Bearer bad.token.here')
      .send(validBody);
    expect(res.status).toBe(401);
  });

  it('returns 400 when service_type is missing', async () => {
    const { service_type: _, ...body } = validBody;
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when pharmacy fields are missing', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ ...validBody, pharmacy: { name: 'X' } });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 when Prisma throws unexpectedly', async () => {
    pharmacy.upsert.mockRejectedValue(new Error('DB connection lost'));

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(validBody);

    expect(res.status).toBe(500);
  });
});

describe('GET /api/bookings', () => {
  const mockBookings = [
    {
      id: 'bk-1',
      userId: TEST_USER_ID,
      serviceType: 'Transfer Prescription',
      additionalServices: [],
      prescriptionNotes: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      pharmacy: { name: 'Test Pharmacy', formattedAddress: '123 Main St' },
    },
  ];

  it('returns 200 with bookings for authenticated user', async () => {
    booking.findMany.mockResolvedValue(mockBookings);

    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bookings).toHaveLength(1);
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(401);
  });

  it('returns empty array when user has no bookings', async () => {
    booking.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.bookings).toEqual([]);
  });
});

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
