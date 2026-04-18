import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

interface Step { label: string; path: string; }

@Component({
  selector: 'pw-transfer',
  standalone: false,
  template: `
    <div class="transfer-page">

      <header class="topbar">
        <span class="topbar-brand">
          <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="M8.5 8.5 16 16"/></svg>
          Pillway
        </span>
        <div class="topbar-right">
          <span class="step-counter">Step {{ activeIndex + 1 }} of {{ steps.length }}</span>
          <button class="btn btn-ghost btn-icon btn-sm" (click)="theme.toggle()" [attr.aria-label]="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'">
            @if (theme.isDark) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <button class="btn btn-ghost btn-sm" (click)="logout()">Sign Out</button>
        </div>
      </header>

      <!-- Progress bar -->
      <div class="progress-track" role="progressbar" [attr.aria-valuenow]="progressPct" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-fill" [style.width.%]="progressPct"></div>
      </div>

      <div class="container">

        <!-- Stepper -->
        <nav class="stepper" aria-label="Transfer steps">
          @for (step of steps; track step.path; let i = $index; let last = $last) {
            <div class="stepper-item" [class.active]="isActive(step.path)" [class.done]="isCompleted(i)">
              <div class="stepper-circle">
                @if (isCompleted(i)) { <span>✓</span> } @else { <span>{{ i + 1 }}</span> }
              </div>
              <span class="stepper-label">{{ step.label }}</span>
            </div>
            @if (!last) {
              <div class="stepper-line" [class.done]="isCompleted(i)"></div>
            }
          }
        </nav>

        <div class="step-card card">
          <router-outlet></router-outlet>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .transfer-page { min-height: 100vh; background: var(--bg); }

    .topbar {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: .8rem 1.5rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .topbar-brand {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: -.02em;
      display: flex;
      align-items: center;
      gap: .4rem;
    }

    .brand-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      padding: 0;
      border-radius: var(--radius-xs);
      svg { width: 16px; height: 16px; }
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .step-counter {
      font-size: .8rem;
      font-weight: 600;
      color: var(--text-muted);
      background: #f1f5f9;
      padding: .3rem .7rem;
      border-radius: 999px;
    }

    /* ── Progress bar ── */
    .progress-track {
      height: 3px;
      background: var(--border);
      position: sticky;
      top: 53px;
      z-index: 99;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), #60a5fa);
      transition: width .4s cubic-bezier(.4,0,.2,1);
      border-radius: 0 2px 2px 0;
    }

    /* ── Stepper ── */
    .stepper {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .stepper-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .35rem;
      flex-shrink: 0;
    }

    .stepper-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .82rem;
      font-weight: 700;
      border: 2px solid var(--border);
      background: var(--surface);
      color: var(--text-muted);
      transition: all var(--transition-md);

      .active & { border-color: var(--primary); background: var(--primary); color: #fff; box-shadow: 0 0 0 4px rgba(37,99,235,.15); }
      .done &   { border-color: var(--success); background: var(--success); color: #fff; }
    }

    .stepper-label {
      font-size: .72rem;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
      .active & { color: var(--primary); }
      .done &   { color: var(--success); }
    }

    .stepper-line {
      flex: 1;
      height: 2px;
      background: var(--border);
      margin: 0 .5rem;
      margin-bottom: 1.15rem;
      border-radius: 2px;
      transition: background var(--transition-md);
      &.done { background: var(--success); }
    }

    .step-card { padding: 2rem; }

    @media (max-width: 480px) {
      .step-card { padding: 1.5rem 1.25rem; }
      .stepper-label { display: none; }
    }
  `],
})
export class TransferComponent {
  readonly steps: Step[] = [
    { label: 'Preferences', path: 'preferences' },
    { label: 'Pharmacy',    path: 'location' },
    { label: 'Review',      path: 'review' },
  ];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    readonly theme: ThemeService,
  ) {}

  get activeIndex(): number {
    return this.steps.findIndex(s => this.router.url.includes(`/transfer/${s.path}`));
  }

  get progressPct(): number {
    return Math.round(((this.activeIndex + 1) / this.steps.length) * 100);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isActive(path: string): boolean { return this.router.url.includes(`/transfer/${path}`); }
  isCompleted(index: number): boolean { return this.activeIndex > index; }
}
