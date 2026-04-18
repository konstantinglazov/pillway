import { fakeAsync, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookingService } from './booking.service';
import { environment } from '../../../environments/environment';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  const mockPharmacy = {
    name: 'Test Pharmacy',
    formatted_address: '123 Main St, Toronto, ON',
    lat: 43.65,
    lng: -79.38,
    place_id: 'place_abc',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookingService],
    });

    service  = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('createBooking()', () => {
    it('POSTs to /api/bookings — JWT is added by the interceptor, not this service', fakeAsync(() => {
      let result: unknown;

      service.createBooking({
        pharmacy:            mockPharmacy,
        service_type:        'Transfer Prescription',
        additional_services: ['Delivery'],
      }).subscribe(r => (result = r));

      const req = httpMock.expectOne(`${environment.apiUrl}/api/bookings`);
      expect(req.request.method).toBe('POST');
      // user_id is no longer in the body
      expect(req.request.body['user_id']).toBeUndefined();
      req.flush({ success: true, booking_id: 'bk-1' });

      expect(result).toEqual(jasmine.objectContaining({ success: true }));
    }));

    it('maps the server error message on HTTP failure', fakeAsync(() => {
      let errorMsg = '';

      service.createBooking({
        pharmacy:            mockPharmacy,
        service_type:        'Refill',
        additional_services: [],
      }).subscribe({ error: (err: Error) => (errorMsg = err.message) });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/bookings`);
      req.flush({ message: 'Duplicate booking' }, { status: 409, statusText: 'Conflict' });

      expect(errorMsg).toBe('Duplicate booking');
    }));
  });

  describe('getBookings()', () => {
    it('GETs /api/bookings', fakeAsync(() => {
      const mockResponse = { success: true, bookings: [] };
      let result: unknown;

      service.getBookings().subscribe(r => (result = r));

      const req = httpMock.expectOne(`${environment.apiUrl}/api/bookings`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(result).toEqual(mockResponse as any);
    }));
  });
});
