import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TransferFormService } from '../../transfer-form.service';
import { BookingService } from '../../../../core/services/booking.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'pw-step-review',
  standalone: false,
  template: `
    @if (errorMessage) {
      <div class="toast toast-error">
        <span>{{ errorMessage }}</span>
        <button class="toast-close" (click)="errorMessage = null" aria-label="Dismiss">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    }

    <h2 class="step-heading">Review your transfer</h2>
    <p class="step-subheading">Confirm the details below before submitting your request.</p>

    <!-- Summary card -->
    <div class="summary-card">

      <!-- FOR -->
      <div class="s-section">
        <div class="s-section-label">For</div>
        <div class="s-row">
          <div class="s-avatar" aria-hidden="true">{{ initials }}</div>
          <div>
            <div class="s-title">{{ fullName }} <span class="s-init">({{ initials }})</span></div>
            <div class="s-sub">Primary profile</div>
          </div>
        </div>
      </div>

      <div class="s-divider"></div>

      <!-- FROM pharmacy -->
      <div class="s-section">
        <div class="s-section-label-row">
          <div class="s-section-label">From pharmacy</div>
          <button type="button" class="s-edit" (click)="onEditPharmacy()">Edit</button>
        </div>
        <div class="s-row">
          <div class="s-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
          </div>
          <div>
            <div class="s-title">{{ pharmacyName }}</div>
            <div class="s-sub">{{ pharmacyAddress }}</div>
          </div>
        </div>
      </div>

      <div class="s-divider"></div>

      <!-- TO pharmacy -->
      <div class="s-section">
        <div class="s-section-label">To pharmacy</div>
        <div class="s-row">
          <div class="s-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
          </div>
          <div>
            <div class="s-title">Pillway Virtual Pharmacy</div>
            <div class="s-sub">100 King Street West, Toronto, ON M5X 1A9</div>
          </div>
        </div>
      </div>

      <div class="s-divider"></div>

      <!-- Medications -->
      <div class="s-section">
        <div class="s-section-label">Medications</div>
        @if (isTransferAll) {
          <div class="s-row">
            <div class="s-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div class="s-title">All active prescriptions</div>
          </div>
        } @else {
          @for (med of medicationNames; track $index; let i = $index) {
            <div class="s-row">
              <div class="s-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="M8.5 8.5 16 16"/></svg>
              </div>
              <div class="s-title">{{ med }}</div>
            </div>
          }
        }
      </div>

      @if (notes) {
        <div class="s-divider"></div>
        <div class="s-section">
          <div class="s-section-label-row">
            <div class="s-section-label">Your note for us</div>
          </div>
          <div class="s-row">
            <div class="s-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            </div>
            <div class="s-sub" style="color: var(--text)">{{ notes }}</div>
          </div>
        </div>
      }

    </div>

    <!-- Optional notes -->
    <div class="form-field">
      <label for="tf-notes">Additional notes <span class="opt">(optional)</span></label>
      <textarea id="tf-notes" [formControl]="notesControl" placeholder="e.g. dosage changes, brand preferences, allergies…"></textarea>
    </div>

    <!-- Consent -->
    <label class="consent-row" [class.is-checked]="isConsented">
      <input type="checkbox" [formControl]="consentControl" class="consent-check" />
      <div class="consent-box" aria-hidden="true">
        @if (isConsented) {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.75 6 6 9-13.5"/></svg>
        }
      </div>
      <span class="consent-text">
        I authorize Pillway to contact my current pharmacy and request the transfer of my prescriptions on my behalf.
      </span>
    </label>

    <div class="step-actions">
      <button type="button" class="btn btn-secondary" [disabled]="isSubmitting" (click)="onBack()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back
      </button>
      <button type="button" class="btn btn-primary btn-lg" [disabled]="isSubmitting || !isConsented" (click)="onConfirm()">
        @if (isSubmitting) { <span class="spinner"></span> }
        {{ isSubmitting ? 'Submitting…' : 'Confirm and Submit Transfer' }}
      </button>
    </div>
  `,
  styles: [`
    .toast-close {
      background: none; border: none; color: #fff;
      cursor: pointer; padding: 2px; opacity: .8; flex-shrink: 0;
      display: flex; align-items: center;
      svg { width: 16px; height: 16px; }
      &:hover { opacity: 1; }
    }

    .opt { font-weight: 400; color: var(--text-placeholder); font-size: .8em; text-transform: none; letter-spacing: 0; }

    /* ── Summary card ── */
    .summary-card {
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      overflow: hidden;
      margin-bottom: 1.25rem;
    }

    .s-section { padding: .15rem 0; }

    .s-section-label {
      font-size: .7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .07em;
      color: var(--text-muted);
      padding: .65rem 1.15rem .3rem;
      background: var(--surface-raised);
    }

    .s-section-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: .65rem 1.15rem .3rem;
      background: var(--surface-raised);
    }

    .s-section-label-row .s-section-label {
      font-size: .7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .07em;
      color: var(--text-muted);
      padding: 0;
      background: none;
    }

    .s-edit {
      background: none;
      border: none;
      cursor: pointer;
      font-size: .75rem;
      font-weight: 600;
      color: var(--primary);
      padding: 0;
      &:hover { text-decoration: underline; }
    }

    .s-row {
      display: flex;
      align-items: flex-start;
      gap: .85rem;
      padding: .7rem 1.15rem;
      border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
    }

    /* FOR section avatar */
    .s-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: .75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      letter-spacing: .02em;
      margin-top: .05rem;
    }

    .s-init {
      font-weight: 500;
      color: var(--text-muted);
      font-size: .88em;
    }

    .s-icon-wrap {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      background: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      svg { width: 14px; height: 14px; color: var(--primary); }
    }

    .s-title { font-size: .9rem; font-weight: 600; color: var(--text); line-height: 1.4; margin-top: .05rem; }
    .s-sub   { font-size: .82rem; color: var(--text-muted); line-height: 1.45; margin-top: .1rem; }
    .s-divider { height: 1px; background: var(--border); }

    /* ── Consent ── */
    .consent-row {
      display: flex;
      align-items: flex-start;
      gap: .85rem;
      padding: 1rem;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      cursor: pointer;
      margin-bottom: 1.5rem;
      transition: border-color var(--transition), background var(--transition);

      &.is-checked {
        border-color: var(--primary);
        background: var(--primary-light);
      }
    }

    .consent-check { display: none; }

    .consent-box {
      width: 22px;
      height: 22px;
      border: 2px solid var(--border);
      border-radius: 6px;
      flex-shrink: 0;
      margin-top: .1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition);
      .is-checked & { background: var(--primary); border-color: var(--primary); }
      svg { width: 13px; height: 13px; color: #fff; }
    }

    .consent-text {
      font-size: .85rem;
      color: var(--text-secondary);
      line-height: 1.55;
    }
  `],
})
export class StepReviewComponent {
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(
    readonly formService: TransferFormService,
    private readonly bookingService: BookingService,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  get notesControl() { return this.formService.form.get('notes') as import('@angular/forms').FormControl; }
  get consentControl() { return this.formService.form.get('consented') as import('@angular/forms').FormControl; }
  get isConsented(): boolean { return this.formService.form.get('consented')?.value === true; }

  get pharmacyName(): string { return this.formService.sourcePharmacyGroup.get('name')?.value ?? '—'; }
  get pharmacyAddress(): string { return this.formService.sourcePharmacyGroup.get('formatted_address')?.value ?? ''; }
  get isTransferAll(): boolean { return this.formService.form.get('transferType')?.value === 'all'; }
  get medicationNames(): string[] { return this.formService.medicationNames; }
  get notes(): string { return this.formService.form.get('notes')?.value ?? ''; }

  get fullName(): string { return this.authService.getUserInfo()?.fullName ?? 'User'; }
  get initials(): string { return this.authService.getUserInitials(); }

  onBack(): void { this.router.navigate(['/transfer/medication']); }
  onEditPharmacy(): void { this.router.navigate(['/transfer/pharmacy']); }

  onConfirm(): void {
    if (this.isSubmitting || !this.isConsented) return;
    this.isSubmitting = true;
    this.errorMessage = null;

    const pharmacy = this.formService.sourcePharmacyGroup.value;

    this.bookingService.createBooking({
      pharmacy,
      service_type:        'Transfer Prescription',
      additional_services: this.isTransferAll ? [] : this.medicationNames,
      prescription_notes:  this.notes || undefined,
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.formService.reset();
        this.router.navigate(['/confirmation']);
      },
      error: (err: Error) => {
        this.isSubmitting = false;
        this.errorMessage = err.message ?? 'Something went wrong. Please try again.';
      },
    });
  }
}
