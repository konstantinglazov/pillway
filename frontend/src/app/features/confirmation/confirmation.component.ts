import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pw-confirmation',
  template: `
    <div class="page-center confirm-bg">
      <div class="confirm-card card">

        <div class="check-wrap">
          <div class="check-ring"></div>
          <div class="check-circle">✓</div>
        </div>

        <h1 class="confirm-title">All Done!</h1>
        <p class="confirm-body">
          Your prescription transfer request has been submitted.
          The pharmacy will contact you shortly to confirm the details.
        </p>

        <div class="confirm-steps">
          <div class="confirm-step">
            <span class="step-dot done">✓</span>
            <span>Request submitted</span>
          </div>
          <div class="confirm-step-line done"></div>
          <div class="confirm-step">
            <span class="step-dot pending">2</span>
            <span>Pharmacy review</span>
          </div>
          <div class="confirm-step-line"></div>
          <div class="confirm-step">
            <span class="step-dot pending">3</span>
            <span>Pickup ready</span>
          </div>
        </div>

        <button class="btn btn-primary btn-lg new-btn" (click)="newBooking()">
          Start Another Transfer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-bg {
      background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 60%, #f0fdf4 100%);
    }

    .confirm-card {
      text-align: center;
      max-width: 460px;
      width: 100%;
      padding: 3rem 2.5rem;
    }

    .check-wrap {
      position: relative;
      width: 88px;
      height: 88px;
      margin: 0 auto 1.75rem;
    }

    .check-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--success-light);
      border: 2px solid var(--success-border);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50%       { transform: scale(1.08); opacity: .7; }
    }

    .check-circle {
      position: absolute;
      inset: 10px;
      border-radius: 50%;
      background: var(--success);
      color: #fff;
      font-size: 1.7rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(22,163,74,.3);
    }

    .confirm-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 .75rem;
      letter-spacing: -.02em;
    }

    .confirm-body {
      color: var(--text-muted);
      font-size: .95rem;
      line-height: 1.65;
      margin: 0 0 2rem;
    }

    /* Mini progress trail */
    .confirm-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 2rem;
      padding: 1.1rem 1.5rem;
      background: #f8fafc;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border);
    }

    .confirm-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .35rem;
      font-size: .75rem;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .step-dot {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .78rem;
      font-weight: 700;
      flex-shrink: 0;

      &.done {
        background: var(--success);
        color: #fff;
        border: 2px solid var(--success);
      }

      &.pending {
        background: var(--surface);
        color: var(--text-muted);
        border: 2px solid var(--border);
      }
    }

    .confirm-step-line {
      flex: 1;
      height: 2px;
      background: var(--border);
      min-width: 32px;
      margin-bottom: 1.4rem;
      border-radius: 2px;

      &.done { background: var(--success); }
    }

    .new-btn { width: 100%; }
  `],
})
export class ConfirmationComponent {
  constructor(private readonly router: Router) {}

  newBooking(): void { this.router.navigate(['/transfer']); }
}
