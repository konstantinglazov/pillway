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
    it('form starts invalid', () => {
      expect(service.form.invalid).toBeTrue();
    });

    it('additionalServicesArray has one control per option, all false', () => {
      const arr = service.additionalServicesArray;
      expect(arr.length).toBe(service.additionalServiceOptions.length);
      arr.controls.forEach(ctrl => expect(ctrl.value).toBeFalse());
    });
  });

  describe('getStepValid()', () => {
    it('step 1 is invalid when serviceType is empty', () => {
      expect(service.getStepValid(1)).toBeFalse();
    });

    it('step 1 is valid after setting serviceType', () => {
      service.form.get('serviceType')!.setValue('Transfer Prescription');
      expect(service.getStepValid(1)).toBeTrue();
    });

    it('step 2 is invalid when pharmacy group is empty', () => {
      expect(service.getStepValid(2)).toBeFalse();
    });

    it('step 2 is valid when all pharmacy fields are filled', () => {
      service.pharmacyGroup.patchValue({
        name: 'Test Pharmacy',
        formatted_address: '123 Main St',
        lat: 43.65,
        lng: -79.38,
        place_id: 'place_123',
      });
      expect(service.getStepValid(2)).toBeTrue();
    });

    it('step 3 requires both serviceType and pharmacy to be valid', () => {
      expect(service.getStepValid(3)).toBeFalse();

      service.form.get('serviceType')!.setValue('Refill');
      service.pharmacyGroup.patchValue({
        name: 'P', formatted_address: 'A', lat: 1, lng: 2, place_id: 'x',
      });
      expect(service.getStepValid(3)).toBeTrue();
    });
  });

  describe('getSelectedServices()', () => {
    it('returns empty array when no services are checked', () => {
      expect(service.getSelectedServices()).toEqual([]);
    });

    it('returns names of checked services by index', () => {
      service.additionalServicesArray.at(0).setValue(true);
      service.additionalServicesArray.at(2).setValue(true);
      expect(service.getSelectedServices()).toEqual(['Blister Pack', 'Delivery']);
    });

    it('returns middle service when only that is checked', () => {
      service.additionalServicesArray.at(1).setValue(true);
      expect(service.getSelectedServices()).toEqual(['Auto-Refill']);
    });
  });

  describe('reset()', () => {
    beforeEach(() => {
      service.form.get('serviceType')!.setValue('Refill');
      service.pharmacyGroup.patchValue({
        name: 'Demo', formatted_address: 'Addr', lat: 1, lng: 2, place_id: 'pid',
      });
      service.additionalServicesArray.at(1).setValue(true);
      service.form.get('prescriptionNotes')!.setValue('Some notes');
    });

    it('clears serviceType', () => {
      service.reset();
      expect(service.form.get('serviceType')!.value).toBe('');
    });

    it('clears all pharmacy fields', () => {
      service.reset();
      expect(service.pharmacyGroup.get('name')!.value).toBe('');
      expect(service.pharmacyGroup.get('place_id')!.value).toBe('');
      expect(service.pharmacyGroup.get('lat')!.value).toBeNull();
    });

    it('resets all additionalServices to false', () => {
      service.reset();
      service.additionalServicesArray.controls.forEach(ctrl =>
        expect(ctrl.value).toBeFalse()
      );
    });

    it('clears prescriptionNotes', () => {
      service.reset();
      expect(service.form.get('prescriptionNotes')!.value).toBe('');
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
      service.form.get('serviceType')!.setValue('New Prescription');
    });
  });
});
