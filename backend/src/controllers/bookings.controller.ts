import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

const PharmacySchema = z.object({
  name:              z.string().min(1, 'Pharmacy name is required'),
  formatted_address: z.string().min(1, 'Formatted address is required'),
  lat:               z.number({ required_error: 'Latitude is required' }),
  lng:               z.number({ required_error: 'Longitude is required' }),
  place_id:          z.string().min(1, 'Google place_id is required'),
});

// user_id is no longer in the body — it comes from the JWT via req.userId.
const CreateBookingSchema = z.object({
  pharmacy:             PharmacySchema,
  service_type:         z.string().min(1, 'service_type is required'),
  additional_services:  z.array(z.string()).optional().default([]),
  prescription_notes:   z.string().optional(),
});

type CreateBookingBody = z.infer<typeof CreateBookingSchema>;

type BookingWithPharmacy = Prisma.BookingGetPayload<{
  include: { pharmacy: { select: { name: true; formattedAddress: true } } };
}>;

/** POST /api/bookings — requires authenticate middleware */
export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body: CreateBookingBody = CreateBookingSchema.parse(req.body);
    const userId = req.userId!;

    const pharmacy = await prisma.pharmacy.upsert({
      where:  { placeId: body.pharmacy.place_id },
      update: {},
      create: {
        name:             body.pharmacy.name,
        formattedAddress: body.pharmacy.formatted_address,
        lat:              body.pharmacy.lat,
        lng:              body.pharmacy.lng,
        placeId:          body.pharmacy.place_id,
      },
      select: { id: true },
    });

    const booking = await prisma.booking.create({
      data: {
        userId,
        pharmacyId:          pharmacy.id,
        serviceType:         body.service_type,
        additionalServices:  body.additional_services,
        prescriptionNotes:   body.prescription_notes ?? null,
        status:              'pending',
      },
      select: { id: true },
    });

    res.status(201).json({ success: true, booking_id: booking.id });
  } catch (err) {
    next(err);
  }
}

/** GET /api/bookings — returns bookings for the authenticated user */
export async function getBookings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const bookings: BookingWithPharmacy[] = await prisma.booking.findMany({
      where:   { userId: req.userId! },
      include: { pharmacy: { select: { name: true, formattedAddress: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
}
