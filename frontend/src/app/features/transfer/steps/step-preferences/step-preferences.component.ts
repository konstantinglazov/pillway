import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TransferFormService } from '../../transfer-form.service';

@Component({
  selector: 'pw-step-medication',
  standalone: false,
  template: `
    <form [formGroup]="formService.form" novalidate>
      <h2 class="step-heading">What would you like to transfer?</h2>
      <p class="step-subheading">Choose whether to transfer all of your prescriptions or specific ones.</p>

      <!-- Transfer type cards -->
      <div class="type-grid">

        <label class="type-card" [class.selected]="transferType === 'all'">
          <input type="radio" value="all" formControlName="transferType" class="sr-only" />
          <div class="type-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div class="type-card-text">
            <div class="type-card-title">Transfer all prescriptions</div>
            <div class="type-card-desc">Move every active prescription from your current pharmacy</div>
          </div>
          <div class="type-card-check" aria-hidden="true">
            @if (transferType === 'all') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.75 6 6 9-13.5"/></svg>
            }
          </div>
        </label>

        <label class="type-card" [class.selected]="transferType === 'specific'">
          <input type="radio" value="specific" formControlName="transferType" class="sr-only" />
          <div class="type-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="M8.5 8.5 16 16"/></svg>
          </div>
          <div class="type-card-text">
            <div class="type-card-title">Transfer specific medications</div>
            <div class="type-card-desc">Choose only the prescriptions you want to move</div>
          </div>
          <div class="type-card-check" aria-hidden="true">
            @if (transferType === 'specific') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.75 6 6 9-13.5"/></svg>
            }
          </div>
        </label>

      </div>

      <!-- Specific medications input -->
      @if (transferType === 'specific') {
        <div class="med-section">

          <!-- Controlled substances note -->
          <div class="warn-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div><strong>Note:</strong> Controlled substances (e.g. opioids, benzodiazepines) may require additional steps and cannot always be transferred.</div>
          </div>

          <!-- Add medication input -->
          <div class="add-med-row">
            <div class="form-field" style="margin-bottom:0; flex:1">
              <label for="med-input">Medication name</label>
              <input
                id="med-input"
                type="text"
                #medInput
                [value]="newMedName"
                (input)="newMedName = medInput.value"
                placeholder="e.g. Metformin 500mg"
                (keydown.enter)="addMedication($event)"
              />
            </div>
            <button type="button" class="btn btn-outline add-btn" (click)="addMedication()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
              Add
            </button>
          </div>

          <!-- Medication list -->
          @if (formService.medicationNames.length > 0) {
            <ul class="med-list" aria-label="Medications to transfer">
              @for (name of formService.medicationNames; track $index; let i = $index) {
                <li class="med-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="med-icon" aria-hidden="true"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="M8.5 8.5 16 16"/></svg>
                  <span class="med-name">{{ name }}</span>
                  <button type="button" class="med-remove" (click)="removeMedication(i)" aria-label="Remove {{ name }}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </li>
              }
            </ul>
          } @else {
            <p class="med-empty">No medications added yet.</p>
          }

        </div>
      }

      @if (showError) {
        <div class="field-error" style="margin-top:.75rem">Please add at least one medication name to continue.</div>
      }

      <div class="step-actions">
        <button type="button" class="btn btn-secondary" (click)="onBack()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <button type="button" class="btn btn-primary btn-lg" (click)="onNext()">
          Continue
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
        </button>
      </div>
    </form>
  `,
  styles: [`
    /* ── Transfer type cards ── */
    .type-grid {
      display: flex;
      flex-direction: column;
      gap: .65rem;
      margin-bottom: 1.25rem;
    }

    .type-card {
      display: grid;
      grid-template-columns: 44px 1fr 28px;
      align-items: center;
      gap: .9rem;
      padding: 1rem 1.1rem;
      border: 2px solid var(--border);
      border-radius: 12px;
      cursor: pointer;
      transition: all var(--transition);
      background: var(--surface);

      &:hover { border-color: var(--primary-border); background: var(--primary-light); }

      &.selected {
        border-color: var(--primary);
        background: var(--primary-light);
        box-shadow: 0 0 0 3px rgba(220,65,39,.08);
      }
    }

    .type-card-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: var(--surface-raised);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      .selected & { background: rgba(220,65,39,.12); }
      svg { width: 22px; height: 22px; color: var(--text-muted); }
      .selected & svg { color: var(--primary); }
    }

    .type-card-title { font-size: .92rem; font-weight: 700; color: var(--text); margin-bottom: .15rem; }
    .type-card-desc  { font-size: .8rem; color: var(--text-muted); line-height: 1.4; }

    .type-card-check {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all var(--transition);
      .selected & { background: var(--primary); border-color: var(--primary); }
      svg { width: 13px; height: 13px; color: #fff; }
    }

    /* ── Medication section ── */
    .med-section {
      border: 1.5px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
      background: var(--surface);
      margin-bottom: 1rem;
    }

    .warn-box {
      display: flex;
      align-items: flex-start;
      gap: .6rem;
      background: var(--warn-bg);
      border: 1px solid var(--warn-border);
      border-radius: 8px;
      padding: .75rem .9rem;
      font-size: .82rem;
      color: var(--warn-text);
      line-height: 1.5;
      margin-bottom: 1rem;
      svg { width: 15px; height: 15px; flex-shrink: 0; margin-top: .1rem; }
      strong { font-weight: 700; }
    }

    .add-med-row {
      display: flex;
      align-items: flex-end;
      gap: .65rem;
      margin-bottom: .85rem;
    }

    .add-btn {
      flex-shrink: 0;
      height: 42px;
      padding: 0 1rem;
      svg { width: 15px; height: 15px; }
    }

    /* ── Med list ── */
    .med-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: .4rem;
    }

    .med-item {
      display: flex;
      align-items: center;
      gap: .65rem;
      padding: .6rem .75rem;
      background: var(--surface-raised);
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .med-icon { width: 15px; height: 15px; flex-shrink: 0; color: var(--primary); }

    .med-name {
      flex: 1;
      font-size: .88rem;
      font-weight: 500;
      color: var(--text);
    }

    .med-remove {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      border-radius: 4px;
      transition: color var(--transition), background var(--transition);
      svg { width: 14px; height: 14px; }
      &:hover { color: var(--error); background: var(--error-light); }
    }

    .med-empty {
      font-size: .83rem;
      color: var(--text-muted);
      text-align: center;
      padding: .5rem 0;
    }
  `],
})
export class StepMedicationComponent {
  newMedName = '';
  showError  = false;

  constructor(
    readonly formService: TransferFormService,
    private readonly router: Router,
  ) {}

  get transferType(): string {
    return this.formService.form.get('transferType')?.value ?? 'all';
  }

  addMedication(event?: Event): void {
    if (event) event.preventDefault();
    const name = this.newMedName.trim();
    if (!name) return;
    this.formService.addMedication(name);
    this.newMedName = '';
    this.showError = false;
  }

  removeMedication(index: number): void {
    this.formService.removeMedication(index);
  }

  onBack(): void { this.router.navigate(['/transfer/confirm']); }

  onNext(): void {
    if (this.transferType === 'specific' && this.formService.medicationNames.length === 0) {
      this.showError = true;
      return;
    }
    this.showError = false;
    this.router.navigate(['/transfer/review']);
  }
}
