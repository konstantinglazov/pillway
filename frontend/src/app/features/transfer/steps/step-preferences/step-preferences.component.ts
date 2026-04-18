import {
  Component,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { Router } from '@angular/router';
import { TransferFormService } from '../../transfer-form.service';

/**
 * Step 1 — Service Preferences.
 *
 * Binds directly to the FormGroup held by TransferFormService — no new
 * FormGroup is created here.  This ensures data survives navigation to
 * other steps and back.
 */
@Component({
  selector: 'pw-step-preferences',
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-6px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
  template: `
    <form [formGroup]="formService.form" novalidate>
      <h2 class="step-heading">Step 1 — Your Preferences</h2>

      <!-- Service Type (required radio) -->
      <div class="form-group">
        <label class="group-label">Service Type <span class="required">*</span></label>
        <div class="radio-group">
          <label
            *ngFor="let option of serviceOptions"
            class="radio-option"
            [class.selected]="formService.form.get('serviceType')?.value === option"
          >
            <input
              type="radio"
              [value]="option"
              formControlName="serviceType"
            />
            {{ option }}
          </label>
        </div>

        <div
          *ngIf="showServiceTypeError"
          class="invalid-feedback"
          [@fadeSlideIn]
        >
          Please select a service type.
        </div>
      </div>

      <!-- Additional Services (optional checkboxes) -->
      <div class="form-group">
        <label class="group-label">Additional Services (optional)</label>
        <div
          class="checkbox-group"
          [formArrayName]="'additionalServices'"
        >
          <label
            *ngFor="let ctrl of additionalServicesControls; let i = index"
            class="checkbox-option"
          >
            <input
              type="checkbox"
              [formControl]="asFormControl(ctrl)"
            />
            {{ formService.additionalServiceOptions[i] }}
          </label>
        </div>
      </div>

      <!-- Prescription Notes (optional textarea) -->
      <div class="form-group">
        <label for="prescriptionNotes">Prescription Notes (optional)</label>
        <textarea
          id="prescriptionNotes"
          formControlName="prescriptionNotes"
          placeholder="e.g. Dosage changes, brand preference, allergies…"
        ></textarea>
      </div>

      <!-- Navigation -->
      <div class="step-actions">
        <button
          type="button"
          class="btn btn-primary"
          (click)="onNext()"
        >
          Next: Choose Pharmacy
        </button>
      </div>
    </form>
  `,
  styles: [`
    .step-heading {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: #1a1a2e;
    }

    .group-label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.6rem;
    }

    .required { color: #dc3545; margin-left: 2px; }

    .radio-group, .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .radio-option, .checkbox-option {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.55rem 0.9rem;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
      font-size: 0.97rem;

      &:hover { border-color: #0d6efd; background: #f0f6ff; }

      &.selected {
        border-color: #0d6efd;
        background: #e8f0fe;
        font-weight: 500;
      }

      input { cursor: pointer; accent-color: #0d6efd; }
    }

    .step-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
    }
  `],
})
export class StepPreferencesComponent implements OnInit {
  readonly serviceOptions = [
    'Transfer Prescription',
    'New Prescription',
    'Refill',
  ];

  showServiceTypeError = false;

  constructor(
    readonly formService: TransferFormService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.showServiceTypeError = false;
  }

  get additionalServicesControls(): AbstractControl[] {
    return (this.formService.form.get('additionalServices') as FormArray).controls;
  }

  /** Type-safe cast from AbstractControl to FormControl for template binding. */
  asFormControl(ctrl: AbstractControl): FormControl {
    return ctrl as FormControl;
  }

  /**
   * Attempts to advance to Step 2.
   * If Step 1 is invalid, marks the control as touched so template
   * validators display errors, and shows the inline error message.
   */
  onNext(): void {
    if (this.formService.getStepValid(1)) {
      this.showServiceTypeError = false;
      this.router.navigate(['/transfer/location']);
    } else {
      this.formService.form.get('serviceType')?.markAsTouched();
      this.showServiceTypeError = true;
    }
  }
}
