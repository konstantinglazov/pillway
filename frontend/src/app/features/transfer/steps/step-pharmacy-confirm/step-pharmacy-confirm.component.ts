import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TransferFormService } from '../../transfer-form.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'pw-step-pharmacy-confirm',
  standalone: false,
  template: `
    <h2 class="step-heading">Confirm your pharmacy</h2>
    <p class="step-subheading">We'll reach out to this pharmacy to request your prescriptions on your behalf.</p>

    <!-- Transfer card -->
    <div class="transfer-card">

      <!-- FOR -->
      <div class="tc-row">
        <div class="tc-badge tc-badge--for">FOR</div>
        <div class="tc-detail">
          <div class="tc-for-row">
            <div class="tc-avatar" aria-hidden="true">{{ initials }}</div>
            <div>
              <div class="tc-name">{{ fullName }} <span class="tc-init">({{ initials }})</span></div>
              <div class="tc-role">Primary profile</div>
            </div>
          </div>
        </div>
      </div>

      <div class="tc-divider"></div>

      <!-- FROM -->
      <div class="tc-row">
        <div class="tc-badge tc-badge--from">FROM</div>
        <div class="tc-detail">
          <div class="tc-name-row">
            <div class="tc-name">{{ sourcePharmacy.name || '—' }}</div>
            <button type="button" class="tc-edit" (click)="onBack()">Edit</button>
          </div>
          <div class="tc-addr">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
            {{ sourcePharmacy.formatted_address || '—' }}
          </div>
        </div>
      </div>

      <div class="tc-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>

      <!-- TO -->
      <div class="tc-row">
        <div class="tc-badge tc-badge--to">TO</div>
        <div class="tc-detail">
          <div class="tc-name">Pillway Virtual Pharmacy</div>
          <div class="tc-addr">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
            100 King Street West, Toronto, ON M5X 1A9
          </div>
          <div class="tc-phone">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
            1-800-745-5929
          </div>
        </div>
      </div>

    </div>

    <!-- Fax info note -->
    <div class="info-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      <div>
        We'll contact your pharmacy by fax or phone to initiate the transfer. Most transfers complete within 1–5 business days.
      </div>
    </div>

    <div class="step-actions">
      <button type="button" class="btn btn-secondary" (click)="onBack()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back
      </button>
      <button type="button" class="btn btn-primary btn-lg" (click)="onContinue()">
        Continue
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
      </button>
    </div>
  `,
  styles: [`
    /* ── Transfer card ── */
    .transfer-card {
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .tc-divider { height: 1px; background: var(--border); }

    .tc-row {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.15rem;
    }

    .tc-badge {
      font-size: .6rem;
      font-weight: 800;
      letter-spacing: .1em;
      padding: .25rem .5rem;
      border-radius: 6px;
      flex-shrink: 0;
      margin-top: .15rem;
    }

    .tc-badge--for  { background: var(--note-bg);     color: var(--note-text);    border: 1px solid var(--note-border); }
    .tc-badge--from { background: var(--warn-bg);     color: var(--warn-text);    border: 1px solid var(--warn-border); }
    .tc-badge--to   { background: var(--success-light); color: var(--success);    border: 1px solid var(--success-border); }

    .tc-detail { flex: 1; min-width: 0; }

    /* FOR row */
    .tc-for-row {
      display: flex;
      align-items: center;
      gap: .75rem;
    }

    .tc-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: .75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      letter-spacing: .02em;
    }

    .tc-name {
      font-size: .92rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: .15rem;
    }

    .tc-init {
      font-weight: 500;
      color: var(--text-muted);
      font-size: .85em;
    }

    .tc-role {
      font-size: .75rem;
      color: var(--text-muted);
    }

    /* FROM row */
    .tc-name-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .5rem;
      margin-bottom: .2rem;
    }

    .tc-edit {
      background: none;
      border: none;
      cursor: pointer;
      font-size: .78rem;
      font-weight: 600;
      color: var(--primary);
      padding: 0;
      flex-shrink: 0;
      &:hover { text-decoration: underline; }
    }

    .tc-addr {
      display: flex;
      align-items: flex-start;
      gap: .35rem;
      font-size: .82rem;
      color: var(--text-muted);
      line-height: 1.45;
      margin-bottom: .2rem;
      svg { width: 13px; height: 13px; flex-shrink: 0; margin-top: .15rem; }
    }

    .tc-phone {
      display: flex;
      align-items: center;
      gap: .35rem;
      font-size: .82rem;
      color: var(--text-muted);
      svg { width: 13px; height: 13px; flex-shrink: 0; }
    }

    .tc-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: .15rem 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      background: var(--surface-raised);
      svg { width: 18px; height: 18px; color: var(--text-muted); }
    }

    /* ── Info box ── */
    .info-box {
      display: flex;
      align-items: flex-start;
      gap: .65rem;
      background: var(--note-bg);
      border: 1px solid var(--note-border);
      border-radius: 10px;
      padding: .9rem 1rem;
      font-size: .85rem;
      color: var(--note-text);
      line-height: 1.55;
      margin-bottom: 1.5rem;
      svg { width: 17px; height: 17px; flex-shrink: 0; margin-top: .1rem; }
    }
  `],
})
export class StepPharmacyConfirmComponent {
  constructor(
    readonly formService: TransferFormService,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  get sourcePharmacy() {
    return this.formService.sourcePharmacyGroup.value as {
      name: string;
      formatted_address: string;
    };
  }

  get fullName(): string { return this.authService.getUserInfo()?.fullName ?? 'User'; }
  get initials(): string { return this.authService.getUserInitials(); }

  onBack(): void { this.router.navigate(['/transfer/pharmacy']); }
  onContinue(): void { this.router.navigate(['/transfer/medication']); }
}
