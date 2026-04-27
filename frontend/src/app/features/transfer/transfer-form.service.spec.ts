import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TransferFormService } from './transfer-form.service';

describe('TransferFormService', () => {
  let service: TransferFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [TransferFormService],
    });
    service = TestBed.inject(TransferFormService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('form starts invalid (pharmacy + consent not yet set)', () => {
      expect(service.form.invalid).toBeTrue();
    });

    it('transferType defaults to "all"', () => {
      expect(service.form.get('transferType')!.value).toBe('all');
    });

    it('medicationsArray starts empty', () => {
      expect(service.medicationsArray.length).toBe(0);
    });

    it('consented defaults to false', () => {
      expect(service.form.get('consented')!.value).toBeFalse();
    });
  });

  describe('sourcePharmacyGroup', () => {
    it('exposes the pharmacy sub-group', () => {
      expect(service.sourcePharmacyGroup).toBeTruthy();
      expect(service.sourcePharmacyGroup.contains('name')).toBeTrue();
      expect(service.sourcePharmacyGroup.contains('lat')).toBeTrue();
      expect(service.sourcePharmacyGroup.contains('place_id')).toBeTrue();
    });
  });

  describe('addMedication / removeMedication / medicationNames', () => {
    it('adds a medication name', () => {
      service.addMedication('Metformin 500mg');
      expect(service.medicationNames).toEqual(['Metformin 500mg']);
    });

    it('adds multiple medications', () => {
      service.addMedication('Med A');
      service.addMedication('Med B');
      expect(service.medicationNames).toEqual(['Med A', 'Med B']);
    });

    it('removes a medication by index', () => {
      service.addMedication('Med A');
      service.addMedication('Med B');
      service.removeMedication(0);
      expect(service.medicationNames).toEqual(['Med B']);
    });
  });

  describe('getStepValid()', () => {
    it('step 1 is invalid when sourcePharmacy is empty', () => {
      expect(service.getStepValid(1)).toBeFalse();
    });

    it('step 1 is valid when all pharmacy fields are filled', () => {
      service.sourcePharmacyGroup.patchValue({
        name: 'Test Pharmacy',
        formatted_address: '123 Main St',
        lat: 43.65,
        lng: -79.38,
        place_id: 'place_123',
      });
      expect(service.getStepValid(1)).toBeTrue();
    });

    it('step 2 is valid when transferType is set (defaults to "all")', () => {
      expect(service.getStepValid(2)).toBeTrue();
    });

    it('step 2 is invalid if transferType is cleared', () => {
      service.form.get('transferType')!.setValue('');
      expect(service.getStepValid(2)).toBeFalse();
    });

    it('step 3 is invalid before consent', () => {
      expect(service.getStepValid(3)).toBeFalse();
    });

    it('step 3 is valid after consent is given', () => {
      service.form.get('consented')!.setValue(true);
      expect(service.getStepValid(3)).toBeTrue();
    });
  });

  describe('reset()', () => {
    beforeEach(() => {
      service.sourcePharmacyGroup.patchValue({
        name: 'Demo', formatted_address: 'Addr', lat: 1, lng: 2, place_id: 'pid',
      });
      service.addMedication('Med X');
      service.form.get('notes')!.setValue('Some notes');
      service.form.get('consented')!.setValue(true);
      service.form.get('transferType')!.setValue('specific');
    });

    it('clears all pharmacy fields', () => {
      service.reset();
      expect(service.sourcePharmacyGroup.get('name')!.value).toBe('');
      expect(service.sourcePharmacyGroup.get('place_id')!.value).toBe('');
      expect(service.sourcePharmacyGroup.get('lat')!.value).toBeNull();
    });

    it('clears medications array', () => {
      service.reset();
      expect(service.medicationsArray.length).toBe(0);
    });

    it('resets transferType to "all"', () => {
      service.reset();
      expect(service.form.get('transferType')!.value).toBe('all');
    });

    it('clears notes', () => {
      service.reset();
      expect(service.form.get('notes')!.value).toBe('');
    });

    it('resets consented to false', () => {
      service.reset();
      expect(service.form.get('consented')!.value).toBeFalse();
    });

    it('leaves form invalid after reset', () => {
      service.reset();
      expect(service.form.invalid).toBeTrue();
    });
  });

  describe('formValue$', () => {
    it('emits when form value changes', done => {
      service.formValue$.subscribe(value => {
        expect(value).toBeTruthy();
        done();
      });
      service.form.get('notes')!.setValue('hello');
    });
  });
});
