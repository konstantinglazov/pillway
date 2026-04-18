import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authSpy   = jasmine.createSpyObj('AuthService', ['login', 'register']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy   },
        { provide: Router,      useValue: routerSpy },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  describe('tab switching', () => {
    it('starts in sign-in mode', () => expect(component.isSignUp).toBeFalse());

    it('setMode(true) switches to sign-up', () => {
      component.setMode(true);
      expect(component.isSignUp).toBeTrue();
    });

    it('setMode() resets the form and clears error', () => {
      component.form.get('email')!.setValue('a@b.com');
      component.errorMessage = 'oops';
      component.setMode(false);
      expect(component.form.get('email')!.value).toBeNull();
      expect(component.errorMessage).toBe('');
    });
  });

  describe('form validation', () => {
    it('isInvalid returns false when field is untouched', () => {
      expect(component.isInvalid('email')).toBeFalse();
    });

    it('isInvalid returns true for invalid touched field', () => {
      const ctrl = component.form.get('email')!;
      ctrl.setValue('not-an-email');
      ctrl.markAsTouched();
      expect(component.isInvalid('email')).toBeTrue();
    });

    it('onSubmit marks all fields touched when form is invalid', () => {
      component.onSubmit();
      expect(component.form.get('email')!.touched).toBeTrue();
    });

    it('onSubmit does not call login when form is invalid', () => {
      component.onSubmit();
      expect(authSpy.login).not.toHaveBeenCalled();
    });
  });

  describe('sign in', () => {
    beforeEach(() => {
      component.form.setValue({ fullName: '', email: 'user@test.com', password: 'secret123' });
    });

    it('navigates to /transfer on success', () => {
      authSpy.login.and.returnValue(of(undefined as any));
      component.onSubmit();
      expect(authSpy.login).toHaveBeenCalledWith('user@test.com', 'secret123');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer']);
    });

    it('sets errorMessage on failure', () => {
      authSpy.login.and.returnValue(throwError(() => new Error('Invalid email or password')));
      component.onSubmit();
      expect(component.errorMessage).toBe('Invalid email or password');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('sign up', () => {
    beforeEach(() => {
      component.setMode(true);
      component.form.setValue({ fullName: 'Jane Smith', email: 'jane@test.com', password: 'pass1234' });
    });

    it('calls register with full name', () => {
      authSpy.register.and.returnValue(of(undefined as any));
      component.onSubmit();
      expect(authSpy.register).toHaveBeenCalledWith('jane@test.com', 'pass1234', 'Jane Smith');
    });

    it('navigates to /transfer on success', () => {
      authSpy.register.and.returnValue(of(undefined as any));
      component.onSubmit();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer']);
    });
  });
});
