import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Step { label: string; path: string; icon: string; }

@Component({
  selector: 'pw-transfer',
  template: `
    <div class="transfer-page">

      <!-- Top bar -->
      <header class="topbar">
        <span class="topbar-brand">💊 Pillway</span>
      </header>

      <div class="container">
        <h1 class="page-title">Prescription Transfer</h1>

        <!-- Step indicator -->
        <div class="stepper">
          <ng-container *ngFor="let step of steps; let i = index; let last = last">
            <div class="stepper-item"
                 [class.active]="isActive(step.path)"
                 [class.done]="isCompleted(i)">
              <div class="stepper-circle">
                <span *ngIf="!isCompleted(i)">{{ i + 1 }}</span>
                <span *ngIf="isCompleted(i)">✓</span>
              </div>
              <span class="stepper-label">{{ step.label }}</span>
            </div>
            <div *ngIf="!last" class="stepper-line" [class.done]="isCompleted(i)"></div>
          </ng-container>
        </div>

        <!-- Active step -->
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
      padding: 1rem 1.5rem;
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: var(--shadow);
    }

    .topbar-brand {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--primary);
      letter-spacing: -.01em;
    }

    .page-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 1.75rem;
      letter-spacing: -.02em;
    }

    /* ── Stepper ── */
    .stepper {
      display: flex;
      align-items: center;
      margin-bottom: 1.75rem;
    }

    .stepper-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .4rem;
      flex-shrink: 0;
    }

    .stepper-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .85rem;
      font-weight: 700;
      border: 2px solid var(--border);
      background: var(--surface);
      color: var(--text-muted);
      transition: all .25s ease;

      .active & {
        border-color: var(--primary);
        background: var(--primary);
        color: #fff;
        box-shadow: 0 0 0 4px rgba(37,99,235,.15);
      }

      .done & {
        border-color: var(--success);
        background: var(--success);
        color: #fff;
      }
    }

    .stepper-label {
      font-size: .75rem;
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
      margin-bottom: 1.3rem;
      border-radius: 2px;
      transition: background .25s ease;

      &.done { background: var(--success); }
    }

    .step-card { padding: 2rem; }
  `],
})
export class TransferComponent {
  readonly steps: Step[] = [
    { label: 'Preferences', path: 'preferences', icon: '📋' },
    { label: 'Location',    path: 'location',    icon: '📍' },
    { label: 'Review',      path: 'review',      icon: '✅' },
  ];

  constructor(private readonly router: Router) {}

  isActive(path: string): boolean {
    return this.router.url.includes(`/transfer/${path}`);
  }

  isCompleted(index: number): boolean {
    const activeIndex = this.steps.findIndex(s => this.router.url.includes(`/transfer/${s.path}`));
    return activeIndex > index;
  }
}
