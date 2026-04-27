import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BookingStatus } from '@prisma/client';
import { prisma } from '../config/prisma';

const PharmacySchema = z.object({
  name:              z.string().min(1, 'Pharmacy name is required'),
  formatted_address: z.string().min(1, 'Formatted address is required'),
  lat:               z.number({ required_error: 'Latitude is required' }).min(-90).max(90),
  lng:               z.number({ required_error: 'Longitude is required' }).min(-180).max(180),
  place_id:          z.string().min(1, 'Google place_id is required'),
});

// user_id is not accepted in the body — it comes from the JWT via req.userId.
const CreateBookingSchema = z.object({
  pharmacy:            PharmacySchema,
  service_type:        z.string().min(1, 'service_type is required'),
  additional_services: z.array(z.string()).optional().default([]),
  prescription_notes:  z.string().optional(),
});

type CreateBookingBody = z.infer<typeof CreateBookingSchema>;

/** POST /api/bookings — requires authenticate middleware */
export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body: CreateBookingBody = CreateBookingSchema.parse(req.body);
    const userId = req.userId!;

    // Upsert pharmacy by place_id so the same location is never duplicated.
    const pharmacy = await prisma.pharmacy.upsert({
      where:  { placeId: body.pharmacy.place_id },
      update: {
        name:             body.pharmacy.name,
        formattedAddress: body.pharmacy.formatted_address,
        lat:              body.pharmacy.lat,
        lng:              body.pharmacy.lng,
      },
      create: {
        name:             body.pharmacy.name,
        formattedAddress: body.pharmacy.formatted_address,
        lat:              body.pharmacy.lat,
        lng:              body.pharmacy.lng,
        placeId:          body.pharmacy.place_id,
      },
      select: { id: true },
    });

    // Medications are stored in the booking_medications child table so the
    // schema uses proper MySQL foreign keys instead of a PG array column.
    const booking = await prisma.booking.create({
      data: {
        userId,
        pharmacyId:       pharmacy.id,
        serviceType:      body.service_type,
        prescriptionNotes: body.prescription_notes ?? null,
        status:           BookingStatus.pending,
        medications: {
          create: body.additional_services.map(name => ({ medicationName: name })),
        },
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
    const rows = await prisma.booking.findMany({
      where:   { userId: req.userId! },
      include: {
        pharmacy:    { select: { name: true, formattedAddress: true } },
        medications: { select: { medicationName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Flatten medications back to a string array to keep the API contract
    // compatible with the frontend BookingWithPharmacy model.
    const bookings = rows.map(b => ({
      id:                b.id,
      userId:            b.userId,
      pharmacyId:        b.pharmacyId,
      serviceType:       b.serviceType,
      additionalServices: b.medications.map(m => m.medicationName),
      prescriptionNotes: b.prescriptionNotes,
      status:            b.status,
      createdAt:         b.createdAt,
      pharmacy:          b.pharmacy
        ? { name: b.pharmacy.name, formatted_address: b.pharmacy.formattedAddress }
        : null,
    }));

    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
}
