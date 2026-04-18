import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreateBooking, BookingCreated, BookingWithPharmacy } from '../models/booking.model';

interface BookingListResponse {
  success: true;
  bookings: BookingWithPharmacy[];
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  // The JWT interceptor automatically adds the Authorization header —
  // no need to read the session manually.
  createBooking(data: CreateBooking): Observable<BookingCreated> {
    return this.http
      .post<BookingCreated>(`${this.apiUrl}/api/bookings`, data)
      .pipe(catchError(this.mapError));
  }

  getBookings(): Observable<BookingListResponse> {
    return this.http
      .get<BookingListResponse>(`${this.apiUrl}/api/bookings`)
      .pipe(catchError(this.mapError));
  }

  private mapError(err: HttpErrorResponse): Observable<never> {
    const message = err.error?.message ?? err.message;
    return throwError(() => new Error(message));
  }
}
