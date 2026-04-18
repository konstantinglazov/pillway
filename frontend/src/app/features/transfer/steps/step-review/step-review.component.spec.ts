import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { StepReviewComponent } from './step-review.component';
import { TransferFormService } from '../../transfer-form.service';
import { BookingService } from '../../../../core/services/booking.service';

describe('StepReviewComponent', () => {
  let component: StepReviewComponent;
  let fixture: ComponentFixture<StepReviewComponent>;
  let formService: TransferFormService;
  let bookingSpy: jasmine.SpyObj<BookingService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const fillForm = () => {
    formService.form.get('serviceType')!.setValue('Transfer Prescription');
    formService.form.get('prescriptionNotes')!.setValue('Brand X only');
    formService.pharmacyGroup.patchValue({
      name: 'Test Pharmacy', formatted_address: '123 Main St',
      lat: 43.65, lng: -79.38, place_id: 'pid_1',
    });
    formService.additionalServicesArray.at(0).setValue(true);
  };

  beforeEach(async () => {
    bookingSpy = jasmine.createSpyObj('BookingService', ['createBooking']);
    routerSpy  = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [StepReviewComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        TransferFormService,
        { provide: BookingService, useValue: bookingSpy },
        { provide: Router,         useValue: routerSpy  },
      ],
    }).compileComponents();

    fixture     = TestBed.createComponent(StepReviewComponent);
    component   = fixture.componentInstance;
    formService = TestBed.inject(TransferFormService);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  describe('summary display', () => {
    it('reflects current form values', () => {
      fillForm();
      fixture.detectChanges();
      expect(component.serviceType).toBe('Transfer Prescription');
      expect(component.prescriptionNotes).toBe('Brand X only');
      expect(component.pharmacy?.name).toBe('Test Pharmacy');
      expect(component.selectedServicesDisplay).toBe('Blister Pack');
    });

    it('shows "None" when no add-ons are selected', () => {
      expect(component.selectedServicesDisplay).toBe('None');
    });
  });

  describe('onBack()', () => {
    it('navigates to /transfer/location', () => {
      component.onBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/location']);
    });
  });

  describe('onConfirm()', () => {
    beforeEach(() => fillForm());

    it('calls BookingService.createBooking without user_id in payload', () => {
      bookingSpy.createBooking.and.returnValue(of({ success: true } as any));
      component.onConfirm();
      const payload = bookingSpy.createBooking.calls.first().args[0];
      expect((payload as any)['user_id']).toBeUndefined();
      expect(payload.service_type).toBe('Transfer Prescription');
    });

    it('shows success banner and navigates after 2s', fakeAsync(() => {
      bookingSpy.createBooking.and.returnValue(of({ success: true } as any));
      component.onConfirm();
      expect(component.showSuccess).toBeTrue();
      tick(2000);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/confirmation']);
    }));

    it('shows error message on failure', () => {
      bookingSpy.createBooking.and.returnValue(throwError(() => new Error('Server error')));
      component.onConfirm();
      expect(component.errorMessage).toBe('Server error');
    });

    it('prevents double-submit', () => {
      bookingSpy.createBooking.and.returnValue(of({ success: true } as any));
      component.isSubmitting = true;
      component.onConfirm();
      expect(bookingSpy.createBooking).not.toHaveBeenCalled();
    });
  });
});
