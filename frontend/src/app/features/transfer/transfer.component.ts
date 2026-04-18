import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Step {
  label: string;
  path: string;
}

/**
 * Shell component for the multi-step transfer flow.
 * Renders a step indicator bar and a <router-outlet> for child step components.
 * Does not own any form state — that lives in TransferFormService.
 */
@Component({
  selector: 'pw-transfer',
  template: `
    <div class="container">
      <h1 class="flow-title">Prescription Transfer</h1>

      <!-- Step indicator -->
      <nav class="step-indicator" aria-label="Transfer steps">
        <div
          *ngFor="let step of steps; let i = index"
          class="step-item"
          [class.active]="isActive(step.path)"
          [class.completed]="isCompleted(i)"
        >
          <span class="step-number">{{ i + 1 }}</span>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </nav>

      <!-- Active step rendered here -->
      <div class="step-content card">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .flow-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #1a1a2e;
    }

    .step-indicator {
      display: flex;
      gap: 0;
      margin-bottom: 2rem;
      counter-reset: step;
    }

    .step-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      position: relative;
      padding-bottom: 0.5rem;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: #dee2e6;
        border-radius: 2px;
      }

      &.active::after  { background: #0d6efd; }
      &.completed::after { background: #198754; }
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #dee2e6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;

      .active &   { background: #0d6efd; color: #fff; }
      .completed & { background: #198754; color: #fff; }
    }

    .step-label {
      font-size: 0.8rem;
      font-weight: 500;
      color: #6c757d;

      .active &   { color: #0d6efd; }
      .completed & { color: #198754; }
    }

    .step-content {
      margin-top: 0.5rem;
    }
  `],
})
export class TransferComponent {
  readonly steps: Step[] = [
    { label: 'Preferences', path: 'preferences' },
    { label: 'Location', path: 'location' },
    { label: 'Review', path: 'review' },
  ];

  constructor(private readonly router: Router) {}

  /** True when the router URL contains this step's path segment. */
  isActive(path: string): boolean {
    return this.router.url.includes(`/transfer/${path}`);
  }

  /** True for all steps before the currently active one. */
  isCompleted(index: number): boolean {
    const activeIndex = this.steps.findIndex((s) =>
      this.router.url.includes(`/transfer/${s.path}`)
    );
    return activeIndex > index;
  }
}
