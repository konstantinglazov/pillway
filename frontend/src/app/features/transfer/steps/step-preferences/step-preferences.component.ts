import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TransferFormService } from '../../transfer-form.service';

@Component({
  selector: 'pw-step-preferences',
  standalone: false,
  template: `
    <form [formGroup]="formService.form" novalidate>
      <h2 class="step-heading">Your Preferences</h2>
      <p class="step-subheading">Tell us what you need and we'll handle the rest.</p>

      <!-- Service type -->
      <div class="section-label">Service Type <span class="req">*</span></div>
      <div class="service-grid">
        @for (opt of serviceOptions; track opt.value) {
          <label class="service-card" [class.selected]="formService.form.get('serviceType')?.value === opt.value">
            <input type="radio" [value]="opt.value" formControlName="serviceType" class="sr-only" />
            <span class="service-icon">{{ opt.icon }}</span>
            <span class="service-name">{{ opt.label }}</span>
            <span class="service-desc">{{ opt.desc }}</span>
          </label>
        }
      </div>

      @if (showError) {
        <div class="field-error mt-sm">Please select a service type to continue.</div>
      }

      <!-- Add-ons -->
      <div class="section-label" style="margin-top: 1.75rem">
        Add-ons <span class="opt">(optional)</span>
      </div>
      <div class="addon-grid" [formArrayName]="'additionalServices'">
        @for (ctrl of additionalServicesControls; track $index; let i = $index) {
          <label class="addon-chip" [class.selected]="ctrl.value">
            <input type="checkbox" [formControl]="asControl(ctrl)" class="sr-only" />
            <span class="addon-check">{{ ctrl.value ? '✓' : '' }}</span>
            {{ formService.additionalServiceOptions[i] }}
          </label>
        }
      </div>

      <!-- Notes -->
      <div class="form-field" style="margin-top: 1.75rem">
        <label for="notes">Prescription Notes <span class="opt">(optional)</span></label>
        <textarea id="notes" formControlName="prescriptionNotes"
          placeholder="e.g. Dosage changes, brand preference, allergies…"></textarea>
      </div>

      <div class="step-actions step-actions-end">
        <button type="button" class="btn btn-primary btn-lg" (click)="onNext()">
          Next: Choose Pharmacy
          <span>→</span>
        </button>
      </div>
    </form>
  `,
  styles: [`
    .section-label {
      font-size: .75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .07em;
      color: var(--text-muted);
      margin-bottom: .65rem;
    }

    .req  { color: var(--error); margin-left: 2px; }
    .opt  { font-weight: 400; text-transform: none; letter-spacing: 0; color: #94a3b8; font-size: .8rem; }
    .mt-sm { margin-top: .4rem; }

    /* ── Service cards ── */
    .service-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: .65rem;
    }

    .service-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .35rem;
      padding: 1.15rem .75rem;
      border: 2px solid var(--border);
      border-radius: 10px;
      cursor: pointer;
      transition: all var(--transition);
      background: var(--surface);
      text-align: center;

      &:hover { border-color: var(--primary-border); background: var(--primary-light); }

      &.selected {
        border-color: var(--primary);
        background: var(--primary-light);
        box-shadow: 0 0 0 3px rgba(37,99,235,.1);
      }
    }

    .service-icon { font-size: 1.65rem; line-height: 1; }
    .service-name { font-size: .85rem; font-weight: 700; color: var(--text); }
    .service-desc { font-size: .75rem; color: var(--text-muted); line-height: 1.3; }

    /* ── Add-on chips ── */
    .addon-grid { display: flex; gap: .5rem; flex-wrap: wrap; }

    .addon-chip {
      display: flex;
      align-items: center;
      gap: .4rem;
      padding: .5rem 1.05rem;
      border: 1.5px solid var(--border);
      border-radius: 999px;
      cursor: pointer;
      font-size: .875rem;
      font-weight: 500;
      transition: all var(--transition);
      background: var(--surface);
      user-select: none;

      &:hover { border-color: var(--primary-border); background: var(--primary-light); }

      &.selected {
        border-color: var(--primary);
        background: var(--primary-light);
        color: var(--primary);
        font-weight: 600;
      }
    }

    .addon-check {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: .6rem;
      font-weight: 700;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity var(--transition);

      .selected & { opacity: 1; }
    }

    @media (max-width: 480px) {
      .service-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class StepPreferencesComponent implements OnInit {
  readonly serviceOptions = [
    { value: 'Transfer Prescription', label: 'Transfer',    icon: '🔄', desc: 'Move from another pharmacy' },
    { value: 'New Prescription',      label: 'New Rx',      icon: '📝', desc: 'From a new prescription' },
    { value: 'Refill',                label: 'Refill',      icon: '💊', desc: 'Refill an existing Rx' },
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
