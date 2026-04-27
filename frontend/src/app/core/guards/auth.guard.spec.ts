import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authSpy   = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy   },
        { provide: Router,      useValue: routerSpy },
      ],
    });
  });

  const run = () =>
    TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

  it('returns true when user is logged in', () => {
    authSpy.isLoggedIn.and.returnValue(true);
    expect(run()).toBeTrue();
  });

  it('returns UrlTree to /login when not logged in', () => {
    authSpy.isLoggedIn.and.returnValue(false);
    const fakeTree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(fakeTree);

    const result = run();

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(fakeTree);
  });
});
