import { Router } from 'express';
import { createBooking, getBookingsByUser } from '../controllers/bookings.controller';

/**
 * Bookings router.
 *
 * Mounted at /api/bookings in src/index.ts.
 *
 * Routes:
 *   POST /api/bookings           — create a prescription transfer booking
 *   GET  /api/bookings/:userId   — fetch all bookings for a user
 */
export const bookingsRouter: Router = Router();

bookingsRouter.post('/', createBooking);
bookingsRouter.get('/:userId', getBookingsByUser);
