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
            @switch (opt.iconType) {
              @case ('transfer') {
                <svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
              }
              @case ('new-rx') {
                <svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
              }
              @case ('pill') {
                <svg class="service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="M8.5 8.5 16 16"/></svg>
              }
            }
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
            <span class="addon-check" aria-hidden="true">
              @if (ctrl.value) {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.75 6 6 9-13.5"/></svg>
              }
            </span>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
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

    .service-icon {
      width: 1.75rem;
      height: 1.75rem;
      color: var(--primary);
      transition: color var(--transition);
      .service-card:not(.selected) & { color: var(--text-muted); }
    }
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
      flex-shrink: 0;
      opacity: 0;
      transition: opacity var(--transition);
      svg { width: 10px; height: 10px; }

      .selected & { opacity: 1; }
    }

    @media (max-width: 480px) {
      .service-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class StepPreferencesComponent implements OnInit {
  readonly serviceOptions = [
    { value: 'Transfer Prescription', label: 'Transfer', iconType: 'transfer', desc: 'Move from another pharmacy' },
    { value: 'New Prescription',      label: 'New Rx',   iconType: 'new-rx',   desc: 'From a new prescription' },
    { value: 'Refill',                label: 'Refill',   iconType: 'pill',     desc: 'Refill an existing Rx' },
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
