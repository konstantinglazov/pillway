import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransferFormService } from '../../transfer-form.service';
import { BookingService } from '../../../../core/services/booking.service';
import { Pharmacy } from '../../../../core/models/booking.model';

/**
 * Step 3 — Review & Submit.
 *
 * Submit flow:
 *   1. Show loading spinner and disable Confirm button.
 *   2. Call BookingService.createBooking() — an HTTP POST to Express.
 *   3. On success: reset form state, show success banner, auto-navigate to
 *      /confirmation after 2 seconds.
 *   4. On error: show a dismissible error toast with the server message.
 */
@Component({
  selector: 'pw-step-review',
  template: `
    <h2 class="step-heading">Step 3 — Review Your Order</h2>

    <!-- Success banner -->
    <div *ngIf="showSuccess" class="success-banner">
      Booking confirmed! Redirecting you to the confirmation page…
    </div>

    <!-- Error toast -->
    <div *ngIf="errorMessage" class="toast toast-error">
      <span>{{ errorMessage }}</span>
      <button class="dismiss-btn" (click)="errorMessage = null">✕</button>
    </div>

    <!-- Summary card -->
    <div class="summary-section">
      <div class="summary-row">
        <span class="summary-label">Service Type</span>
        <span class="summary-value">{{ serviceType }}</span>
      </div>

      <div class="summary-row">
        <span class="summary-label">Additional Services</span>
        <span class="summary-value">{{ selectedServicesDisplay }}</span>
      </div>

      <div class="summary-row" *ngIf="prescriptionNotes">
        <span class="summary-label">Prescription Notes</span>
        <span class="summary-value">{{ prescriptionNotes }}</span>
      </div>

      <div class="summary-row">
        <span class="summary-label">Pharmacy</span>
        <span class="summary-value">
          <strong>{{ pharmacy?.name }}</strong><br />
          {{ pharmacy?.formatted_address }}
        </span>
      </div>
    </div>

    <!-- Navigation -->
    <div class="step-actions">
      <button
        type="button"
        class="btn btn-secondary"
        [disabled]="isSubmitting"
        (click)="onBack()"
      >
        Back
      </button>

      <button
        type="button"
        class="btn btn-primary"
        [disabled]="isSubmitting"
        (click)="onConfirm()"
      >
        <span *ngIf="isSubmitting" class="spinner"></span>
        <span>{{ isSubmitting ? 'Submitting…' : 'Confirm Order' }}</span>
      </button>
    </div>
  `,
  styles: [`
    .step-heading {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: #1a1a2e;
    }

    .summary-section {
      display: flex;
      flex-direction: column;
      gap: 0;
      border: 1px solid #dee2e6;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .summary-row {
      display: flex;
      gap: 1rem;
      padding: 0.9rem 1.1rem;
      border-bottom: 1px solid #dee2e6;

      &:last-child { border-bottom: none; }

      &:nth-child(even) { background: #f8f9fa; }
    }

    .summary-label {
      flex: 0 0 160px;
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }

    .summary-value {
      flex: 1;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: #fff;
      font-weight: 500;
      z-index: 9999;
      max-width: 380px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;

      &.toast-error { background: #dc3545; }
    }

    .dismiss-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
  `],
})
export class StepReviewComponent implements OnInit, OnDestroy {
  serviceType = '';
  selectedServicesDisplay = 'None';
  prescriptionNotes = '';
  pharmacy: Pharmacy | null = null;

  isSubmitting = false;
  showSuccess = false;
  errorMessage: string | null = null;

  private formSub?: Subscription;

  constructor(
    private readonly formService: TransferFormService,
    private readonly bookingService: BookingService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.updateSummary();

    // Re-render the summary whenever the form value changes (e.g. user navigates
    // back and changes a preference, then returns to this step).
    this.formSub = this.formService.formValue$.subscribe(() => {
      this.updateSummary();
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  /** Pulls current values from the service and populates the summary fields. */
  private updateSummary(): void {
    const v = this.formService.form.value as {
      serviceType: string;
      prescriptionNotes: string;
      pharmacy: Pharmacy;
    };

    this.serviceType = v.serviceType ?? '';
    this.prescriptionNotes = v.prescriptionNotes ?? '';
    this.pharmacy = v.pharmacy ?? null;

    const selected = this.formService.getSelectedServices();
    this.selectedServicesDisplay = selected.length > 0 ? selected.join(', ') : 'None';
  }

  onBack(): void {
    this.router.navigate(['/transfer/location']);
  }

  /**
   * Submits the booking to the Express API.
   *
   * Flow:
   *   1. Disable UI to prevent double-submit.
   *   2. BookingService fetches the user's session UUID and POSTs to /api/bookings.
   *   3. On success: reset form, show banner, redirect after 2 s.
   *   4. On error: surface the server message in a dismissible toast.
   */
  onConfirm(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = null;

    const formValue = this.formService.form.value as {
      serviceType: string;
      prescriptionNotes: string;
      pharmacy: Pharmacy;
    };

    this.bookingService
      .createBooking({
        pharmacy: formValue.pharmacy,
        service_type: formValue.serviceType,
        additional_services: this.formService.getSelectedServices(),
        prescription_notes: formValue.prescriptionNotes || undefined,
      })
      .subscribe({
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
