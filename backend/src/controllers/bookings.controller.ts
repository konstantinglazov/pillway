import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

// ---------------------------------------------------------------------------
// Zod validation schemas
// ---------------------------------------------------------------------------

const PharmacySchema = z.object({
  name: z.string().min(1, 'Pharmacy name is required'),
  formatted_address: z.string().min(1, 'Formatted address is required'),
  lat: z.number({ required_error: 'Latitude is required' }),
  lng: z.number({ required_error: 'Longitude is required' }),
  place_id: z.string().min(1, 'Google place_id is required'),
});

const CreateBookingSchema = z.object({
  user_id: z.string().uuid('user_id must be a valid UUID'),
  pharmacy: PharmacySchema,
  service_type: z.string().min(1, 'service_type is required'),
  additional_services: z.array(z.string()).optional().default([]),
  prescription_notes: z.string().optional(),
});

type CreateBookingBody = z.infer<typeof CreateBookingSchema>;

// ---------------------------------------------------------------------------
// Prisma result types (inferred from the schema for full type safety)
// ---------------------------------------------------------------------------

/** Booking row with the nested Pharmacy relation included. */
type BookingWithPharmacy = Prisma.BookingGetPayload<{
  include: { pharmacy: { select: { name: true; formattedAddress: true } } };
}>;

// ---------------------------------------------------------------------------
// Controller functions
// ---------------------------------------------------------------------------

/**
 * POST /api/bookings
 *
 * 1. Validates the request body with Zod.
 * 2. Upserts the Pharmacy by placeId — avoids duplicates when multiple users
 *    select the same pharmacy.
 * 3. Creates the Booking linked to the resolved Pharmacy and the caller's
 *    Profile (user_id comes from the validated body, sourced from the
 *    Supabase session on the Angular side).
 */
export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body: CreateBookingBody = CreateBookingSchema.parse(req.body);

    // Step 1: Upsert Pharmacy — idempotent on placeId.
    const pharmacy = await prisma.pharmacy.upsert({
      where: { placeId: body.pharmacy.place_id },
      update: {}, // no fields to update if the pharmacy already exists
      create: {
        name: body.pharmacy.name,
        formattedAddress: body.pharmacy.formatted_address,
        lat: body.pharmacy.lat,
        lng: body.pharmacy.lng,
        placeId: body.pharmacy.place_id,
      },
      select: { id: true },
    });

    // Step 2: Create Booking linked to the Profile and Pharmacy.
    const booking = await prisma.booking.create({
      data: {
        userId: body.user_id,
        pharmacyId: pharmacy.id,
        serviceType: body.service_type,
        additionalServices: body.additional_services,
        prescriptionNotes: body.prescription_notes ?? null,
        status: 'pending',
      },
      select: { id: true },
    });

    res.status(201).json({ success: true, booking_id: booking.id });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/:userId
 *
 * Returns all Booking rows for the user, including the related Pharmacy's
 * name and address.  Results are ordered newest-first.
 */
export async function getBookingsByUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ success: false, message: 'userId param is required' });
      return;
    }

    const bookings: BookingWithPharmacy[] = await prisma.booking.findMany({
      where: { userId },
      include: {
        pharmacy: {
          select: { name: true, formattedAddress: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
}
