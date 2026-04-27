import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StepSelectProfileComponent } from './step-select-profile.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('StepSelectProfileComponent', () => {
  let component: StepSelectProfileComponent;
  let fixture: ComponentFixture<StepSelectProfileComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authSpy   = jasmine.createSpyObj('AuthService', ['getUserInfo', 'getUserInitials']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    authSpy.getUserInfo.and.returnValue({ fullName: 'John Doe', email: 'john@example.com' });
    authSpy.getUserInitials.and.returnValue('JD');

    await TestBed.configureTestingModule({
      declarations: [StepSelectProfileComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AuthService, useValue: authSpy   },
        { provide: Router,      useValue: routerSpy },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(StepSelectProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  describe('profile getters', () => {
    it('fullName comes from AuthService.getUserInfo()', () => {
      expect(component.fullName).toBe('John Doe');
    });

    it('email comes from AuthService.getUserInfo()', () => {
      expect(component.email).toBe('john@example.com');
    });

    it('initials comes from AuthService.getUserInitials()', () => {
      expect(component.initials).toBe('JD');
    });

    it('fullName falls back to "User" when getUserInfo() returns null', () => {
      authSpy.getUserInfo.and.returnValue(null);
      expect(component.fullName).toBe('User');
    });

    it('email falls back to empty string when getUserInfo() returns null', () => {
      authSpy.getUserInfo.and.returnValue(null);
      expect(component.email).toBe('');
    });
  });

  describe('onContinue()', () => {
    it('navigates to /transfer/pharmacy', () => {
      component.onContinue();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/pharmacy']);
    });
  });
});
