import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pw-confirmation',
  standalone: false,
  template: `
    <div class="page-center">
      <div class="conf-card card">

        <!-- Success icon -->
        <div class="conf-icon-wrap" aria-hidden="true">
          <div class="conf-icon-ring"></div>
          <div class="conf-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.75 6 6 9-13.5"/></svg>
          </div>
        </div>

        <h1 class="conf-title">Transfer Request Submitted!</h1>
        <p class="conf-sub">We'll handle everything from here. You'll be notified once your prescriptions are ready at Pillway.</p>

        <!-- "Not an order" warning -->
        <div class="conf-warn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div><strong>This is not a medication order.</strong> Your prescriptions will appear in your profile once the transfer is complete.</div>
        </div>

        <!-- What happens next -->
        <div class="what-next">
          <div class="wn-title">What happens next</div>
          <div class="wn-steps">
            <div class="wn-step">
              <div class="wn-dot wn-dot--done">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4.5 12.75 6 6 9-13.5"/></svg>
              </div>
              <div class="wn-text">
                <div class="wn-label">Transfer requested</div>
                <div class="wn-desc">Your request has been received</div>
              </div>
            </div>
            <div class="wn-line"></div>
            <div class="wn-step">
              <div class="wn-dot">2</div>
              <div class="wn-text">
                <div class="wn-label">We contact your pharmacy</div>
                <div class="wn-desc">Usually within 1–2 business days</div>
              </div>
            </div>
            <div class="wn-line"></div>
            <div class="wn-step">
              <div class="wn-dot">3</div>
              <div class="wn-text">
                <div class="wn-label">Prescriptions transferred</div>
                <div class="wn-desc">Medications appear in your profile</div>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary btn-lg btn-full" (click)="done()">Okay, got it</button>

      </div>
    </div>
  `,
  styles: [`
    .conf-card {
      width: 100%;
      max-width: 460px;
      padding: 2rem 1.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      animation: scaleIn .3s cubic-bezier(.34, 1.56, .64, 1);
    }

    /* ── Success icon ── */
    .conf-icon-wrap {
      position: relative;
      width: 84px;
      height: 84px;
      margin-bottom: 1.5rem;
    }

    .conf-icon-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--primary-light);
      border: 2px solid var(--primary-border);
      animation: pulse 2.4s ease-in-out infinite;
    }

    .conf-icon-circle {
      position: absolute;
      inset: 10px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(220,65,39,.35);
      svg { width: 52%; height: 52%; }
    }

    /* ── Content ── */
    .conf-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text);
      letter-spacing: -.03em;
      margin-bottom: .55rem;
    }

    .conf-sub {
      font-size: .88rem;
      color: var(--text-muted);
      line-height: 1.65;
      max-width: 340px;
      margin-bottom: 1.25rem;
    }

    /* ── Warning ── */
    .conf-warn {
      display: flex;
      align-items: flex-start;
      gap: .6rem;
      background: var(--warn-bg);
      border: 1px solid var(--warn-border);
      border-radius: 10px;
      padding: .85rem 1rem;
      font-size: .83rem;
      color: var(--warn-text);
      line-height: 1.5;
      text-align: left;
      width: 100%;
      margin-bottom: 1.5rem;
      svg { width: 16px; height: 16px; flex-shrink: 0; margin-top: .1rem; }
      strong { font-weight: 700; }
    }

    /* ── What happens next ── */
    .what-next {
      width: 100%;
      background: var(--surface-raised);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.15rem 1.1rem;
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .wn-title {
      font-size: .8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .07em;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .wn-steps { display: flex; flex-direction: column; }

    .wn-step {
      display: flex;
      align-items: flex-start;
      gap: .85rem;
    }

    .wn-dot {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--surface);
      border: 2px solid var(--border);
      color: var(--text-muted);
      font-size: .78rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .wn-dot--done {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
      svg { width: 55%; height: 55%; }
    }

    .wn-label { font-size: .88rem; font-weight: 700; color: var(--text); }
    .wn-desc  { font-size: .78rem; color: var(--text-muted); margin-top: .1rem; }

    .wn-line {
      width: 2px;
      height: 28px;
      background: var(--border);
      margin-left: 14px;
      flex-shrink: 0;
    }

    @media (max-width: 480px) {
      .conf-card { padding: 1.75rem 1.25rem; }
    }
  `],
})
export class ConfirmationComponent {
  constructor(private readonly router: Router) {}
  done(): void { this.router.navigate(['/transfer']); }
}
