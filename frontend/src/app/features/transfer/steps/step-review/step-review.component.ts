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
      <div class="alert alert-success">🎉 Booking confirmed! Redirecting…</div>
    }
    @if (errorMessage) {
      <div class="toast toast-error">
        <span>{{ errorMessage }}</span>
        <button class="toast-close" (click)="errorMessage = null">✕</button>
      </div>
    }

    <h2 class="step-heading">Review Your Order</h2>
    <p class="step-subheading">Confirm the details below before submitting.</p>

    <div class="summary-card">

      <div class="summary-section">
        <div class="summary-section-title">Service</div>
        <div class="summary-row">
          <span class="summary-icon">🔄</span>
          <div>
            <div class="summary-label">Type</div>
            <div class="summary-value">{{ serviceType || '—' }}</div>
          </div>
        </div>

        @if (selectedServicesDisplay !== 'None') {
          <div class="summary-row">
            <span class="summary-icon">➕</span>
            <div>
              <div class="summary-label">Add-ons</div>
              <div class="summary-value">{{ selectedServicesDisplay }}</div>
            </div>
          </div>
        }

        @if (prescriptionNotes) {
          <div class="summary-row">
            <span class="summary-icon">📋</span>
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
          <span class="summary-icon">📍</span>
          <div>
            <div class="summary-label">{{ pharmacy?.name }}</div>
            <div class="summary-value muted">{{ pharmacy?.formatted_address }}</div>
          </div>
        </div>
      </div>

    </div>

    <div class="step-actions">
      <button type="button" class="btn btn-secondary" [disabled]="isSubmitting" (click)="onBack()">← Back</button>
      <button type="button" class="btn btn-primary btn-lg" [disabled]="isSubmitting" (click)="onConfirm()">
        @if (isSubmitting) { <span class="spinner"></span> }
        {{ isSubmitting ? 'Submitting…' : 'Confirm & Submit' }}
      </button>
    </div>
  `,
  styles: [`
    .toast-close {
      background: none; border: none; color: #fff; font-size: 1rem;
      cursor: pointer; padding: 0; opacity: .8; flex-shrink: 0;
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

    .summary-icon { font-size: 1.05rem; flex-shrink: 0; margin-top: .05rem; }

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
