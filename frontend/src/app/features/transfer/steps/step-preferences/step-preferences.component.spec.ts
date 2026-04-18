import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StepPreferencesComponent } from './step-preferences.component';
import { TransferFormService } from '../../transfer-form.service';

describe('StepPreferencesComponent', () => {
  let component: StepPreferencesComponent;
  let fixture: ComponentFixture<StepPreferencesComponent>;
  let formService: TransferFormService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [StepPreferencesComponent],
      imports: [ReactiveFormsModule, NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        TransferFormService,
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture     = TestBed.createComponent(StepPreferencesComponent);
    component   = fixture.componentInstance;
    formService = TestBed.inject(TransferFormService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes 3 serviceOptions', () => {
    expect(component.serviceOptions.length).toBe(3);
  });

  describe('additionalServicesControls', () => {
    it('returns controls from the formService array', () => {
      expect(component.additionalServicesControls.length)
        .toBe(formService.additionalServiceOptions.length);
    });
  });

  describe('onNext()', () => {
    it('shows error and marks serviceType touched when step is invalid', () => {
      component.onNext();

      expect(component.showError).toBeTrue();
      expect(formService.form.get('serviceType')!.touched).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('navigates to /transfer/location when step is valid', () => {
      formService.form.get('serviceType')!.setValue('Refill');

      component.onNext();

      expect(component.showError).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/location']);
    });
  });
});
