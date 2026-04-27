import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { StepReviewComponent } from './step-review.component';
import { TransferFormService } from '../../transfer-form.service';
import { BookingService } from '../../../../core/services/booking.service';
import { AuthService } from '../../../../core/services/auth.service';

describe('StepReviewComponent', () => {
  let component: StepReviewComponent;
  let fixture: ComponentFixture<StepReviewComponent>;
  let formService: TransferFormService;
  let bookingSpy: jasmine.SpyObj<BookingService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authSpy: jasmine.SpyObj<AuthService>;

  const fillPharmacy = () => {
    formService.sourcePharmacyGroup.patchValue({
      name: 'Test Pharmacy',
      formatted_address: '123 Main St',
      lat: 43.65,
      lng: -79.38,
      place_id: 'pid_1',
    });
  };

  const giveConsent = () => {
    formService.form.get('consented')!.setValue(true);
  };

  beforeEach(async () => {
    bookingSpy = jasmine.createSpyObj('BookingService', ['createBooking']);
    routerSpy  = jasmine.createSpyObj('Router', ['navigate']);
    authSpy    = jasmine.createSpyObj('AuthService', ['getUserInfo', 'getUserInitials']);
    authSpy.getUserInfo.and.returnValue({ fullName: 'Test User', email: 'test@test.com' });
    authSpy.getUserInitials.and.returnValue('TU');

    await TestBed.configureTestingModule({
      declarations: [StepReviewComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        TransferFormService,
        { provide: BookingService, useValue: bookingSpy },
        { provide: Router,         useValue: routerSpy  },
        { provide: AuthService,    useValue: authSpy    },
      ],
    }).compileComponents();

    fixture     = TestBed.createComponent(StepReviewComponent);
    component   = fixture.componentInstance;
    formService = TestBed.inject(TransferFormService);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  describe('summary getters', () => {
    it('pharmacyName reflects sourcePharmacyGroup name', () => {
      fillPharmacy();
      expect(component.pharmacyName).toBe('Test Pharmacy');
    });

    it('pharmacyAddress reflects sourcePharmacyGroup formatted_address', () => {
      fillPharmacy();
      expect(component.pharmacyAddress).toBe('123 Main St');
    });

    it('isTransferAll is true by default', () => {
      expect(component.isTransferAll).toBeTrue();
    });

    it('isTransferAll is false when transferType is "specific"', () => {
      formService.form.get('transferType')!.setValue('specific');
      expect(component.isTransferAll).toBeFalse();
    });

    it('medicationNames returns names from formService', () => {
      formService.addMedication('Aspirin');
      formService.addMedication('Lipitor');
      expect(component.medicationNames).toEqual(['Aspirin', 'Lipitor']);
    });

    it('isConsented is false initially', () => {
      expect(component.isConsented).toBeFalse();
    });

    it('isConsented is true after consent checkbox is checked', () => {
      giveConsent();
      expect(component.isConsented).toBeTrue();
    });
  });

  describe('profile getters', () => {
    it('fullName delegates to AuthService.getUserInfo()', () => {
      expect(component.fullName).toBe('Test User');
    });

    it('initials delegates to AuthService.getUserInitials()', () => {
      expect(component.initials).toBe('TU');
    });
  });

  describe('onBack()', () => {
    it('navigates to /transfer/medication', () => {
      component.onBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/medication']);
    });
  });

  describe('onEditPharmacy()', () => {
    it('navigates to /transfer/pharmacy', () => {
      component.onEditPharmacy();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/pharmacy']);
    });
  });

  describe('onConfirm()', () => {
    beforeEach(() => {
      fillPharmacy();
      giveConsent();
    });

    it('does not call BookingService when not consented', () => {
      formService.form.get('consented')!.setValue(false);
      component.onConfirm();
      expect(bookingSpy.createBooking).not.toHaveBeenCalled();
    });

    it('submits with "Transfer Prescription" as service_type', () => {
      bookingSpy.createBooking.and.returnValue(of({ success: true, booking_id: 'b1' }));
      component.onConfirm();
      const payload = bookingSpy.createBooking.calls.first().args[0];
      expect(payload.service_type).toBe('Transfer Prescription');
    });

    it('sends empty additional_services when transfer type is "all"', () => {
      bookingSpy.createBooking.and.returnValue(of({ success: true, booking_id: 'b1' }));
      component.onConfirm();
      const payload = bookingSpy.createBooking.calls.first().args[0];
      expect(payload.additional_services).toEqual([]);
    });

    it('sends medication names in additional_services when transfer type is "specific"', () => {
      formService.form.get('transferType')!.setValue('specific');
      formService.addMedication('Metformin');
      bookingSpy.createBooking.and.returnValue(of({ success: true, booking_id: 'b1' }));
      component.onConfirm();
      const payload = bookingSpy.createBooking.calls.first().args[0];
      expect(payload.additional_services).toEqual(['Metformin']);
    });

    it('navigates to /confirmation on success', () => {
      bookingSpy.createBooking.and.returnValue(of({ success: true, booking_id: 'b1' }));
      component.onConfirm();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/confirmation']);
    });

    it('shows error message on failure', () => {
      bookingSpy.createBooking.and.returnValue(throwError(() => new Error('Server error')));
      component.onConfirm();
      expect(component.errorMessage).toBe('Server error');
    });

    it('prevents double-submit', () => {
      bookingSpy.createBooking.and.returnValue(of({ success: true, booking_id: 'b1' }));
      component.isSubmitting = true;
      component.onConfirm();
      expect(bookingSpy.createBooking).not.toHaveBeenCalled();
    });

    it('does not include user_id in payload', () => {
      bookingSpy.createBooking.and.returnValue(of({ success: true, booking_id: 'b1' }));
      component.onConfirm();
      const payload = bookingSpy.createBooking.calls.first().args[0];
      expect((payload as any)['user_id']).toBeUndefined();
    });
  });
});
