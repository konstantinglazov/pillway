import { Router } from 'express';
import { createBooking, getBookings } from '../controllers/bookings.controller';
import { authenticate } from '../middleware/authenticate';

export const bookingsRouter: Router = Router();

bookingsRouter.post('/',  authenticate, createBooking);
bookingsRouter.get('/',   authenticate, getBookings);
