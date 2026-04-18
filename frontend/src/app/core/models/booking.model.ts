// ---------------------------------------------------------------------------
// Pharmacy
// Matches the Prisma Pharmacy model fields sent from the Angular form.
// ---------------------------------------------------------------------------

/** Pharmacy fields collected from the Google Places Autocomplete widget. */
export interface Pharmacy {
  name: string;
  /** Maps to Prisma's `formattedAddress` field (camelCase in Prisma, snake_case over the wire). */
  formatted_address: string;
  lat: number;
  lng: number;
  /** Google Places unique identifier — used as the upsert key on the backend. */
  place_id: string;
}

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------

/**
 * Payload sent to POST /api/bookings.
 * `user_id` is appended by BookingService from the live Supabase session —
 * it is NEVER sourced from user input.
 */
export interface CreateBooking {
  user_id: string;
  pharmacy: Pharmacy;
  service_type: string;
  additional_services: string[];
  prescription_notes?: string;
}

/** Response shape returned by POST /api/bookings on success. */
export interface BookingCreated {
  success: true;
  booking_id: string;
}

/**
 * Booking row as returned by GET /api/bookings/:userId.
 * Mirrors Prisma's BookingWithPharmacy type from the backend.
 */
export interface BookingWithPharmacy {
  id: string;
  userId: string;
  pharmacyId: string;
  serviceType: string;
  additionalServices: string[];
  prescriptionNotes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  pharmacy: Pick<Pharmacy, 'name' | 'formatted_address'> | null;
}
