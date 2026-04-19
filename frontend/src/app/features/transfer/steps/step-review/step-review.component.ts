import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransferFormService } from '../../transfer-form.service';
import { BookingService } from '../../../../core/services/booking.service';
import { Pharmacy } from '../../../../core/models/booking.model';

@Component({
  selector: 'pw-step-review',
  standalone: false,
  template: `
    @if (showSuccess) {
      <div class="alert alert-success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
        Booking confirmed! Redirecting…
      </div>
    }
    @if (errorMessage) {
      <div class="toast toast-error">
        <span>{{ errorMessage }}</span>
        <button class="toast-close" (click)="errorMessage = null" aria-label="Dismiss">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    }

    <h2 class="step-heading">Review Your Order</h2>
    <p class="step-subheading">Confirm the details below before submitting.</p>

    <div class="summary-card">

      <div class="summary-section">
        <div class="summary-section-title">Service</div>
        <div class="summary-row">
          <svg class="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
          <div>
            <div class="summary-label">Type</div>
            <div class="summary-value">{{ serviceType || '—' }}</div>
          </div>
        </div>

        @if (selectedServicesDisplay !== 'None') {
          <div class="summary-row">
            <svg class="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
            <div>
              <div class="summary-label">Add-ons</div>
              <div class="summary-value">{{ selectedServicesDisplay }}</div>
            </div>
          </div>
        }

        @if (prescriptionNotes) {
          <div class="summary-row">
            <svg class="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            <div>
              <div class="summary-label">Notes</div>
              <div class="summary-value">{{ prescriptionNotes }}</div>
            </div>
          </div>
        }
      </div>

      <div class="summary-divider"></div>

      <div class="summary-section">
        <div class="summary-section-title">Pharmacy</div>
        <div class="summary-row">
          <svg class="summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
          <div>
            <div class="summary-label">{{ pharmacy?.name }}</div>
            <div class="summary-value muted">{{ pharmacy?.formatted_address }}</div>
          </div>
        </div>
      </div>

    </div>

    <div class="step-actions">
      <button type="button" class="btn btn-secondary" [disabled]="isSubmitting" (click)="onBack()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
        Back
      </button>
      <button type="button" class="btn btn-primary btn-lg" [disabled]="isSubmitting" (click)="onConfirm()">
        @if (isSubmitting) { <span class="spinner"></span> }
        {{ isSubmitting ? 'Submitting…' : 'Confirm & Submit' }}
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

    .summary-card {
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      margin-bottom: 1.5rem;
      background: var(--surface);
    }

    .summary-section { padding: .25rem 0; }

    .summary-section-title {
      font-size: .7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .07em;
      color: var(--text-muted);
      padding: .7rem 1.15rem .3rem;
      background: var(--surface-raised);
    }

    .summary-divider { height: 1px; background: var(--border); }

    .summary-row {
      display: flex;
      align-items: flex-start;
      gap: .85rem;
      padding: .8rem 1.15rem;
      border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
    }

    .summary-icon { width: 1.05rem; height: 1.05rem; flex-shrink: 0; margin-top: .15rem; color: var(--text-muted); }

    .summary-label { font-size: .78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; margin-bottom: .15rem; }
    .summary-value { font-size: .9rem; color: var(--text); line-height: 1.45; &.muted { color: var(--text-muted); font-size: .82rem; } }
  `],
})
export class StepReviewComponent implements OnInit, OnDestroy {
  serviceType = '';
  selectedServicesDisplay = 'None';
  prescriptionNotes = '';
  pharmacy: Pharmacy | null = null;

  isSubmitting = false;
  showSuccess  = false;
  errorMessage: string | null = null;

  private formSub?: Subscription;

  constructor(
    private readonly formService: TransferFormService,
    private readonly bookingService: BookingService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.updateSummary();
    this.formSub = this.formService.formValue$.subscribe(() => this.updateSummary());
  }

  ngOnDestroy(): void { this.formSub?.unsubscribe(); }

  private updateSummary(): void {
    const v = this.formService.form.value as { serviceType: string; prescriptionNotes: string; pharmacy: Pharmacy };
    this.serviceType = v.serviceType ?? '';
    this.prescriptionNotes = v.prescriptionNotes ?? '';
    this.pharmacy = v.pharmacy ?? null;
    const selected = this.formService.getSelectedServices();
    this.selectedServicesDisplay = selected.length > 0 ? selected.join(', ') : 'None';
  }

  onBack(): void { this.router.navigate(['/transfer/location']); }

  onConfirm(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.errorMessage = null;

    const v = this.formService.form.value as { serviceType: string; prescriptionNotes: string; pharmacy: Pharmacy };

    this.bookingService.createBooking({
      pharmacy:            v.pharmacy,
      service_type:        v.serviceType,
      additional_services: this.formService.getSelectedServices(),
      prescription_notes:  v.prescriptionNotes || undefined,
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showSuccess = true;
        this.formService.reset();
        setTimeout(() => this.router.navigate(['/confirmation']), 2000);
      },
      error: (err: Error) => {
        this.isSubmitting = false;
        this.errorMessage = err.message ?? 'An unexpected error occurred. Please try again.';
      },
    });
  }
}
