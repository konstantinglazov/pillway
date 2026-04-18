export interface Pharmacy {
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  place_id: string;
}

// user_id is no longer sent from the frontend — the backend reads it from the JWT.
export interface CreateBooking {
  pharmacy: Pharmacy;
  service_type: string;
  additional_services: string[];
  prescription_notes?: string;
}

export interface BookingCreated {
  success: true;
  booking_id: string;
}

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
