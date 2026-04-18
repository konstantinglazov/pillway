import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';
import { CreateBooking, BookingCreated, BookingWithPharmacy } from '../models/booking.model';

interface BookingListResponse {
  success: true;
  bookings: BookingWithPharmacy[];
}

/**
 * HTTP service that communicates with the Express/Prisma backend for all
 * booking operations.  The Angular frontend never writes to the database
 * directly — all mutations go through Express where the Prisma client runs.
 */
@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly supabaseService: SupabaseService
  ) {}

  /**
   * Submits a prescription transfer booking.
   *
   * 1. Reads the authenticated user's UUID from the live Supabase session.
   *    The `user_id` always comes from the real session — never hardcoded.
   * 2. Attaches `user_id` to the payload.
   * 3. POSTs to /api/bookings and returns the BookingCreated response.
   */
  createBooking(
    data: Omit<CreateBooking, 'user_id'>
  ): Observable<BookingCreated> {
    return from(this.supabaseService.getSession()).pipe(
      switchMap((session) => {
        if (!session?.user?.id) {
          return throwError(() => new Error('User is not authenticated'));
        }

        const payload: CreateBooking = { ...data, user_id: session.user.id };

        return this.http.post<BookingCreated>(
          `${this.apiUrl}/api/bookings`,
          payload
        );
      }),
      catchError((err: HttpErrorResponse | Error) => {
        const message =
          err instanceof HttpErrorResponse
            ? (err.error?.message ?? err.message)
            : err.message;
        return throwError(() => new Error(message));
      })
    );
  }

  /** Fetches all Booking rows for the given user, with Pharmacy included. */
  getBookings(userId: string): Observable<BookingListResponse> {
    return this.http
      .get<BookingListResponse>(`${this.apiUrl}/api/bookings/${userId}`)
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(
            () => new Error(err.error?.message ?? 'Failed to load bookings')
          )
        )
      );
  }
}
