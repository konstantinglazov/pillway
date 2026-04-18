import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, AbstractControl } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { TransferFormService } from '../../transfer-form.service';

@Component({
  selector: 'pw-step-preferences',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-6px)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
  template: `
    <form [formGroup]="formService.form" novalidate>
      <h2 class="step-heading">Your Preferences</h2>
      <p class="step-subheading">Tell us what you need and we'll take care of the rest.</p>

      <!-- Service type -->
      <div class="section-label">Service Type <span class="required">*</span></div>
      <div class="service-grid">
        <label
          *ngFor="let opt of serviceOptions"
          class="service-card"
          [class.selected]="formService.form.get('serviceType')?.value === opt.value"
        >
          <input type="radio" [value]="opt.value" formControlName="serviceType" />
          <span class="service-icon">{{ opt.icon }}</span>
          <span class="service-label">{{ opt.value }}</span>
        </label>
      </div>

      <div class="field-error" *ngIf="showError" [@fadeIn]>
        Please select a service type to continue.
      </div>

      <!-- Additional services -->
      <div class="section-label" style="margin-top:1.5rem">Add-ons <span class="optional">(optional)</span></div>
      <div class="addon-grid" [formArrayName]="'additionalServices'">
        <label
          *ngFor="let ctrl of additionalServicesControls; let i = index"
          class="addon-chip"
          [class.selected]="ctrl.value"
        >
          <input type="checkbox" [formControl]="asControl(ctrl)" />
          <span>{{ formService.additionalServiceOptions[i] }}</span>
        </label>
      </div>

      <!-- Notes -->
      <div class="form-field" style="margin-top:1.5rem">
        <label for="notes">Prescription Notes <span class="optional">(optional)</span></label>
        <textarea
          id="notes"
          formControlName="prescriptionNotes"
          placeholder="e.g. Dosage changes, brand preference, allergies…"
        ></textarea>
      </div>

      <div class="step-actions step-actions-end">
        <button type="button" class="btn btn-primary btn-lg" (click)="onNext()">
          Next: Choose Pharmacy →
        </button>
      </div>
    </form>
  `,
  styles: [`
    .section-label {
      font-size: .8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: var(--text-muted);
      margin-bottom: .65rem;
    }

    .required { color: var(--error); }
    .optional { font-weight: 400; text-transform: none; letter-spacing: 0; color: #94a3b8; }

    /* Service cards */
    .service-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: .65rem;
    }

    .service-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .5rem;
      padding: 1.1rem .75rem;
      border: 2px solid var(--border);
      border-radius: 10px;
      cursor: pointer;
      transition: all var(--transition);
      background: var(--surface);

      input[type="radio"] { display: none; }

      &:hover { border-color: var(--primary-border); background: var(--primary-light); }

      &.selected {
        border-color: var(--primary);
        background: var(--primary-light);
        box-shadow: 0 0 0 3px rgba(37,99,235,.1);
      }
    }

    .service-icon { font-size: 1.6rem; line-height: 1; }
    .service-label { font-size: .82rem; font-weight: 600; text-align: center; color: var(--text); line-height: 1.3; }

    /* Add-on chips */
    .addon-grid { display: flex; gap: .5rem; flex-wrap: wrap; }

    .addon-chip {
      display: flex;
      align-items: center;
      gap: .4rem;
      padding: .5rem 1rem;
      border: 1.5px solid var(--border);
      border-radius: 999px;
      cursor: pointer;
      font-size: .875rem;
      font-weight: 500;
      transition: all var(--transition);
      background: var(--surface);

      input[type="checkbox"] { display: none; }

      &:hover { border-color: var(--primary-border); background: var(--primary-light); }

      &.selected {
        border-color: var(--primary);
        background: var(--primary-light);
        color: var(--primary);
        font-weight: 600;
      }
    }
  `],
})
export class StepPreferencesComponent implements OnInit {
  readonly serviceOptions = [
    { value: 'Transfer Prescription', icon: '🔄' },
    { value: 'New Prescription',      icon: '📝' },
    { value: 'Refill',                icon: '💊' },
  ];

  showError = false;

  constructor(readonly formService: TransferFormService, private readonly router: Router) {}

  ngOnInit(): void { this.showError = false; }

  get additionalServicesControls(): AbstractControl[] {
    return (this.formService.form.get('additionalServices') as FormArray).controls;
  }

  asControl(c: AbstractControl): FormControl { return c as FormControl; }

  onNext(): void {
    if (this.formService.getStepValid(1)) {
      this.showError = false;
      this.router.navigate(['/transfer/location']);
    } else {
      this.formService.form.get('serviceType')?.markAsTouched();
      this.showError = true;
    }
  }
}
