import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TransferComponent } from './transfer.component';
import { AuthService } from '../../core/services/auth.service';

describe('TransferComponent', () => {
  let component: TransferComponent;
  let fixture: ComponentFixture<TransferComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authSpy: jasmine.SpyObj<AuthService>;

  const makeRouter = (url: string) =>
    jasmine.createSpyObj<Router>('Router', ['navigate'], { url });

  const makeAuth = () =>
    jasmine.createSpyObj<AuthService>('AuthService', ['getUserInitials', 'getUserInfo', 'logout']);

  const setup = async (url = '/transfer/intro') => {
    routerSpy = makeRouter(url);
    authSpy   = makeAuth();
    authSpy.getUserInitials.and.returnValue('JD');
    authSpy.getUserInfo.and.returnValue({ fullName: 'John Doe', email: 'john@example.com' });

    await TestBed.configureTestingModule({
      declarations: [TransferComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router,      useValue: routerSpy },
        { provide: AuthService, useValue: authSpy   },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(TransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  describe('initials', () => {
    it('delegates to AuthService.getUserInitials()', async () => {
      await setup();
      expect(component.initials).toBe('JD');
    });
  });

  describe('isIntro', () => {
    it('is true when URL segment is "intro"', async () => {
      await setup('/transfer/intro');
      expect(component.isIntro).toBeTrue();
    });

    it('is true when URL segment is "select-profile"', async () => {
      await setup('/transfer/select-profile');
      expect(component.isIntro).toBeTrue();
    });

    it('is false when URL segment is "pharmacy"', async () => {
      await setup('/transfer/pharmacy');
      expect(component.isIntro).toBeFalse();
    });
  });

  describe('currentStep', () => {
    it('returns step num 1 for "pharmacy"', async () => {
      await setup('/transfer/pharmacy');
      expect(component.currentStep.num).toBe(1);
      expect(component.currentStep.label).toBe('Choose pharmacy');
    });

    it('returns step num 1 for "confirm"', async () => {
      await setup('/transfer/confirm');
      expect(component.currentStep.num).toBe(1);
    });

    it('returns step num 2 for "medication"', async () => {
      await setup('/transfer/medication');
      expect(component.currentStep.num).toBe(2);
      expect(component.currentStep.label).toBe('Select medications');
    });

    it('returns step num 3 for "review"', async () => {
      await setup('/transfer/review');
      expect(component.currentStep.num).toBe(3);
      expect(component.currentStep.label).toBe('Review & submit');
    });
  });

  describe('progressPct', () => {
    it('is 33% on step 1', async () => {
      await setup('/transfer/pharmacy');
      expect(component.progressPct).toBe(33);
    });

    it('is 67% on step 2', async () => {
      await setup('/transfer/medication');
      expect(component.progressPct).toBe(67);
    });

    it('is 100% on step 3', async () => {
      await setup('/transfer/review');
      expect(component.progressPct).toBe(100);
    });
  });

  describe('currentStep for select-profile', () => {
    it('has step num 0 and empty label', async () => {
      await setup('/transfer/select-profile');
      expect(component.currentStep.num).toBe(0);
      expect(component.currentStep.label).toBe('');
    });
  });

  describe('userFullName / userEmail', () => {
    it('userFullName delegates to AuthService.getUserInfo()', async () => {
      await setup();
      expect(component.userFullName).toBe('John Doe');
    });

    it('userEmail delegates to AuthService.getUserInfo()', async () => {
      await setup();
      expect(component.userEmail).toBe('john@example.com');
    });

    it('userFullName falls back to "User" when getUserInfo() returns null', async () => {
      await setup();
      authSpy.getUserInfo.and.returnValue(null);
      expect(component.userFullName).toBe('User');
    });
  });

  describe('toggleDropdown()', () => {
    it('opens the dropdown on first call', async () => {
      await setup();
      const event = new MouseEvent('click');
      component.toggleDropdown(event);
      expect(component.dropdownOpen).toBeTrue();
    });

    it('closes the dropdown on second call', async () => {
      await setup();
      const event = new MouseEvent('click');
      component.toggleDropdown(event);
      component.toggleDropdown(event);
      expect(component.dropdownOpen).toBeFalse();
    });
  });

  describe('closeDropdown()', () => {
    it('sets dropdownOpen to false', async () => {
      await setup();
      component.dropdownOpen = true;
      component.closeDropdown();
      expect(component.dropdownOpen).toBeFalse();
    });
  });

  describe('logout()', () => {
    it('calls AuthService.logout()', async () => {
      await setup();
      component.logout();
      expect(authSpy.logout).toHaveBeenCalled();
    });

    it('navigates to /login', async () => {
      await setup();
      component.logout();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('closes the dropdown', async () => {
      await setup();
      component.dropdownOpen = true;
      component.logout();
      expect(component.dropdownOpen).toBeFalse();
    });
  });

  describe('goBack()', () => {
    it('navigates to the back route for the current step', async () => {
      await setup('/transfer/confirm');
      component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/pharmacy']);
    });

    it('navigates to /dashboard from intro', async () => {
      await setup('/transfer/intro');
      component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('navigates to /transfer/intro from select-profile', async () => {
      await setup('/transfer/select-profile');
      component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/intro']);
    });

    it('navigates to /transfer/select-profile from pharmacy', async () => {
      await setup('/transfer/pharmacy');
      component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/select-profile']);
    });
  });
});
