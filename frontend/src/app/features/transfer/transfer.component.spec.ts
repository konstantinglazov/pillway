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

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/transfer/preferences' });
    authSpy   = jasmine.createSpyObj('AuthService', ['logout']);

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
  });

  it('should create', () => expect(component).toBeTruthy());
  it('has 3 steps', () => expect(component.steps.length).toBe(3));

  describe('isActive()', () => {
    it('returns true when URL contains the step path', () => expect(component.isActive('preferences')).toBeTrue());
    it('returns false when URL does not contain the step path', () => expect(component.isActive('location')).toBeFalse());
  });

  describe('isCompleted()', () => {
    it('returns false for the active step', () => expect(component.isCompleted(0)).toBeFalse());
    it('returns false for steps after the active step', () => expect(component.isCompleted(1)).toBeFalse());
  });

  describe('logout()', () => {
    it('calls authService.logout() and navigates to /login', () => {
      component.logout();
      expect(authSpy.logout).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
