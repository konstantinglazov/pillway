import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

/**
 * Shared form state service for the multi-step prescription transfer flow.
 *
 * WHY a single service instance instead of separate FormGroups per step:
 *   Angular's default routing destroys a component when you navigate away from
 *   it.  By holding the FormGroup here — in a service scoped to TransferModule —
 *   the state survives navigation between steps.  Each step component injects
 *   this service and binds to the *same* FormGroup instance, so data entered in
 *   Step 1 is still available when the user reaches Step 3.
 */
@Injectable()
export class TransferFormService {
  readonly form: FormGroup;

  /** Available additional services (kept here so all steps share the definition). */
  readonly additionalServiceOptions = ['Blister Pack', 'Auto-Refill', 'Delivery'];

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      serviceType: ['', Validators.required],

      // Each element is a boolean control — true means the service is selected.
      additionalServices: this.fb.array(
        this.additionalServiceOptions.map(() => this.fb.control(false))
      ),

      prescriptionNotes: [''],

      pharmacy: this.fb.group({
        name: ['', Validators.required],
        formatted_address: ['', Validators.required],
        lat: [null, Validators.required],
        lng: [null, Validators.required],
        place_id: ['', Validators.required],
      }),
    });
  }

  /** Convenience accessor for the additional services FormArray. */
  get additionalServicesArray(): FormArray {
    return this.form.get('additionalServices') as FormArray;
  }

  /** Convenience accessor for the pharmacy sub-FormGroup. */
  get pharmacyGroup(): FormGroup {
    return this.form.get('pharmacy') as FormGroup;
  }

  /**
   * Returns true only if the controls belonging to the given step are valid.
   * Used by each step's "Next" button to decide whether to advance.
   *
   *   Step 1 — serviceType (required radio selection)
   *   Step 2 — pharmacy group (all fields required; set by Maps autocomplete)
   *   Step 3 — review only; always valid if steps 1+2 are
   */
  getStepValid(step: 1 | 2 | 3): boolean {
    switch (step) {
      case 1:
        return this.form.get('serviceType')?.valid ?? false;
      case 2:
        return this.pharmacyGroup.valid;
      case 3:
        return this.form.valid;
    }
  }

  /**
   * Returns the names of additional services the user has checked.
   * Filters the boolean array by index against `additionalServiceOptions`.
   */
  getSelectedServices(): string[] {
    return this.additionalServicesArray.controls
      .map((ctrl, i) => (ctrl.value ? this.additionalServiceOptions[i] : null))
      .filter((name): name is string => name !== null);
  }

  /**
   * Observable of the form value — consumed by StepReviewComponent to
   * reactively display a summary of all entered data.
   */
  get formValue$(): Observable<unknown> {
    return this.form.valueChanges;
  }

  /**
   * Resets all controls to their initial empty state.
   * Called after a booking is successfully submitted.
   */
  reset(): void {
    this.form.reset({
      serviceType: '',
      additionalServices: this.additionalServiceOptions.map(() => false),
      prescriptionNotes: '',
      pharmacy: { name: '', formatted_address: '', lat: null, lng: null, place_id: '' },
    });
  }
}
