import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pw-step-intro',
  standalone: false,
  template: `
    <div class="intro-wrap">

      <!-- Icon -->
      <div class="intro-icon-circle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
          <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
          <path d="M12 3v6"/>
        </svg>
      </div>

      <h1 class="intro-title">Moving your meds is easy</h1>
      <p class="intro-sub">Transfer your prescriptions in just a few steps. We'll handle everything with your current pharmacy.</p>

      <!-- How it works -->
      <div class="how-card">
        <div class="how-title">How it works</div>
        <div class="how-steps">
          @for (step of steps; track step.n) {
            <div class="how-step">
              <div class="how-num">{{ step.n }}</div>
              <div class="how-text">
                <div class="how-label">{{ step.label }}</div>
                <div class="how-desc">{{ step.desc }}</div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Urgency warning -->
      <div class="warn-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <strong>Not for urgent needs.</strong>
          <span> Transfers from other pharmacies can take about 5 business days.</span>
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-full" (click)="start()">
        Start Transfer
      </button>

    </div>
  `,
  styles: [`
    .intro-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 0 .5rem;
    }

    .intro-icon-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
      svg { width: 36px; height: 36px; color: var(--primary); }
    }

    .intro-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text);
      text-align: center;
      letter-spacing: -.03em;
      margin-bottom: .65rem;
    }

    .intro-sub {
      font-size: .9rem;
      color: var(--text-muted);
      text-align: center;
      line-height: 1.65;
      max-width: 340px;
      margin-bottom: 1.5rem;
    }

    /* How it works */
    .how-card {
      width: 100%;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 1.15rem 1.25rem;
      margin-bottom: 1rem;
    }

    .how-title {
      font-size: .95rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 1rem;
    }

    .how-steps { display: flex; flex-direction: column; gap: .85rem; }

    .how-step {
      display: flex;
      align-items: flex-start;
      gap: .9rem;
    }

    .how-num {
      min-width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary-light);
      color: var(--primary);
      font-size: .82rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: .1rem;
    }

    .how-label { font-size: .9rem; font-weight: 700; color: var(--text); }
    .how-desc  { font-size: .82rem; color: var(--text-muted); line-height: 1.5; }

    /* Warning box */
    .warn-box {
      display: flex;
      align-items: flex-start;
      gap: .65rem;
      background: var(--warn-bg);
      border: 1px solid var(--warn-border);
      border-radius: 10px;
      padding: .9rem 1rem;
      font-size: .85rem;
      color: var(--warn-text);
      line-height: 1.55;
      width: 100%;
      margin-bottom: 1.5rem;
      svg { width: 18px; height: 18px; flex-shrink: 0; margin-top: .1rem; }
      strong { font-weight: 700; }
    }
  `],
})
export class StepIntroComponent {
  readonly steps = [
    { n: 1, label: 'You request the transfer',    desc: 'Select your current pharmacy and medications' },
    { n: 2, label: 'We contact your pharmacy',    desc: 'Our team reaches out to your current pharmacy to initiate the transfer' },
    { n: 3, label: 'They send your prescriptions', desc: 'We add your active prescriptions to your profile' },
    { n: 4, label: 'Ready to order',               desc: 'Medications appear in your profile and you can order it.' },
  ];

  constructor(private readonly router: Router) {}

  start(): void { this.router.navigate(['/transfer/select-profile']); }
}
