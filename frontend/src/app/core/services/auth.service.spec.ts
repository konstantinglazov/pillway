import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockResponse = {
    success: true as const,
    token: 'jwt-token-abc',
    user: { id: 'u-1', email: 'test@test.com', fullName: 'Test User' },
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service  = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login()', () => {
    it('POSTs to /auth/login and stores the token', () => {
      service.login('test@test.com', 'pass123').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@test.com', password: 'pass123' });
      req.flush(mockResponse);

      expect(service.getToken()).toBe('jwt-token-abc');
    });

    it('isLoggedIn() returns true after successful login', () => {
      service.login('test@test.com', 'pass123').subscribe();
      httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockResponse);

      expect(service.isLoggedIn()).toBeTrue();
    });
  });

  describe('register()', () => {
    it('POSTs to /auth/register with fullName and stores the token', () => {
      service.register('test@test.com', 'pass123', 'Test User').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@test.com', password: 'pass123', fullName: 'Test User' });
      req.flush(mockResponse);

      expect(service.getToken()).toBe('jwt-token-abc');
    });
  });

  describe('logout()', () => {
    it('removes the token and isLoggedIn() returns false', () => {
      service.login('test@test.com', 'pass123').subscribe();
      httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockResponse);

      service.logout();

      expect(service.getToken()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('isLoggedIn()', () => {
    it('returns false when no token is stored', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });
  });
});
