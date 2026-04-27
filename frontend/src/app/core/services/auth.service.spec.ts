import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

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

    it('returns false and calls logout() when stored token is expired', () => {
      // Build a token whose exp is 1 second in the past
      const past = Math.floor(Date.now() / 1000) - 1;
      const payload = { sub: 'u-1', email: 'x@x.com', exp: past };
      const b64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      localStorage.setItem('pw_token', `h.${b64}.s`);

      spyOn(service, 'logout').and.callThrough();
      expect(service.isLoggedIn()).toBeFalse();
      expect(service.logout).toHaveBeenCalled();
    });

    it('returns false when stored token has malformed base64', () => {
      localStorage.setItem('pw_token', 'not.a.jwt-payload');
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('getUserInfo()', () => {
    it('returns null when no token is stored', () => {
      expect(service.getUserInfo()).toBeNull();
    });

    it('decodes email and fullName from a stored token', () => {
      const payload = { sub: 'u-1', email: 'alice@example.com', fullName: 'Alice Smith' };
      const b64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      localStorage.setItem('pw_token', `h.${b64}.s`);

      const info = service.getUserInfo();
      expect(info).toEqual({ email: 'alice@example.com', fullName: 'Alice Smith' });
    });

    it('returns fullName as null when not present in token', () => {
      const payload = { sub: 'u-1', email: 'bob@example.com' };
      const b64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      localStorage.setItem('pw_token', `h.${b64}.s`);

      const info = service.getUserInfo();
      expect(info?.fullName).toBeNull();
    });
  });

  describe('getUserInitials()', () => {
    it('returns "Me" when no token is stored', () => {
      expect(service.getUserInitials()).toBe('Me');
    });

    it('returns first letters of each name part (up to 2)', () => {
      const payload = { sub: 'u-1', email: 'j@j.com', fullName: 'John Doe' };
      const b64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      localStorage.setItem('pw_token', `h.${b64}.s`);
      expect(service.getUserInitials()).toBe('JD');
    });

    it('falls back to first 2 chars of email when fullName is absent', () => {
      const payload = { sub: 'u-1', email: 'alice@example.com' };
      const b64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      localStorage.setItem('pw_token', `h.${b64}.s`);
      expect(service.getUserInitials()).toBe('AL');
    });
  });
});
