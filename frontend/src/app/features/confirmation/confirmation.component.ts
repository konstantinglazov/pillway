import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pw-confirmation',
  standalone: false,
  template: `
    <div class="page-center">
      <div class="confirm-card card">

        <!-- Animated checkmark -->
        <div class="check-wrap" aria-hidden="true">
          <div class="check-ring"></div>
          <div class="check-circle">✓</div>
        </div>

        <h1 class="confirm-title">You're all set!</h1>
        <p class="confirm-body">
          Your prescription transfer request has been submitted.
          The pharmacy will contact you shortly to confirm the details.
        </p>

        <!-- Progress trail -->
        <div class="progress-trail">
          <div class="trail-step">
            <div class="trail-dot done">✓</div>
            <div class="trail-label">Submitted</div>
          </div>
          <div class="trail-line done"></div>
          <div class="trail-step">
            <div class="trail-dot pending">2</div>
            <div class="trail-label">Pharmacy Review</div>
          </div>
          <div class="trail-line"></div>
          <div class="trail-step">
            <div class="trail-dot pending">3</div>
            <div class="trail-label">Ready for Pickup</div>
          </div>
        </div>

        <div class="confirm-actions">
          <button class="btn btn-primary btn-lg" (click)="newBooking()">
            Start Another Transfer
          </button>
          <p class="confirm-note">A confirmation has been noted in your account.</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .confirm-card {
      text-align: center;
      max-width: 460px;
      width: 100%;
      padding: 3rem 2.5rem;
      animation: scaleIn .3s cubic-bezier(.34,1.56,.64,1);
    }

    /* ── Animated check ── */
    .check-wrap {
      position: relative;
      width: 84px;
      height: 84px;
      margin: 0 auto 1.75rem;
    }

    .check-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--success-light);
      border: 2px solid var(--success-border);
      animation: pulse 2.4s ease-in-out infinite;
    }

    .check-circle {
      position: absolute;
      inset: 10px;
      border-radius: 50%;
      background: var(--success);
      color: #fff;
      font-size: 1.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(22,163,74,.35);
    }

    /* ── Content ── */
    .confirm-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text);
      letter-spacing: -.03em;
      margin-bottom: .65rem;
    }

    .confirm-body {
      font-size: .9rem;
      color: var(--text-muted);
      line-height: 1.7;
      margin-bottom: 1.75rem;
      max-width: 340px;
      margin-left: auto;
      margin-right: auto;
    }

    /* ── Progress trail ── */
    .progress-trail {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 2rem;
      padding: 1.15rem 1.25rem;
      background: var(--surface-raised);
      border-radius: 10px;
      border: 1.5px solid var(--border);
    }

    .trail-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .4rem;
    }

    .trail-dot {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .78rem;
      font-weight: 700;

      &.done    { background: var(--success); color: #fff; border: 2px solid var(--success); }
      &.pending { background: var(--surface); color: var(--text-muted); border: 2px solid var(--border); }
    }

    .trail-label {
      font-size: .7rem;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .trail-line {
      flex: 1;
      height: 2px;
      background: var(--border);
      min-width: 28px;
      margin-bottom: 1.4rem;
      margin: 0 .35rem;
      margin-bottom: 1.4rem;
      border-radius: 2px;
      &.done { background: var(--success); }
    }

    /* ── Actions ── */
    .confirm-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .75rem;
    }

    .confirm-actions .btn { width: 100%; }

    .confirm-note {
      font-size: .8rem;
      color: var(--text-muted);
    }

    @media (max-width: 480px) {
      .confirm-card { padding: 2rem 1.5rem; }
    }
  `],
})
export class ConfirmationComponent {
  constructor(private readonly router: Router) {}
  newBooking(): void { this.router.navigate(['/transfer']); }
}
