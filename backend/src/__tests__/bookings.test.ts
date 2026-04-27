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
  return jwt.sign({ sub: userId, email: 'test@test.com', fullName: 'Test User' }, JWT_SECRET, { expiresIn: '1h' });
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
  additional_services: ['Metformin 500mg'],
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

  it('creates nested medication records via medications.create', async () => {
    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(validBody);

    expect(booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          medications: {
            create: [{ medicationName: 'Metformin 500mg' }],
          },
        }),
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

  it('returns 201 when prescription_notes is omitted', async () => {
    const { prescription_notes: _, ...body } = validBody;

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send(body);

    expect(res.status).toBe(201);
    expect(booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ prescriptionNotes: null }),
      })
    );
  });

  it('creates no medication records when additional_services is empty', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ ...validBody, additional_services: [] });

    expect(res.status).toBe(201);
    expect(booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          medications: { create: [] },
        }),
      })
    );
  });
});

describe('GET /api/bookings', () => {
  // Mock returns the Prisma shape (medications relation, not additionalServices array).
  // The controller transforms medications → additionalServices before sending.
  const mockRows = [
    {
      id: 'bk-1',
      userId: TEST_USER_ID,
      pharmacyId: 'pharm-1',
      serviceType: 'Transfer Prescription',
      prescriptionNotes: null,
      status: 'pending',
      createdAt: new Date(),
      pharmacy: { name: 'Test Pharmacy', formattedAddress: '123 Main St' },
      medications: [{ medicationName: 'Metformin 500mg' }],
    },
  ];

  it('returns 200 with bookings transformed for the frontend', async () => {
    booking.findMany.mockResolvedValue(mockRows);

    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bookings).toHaveLength(1);
    // Verify medications are flattened to additionalServices
    expect(res.body.bookings[0].additionalServices).toEqual(['Metformin 500mg']);
    // Verify pharmacy address key matches frontend model
    expect(res.body.bookings[0].pharmacy.formatted_address).toBe('123 Main St');
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

  it('returns 500 when Prisma throws unexpectedly', async () => {
    booking.findMany.mockRejectedValue(new Error('DB connection lost'));

    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(500);
  });

  it('returns null pharmacy when booking has no pharmacy relation', async () => {
    booking.findMany.mockResolvedValue([
      {
        id: 'bk-2', userId: TEST_USER_ID, pharmacyId: 'pharm-1',
        serviceType: 'Transfer Prescription', prescriptionNotes: null,
        status: 'pending', createdAt: new Date(),
        pharmacy: null,
        medications: [],
      },
    ]);

    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.bookings[0].pharmacy).toBeNull();
    expect(res.body.bookings[0].additionalServices).toEqual([]);
  });
});

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
