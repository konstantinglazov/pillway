import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable()
export class TransferFormService {
  readonly form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      sourcePharmacy: this.fb.group({
        name:              ['', Validators.required],
        formatted_address: ['', Validators.required],
        lat:               [null as number | null, Validators.required],
        lng:               [null as number | null, Validators.required],
        place_id:          ['', Validators.required],
      }),
      transferType: ['all', Validators.required],   // 'all' | 'specific'
      medications:  this.fb.array([]),              // FormControl<string>[] for specific medications
      notes:        [''],
      consented:    [false, Validators.requiredTrue],
    });
  }

  get sourcePharmacyGroup(): FormGroup {
    return this.form.get('sourcePharmacy') as FormGroup;
  }

  get medicationsArray(): FormArray {
    return this.form.get('medications') as FormArray;
  }

  get medicationNames(): string[] {
    return this.medicationsArray.controls.map(c => (c as FormControl<string>).value);
  }

  addMedication(name: string): void {
    this.medicationsArray.push(this.fb.control(name, Validators.required));
  }

  removeMedication(index: number): void {
    this.medicationsArray.removeAt(index);
  }

  getStepValid(step: 1 | 2 | 3): boolean {
    switch (step) {
      case 1: return this.sourcePharmacyGroup.valid;
      case 2: return !!this.form.get('transferType')?.value;
      case 3: return this.form.get('consented')?.value === true;
    }
  }

  get formValue$(): Observable<unknown> {
    return this.form.valueChanges;
  }

  reset(): void {
    this.medicationsArray.clear();
    this.form.reset({
      sourcePharmacy: { name: '', formatted_address: '', lat: null, lng: null, place_id: '' },
      transferType: 'all',
      notes: '',
      consented: false,
    });
  }
}
