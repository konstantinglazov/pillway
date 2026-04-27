import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StepMedicationComponent } from './step-preferences.component';
import { TransferFormService } from '../../transfer-form.service';

describe('StepMedicationComponent', () => {
  let component: StepMedicationComponent;
  let fixture: ComponentFixture<StepMedicationComponent>;
  let formService: TransferFormService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [StepMedicationComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        TransferFormService,
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture     = TestBed.createComponent(StepMedicationComponent);
    component   = fixture.componentInstance;
    formService = TestBed.inject(TransferFormService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('transferType getter', () => {
    it('returns "all" by default', () => {
      expect(component.transferType).toBe('all');
    });

    it('reflects form value change to "specific"', () => {
      formService.form.get('transferType')!.setValue('specific');
      expect(component.transferType).toBe('specific');
    });
  });

  describe('addMedication()', () => {
    it('adds a trimmed medication name to the form service', () => {
      component.newMedName = '  Metformin 500mg  ';
      component.addMedication();
      expect(formService.medicationNames).toEqual(['Metformin 500mg']);
    });

    it('clears newMedName after adding', () => {
      component.newMedName = 'Aspirin';
      component.addMedication();
      expect(component.newMedName).toBe('');
    });

    it('does nothing when newMedName is blank', () => {
      component.newMedName = '   ';
      component.addMedication();
      expect(formService.medicationNames.length).toBe(0);
    });
  });

  describe('removeMedication()', () => {
    it('removes the medication at the given index', () => {
      formService.addMedication('Med A');
      formService.addMedication('Med B');
      component.removeMedication(0);
      expect(formService.medicationNames).toEqual(['Med B']);
    });
  });

  describe('onNext()', () => {
    it('navigates to /transfer/review when transferType is "all"', () => {
      component.onNext();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/review']);
    });

    it('navigates to /transfer/review when "specific" and medications are added', () => {
      formService.form.get('transferType')!.setValue('specific');
      formService.addMedication('Lipitor');
      component.onNext();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/review']);
    });

    it('shows error and does NOT navigate when "specific" but no medications added', () => {
      formService.form.get('transferType')!.setValue('specific');
      component.onNext();
      expect(component.showError).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onBack()', () => {
    it('navigates to /transfer/confirm', () => {
      component.onBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/transfer/confirm']);
    });
  });
});
