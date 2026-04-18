import { Component } from '@angular/core';
import { Router } from '@angular/router';

/** Simple confirmation page shown after a booking is successfully submitted. */
@Component({
  selector: 'pw-confirmation',
  template: `
    <div class="container confirm-page">
      <div class="card confirm-card">
        <div class="check-circle">✓</div>
        <h1>Booking Confirmed!</h1>
        <p>
          Your prescription transfer request has been submitted. The pharmacy
          will contact you to confirm the details.
        </p>
        <button class="btn btn-primary" (click)="newBooking()">
          Start Another Transfer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .confirm-card {
      text-align: center;
      max-width: 480px;
      margin: 0 auto;
    }

    .check-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #198754;
      color: #fff;
      font-size: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }

    h1 { font-size: 1.8rem; margin-bottom: 0.75rem; color: #1a1a2e; }
    p  { color: #495057; margin-bottom: 1.5rem; line-height: 1.6; }
  `],
})
export class ConfirmationComponent {
  constructor(private readonly router: Router) {}

  newBooking(): void {
    this.router.navigate(['/transfer']);
  }
}
