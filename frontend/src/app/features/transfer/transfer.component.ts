import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface StepInfo { num: number; label: string; back: string; }

@Component({
  selector: 'pw-transfer',
  standalone: false,
  template: `
    <div class="transfer-page">

      <!-- Header -->
      <header class="tf-header">
        <button class="back-btn" (click)="goBack()" [class.invisible]="isIntro" aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span class="tf-title">Transfer prescription</span>

        <!-- Avatar + dropdown -->
        <div class="tf-avatar-wrap">
          <button
            class="tf-avatar"
            (click)="toggleDropdown($event)"
            [attr.aria-expanded]="dropdownOpen"
            aria-haspopup="true"
            aria-label="Account menu"
          >{{ initials }}</button>

          @if (dropdownOpen) {
            <div class="tf-dropdown" role="menu" (click)="$event.stopPropagation()">
              <div class="tf-dropdown-user">
                <div class="tf-dropdown-avatar" aria-hidden="true">{{ initials }}</div>
                <div class="tf-dropdown-info">
                  <div class="tf-dropdown-name">{{ userFullName }}</div>
                  <div class="tf-dropdown-email">{{ userEmail }}</div>
                </div>
              </div>
              <div class="tf-dropdown-divider"></div>
              <button class="tf-dropdown-item tf-dropdown-item--danger" role="menuitem" (click)="logout()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </button>
            </div>
          }
        </div>
      </header>

      <!-- Step indicator + progress bar -->
      @if (!isIntro) {
        <div class="step-indicator">
          <span class="step-label">Step {{ currentStep.num }} of 3 &nbsp;|&nbsp; {{ currentStep.label }}</span>
        </div>
        <div class="tf-progress" role="progressbar" [attr.aria-valuenow]="progressPct" aria-valuemin="0" aria-valuemax="100">
          <div class="tf-progress-fill" [style.width.%]="progressPct"></div>
        </div>
      }

      <!-- Content -->
      <div class="tf-body">
        <div class="tf-card card">
          <router-outlet></router-outlet>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .transfer-page {
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
    }

    /* ── Header ── */
    .tf-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: .85rem 1rem;
      position: sticky;
      top: 0;
      z-index: 100;
      display: grid;
      grid-template-columns: 40px 1fr 40px;
      align-items: center;
      box-shadow: var(--shadow-sm);
    }

    .back-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text);
      transition: background var(--transition);
      svg { width: 20px; height: 20px; }
      &:hover { background: var(--bg); }
      &.invisible { visibility: hidden; pointer-events: none; }
    }

    .tf-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text);
      text-align: center;
      letter-spacing: -.02em;
    }

    /* ── Avatar + dropdown ── */
    .tf-avatar-wrap {
      position: relative;
      justify-self: end;
    }

    .tf-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: .78rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: .02em;
      border: none;
      cursor: pointer;
      transition: box-shadow var(--transition), transform var(--transition);
      &:hover { box-shadow: 0 0 0 3px rgba(220,65,39,.2); }
      &:active { transform: scale(.95); }
    }

    .tf-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 228px;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 12px;
      box-shadow: var(--shadow-md);
      overflow: hidden;
      animation: dropIn .15s cubic-bezier(.4, 0, .2, 1);
      z-index: 200;
    }

    @keyframes dropIn {
      from { opacity: 0; transform: translateY(-6px) scale(.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .tf-dropdown-user {
      display: flex;
      align-items: center;
      gap: .75rem;
      padding: .9rem 1rem;
      background: var(--surface-raised);
    }

    .tf-dropdown-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: .78rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      letter-spacing: .02em;
    }

    .tf-dropdown-info { min-width: 0; }

    .tf-dropdown-name {
      font-size: .88rem;
      font-weight: 700;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tf-dropdown-email {
      font-size: .75rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: .05rem;
    }

    .tf-dropdown-divider { height: 1px; background: var(--border); }

    .tf-dropdown-item {
      display: flex;
      align-items: center;
      gap: .6rem;
      width: 100%;
      padding: .75rem 1rem;
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: .88rem;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      text-align: left;
      transition: background var(--transition), color var(--transition);
      svg { width: 15px; height: 15px; flex-shrink: 0; }
      &:hover { background: var(--surface-raised); color: var(--text); }

      &--danger {
        color: var(--error);
        &:hover { background: var(--error-light); color: var(--error); }
      }
    }

    /* ── Step indicator ── */
    .step-indicator {
      background: var(--surface);
      padding: .55rem 1rem .45rem;
      border-bottom: 1px solid var(--border);
    }

    .step-label {
      font-size: .78rem;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: .01em;
    }

    .tf-progress {
      height: 3px;
      background: var(--border);
      position: sticky;
      top: 57px;
      z-index: 99;
    }

    .tf-progress-fill {
      height: 100%;
      background: var(--primary);
      transition: width .4s cubic-bezier(.4, 0, .2, 1);
      border-radius: 0 2px 2px 0;
    }

    /* ── Content ── */
    .tf-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 1.25rem 1rem 2rem;
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
    }

    .tf-card {
      padding: 1.5rem 1.25rem;
      width: 100%;
    }

    @media (min-width: 480px) {
      .tf-body { padding: 1.75rem 1.5rem 2.5rem; }
      .tf-card { padding: 2rem 1.75rem; }
    }
  `],
})
export class TransferComponent {
  dropdownOpen = false;

  private readonly stepMap: Record<string, StepInfo> = {
    intro:            { num: 0, label: '',                   back: '/dashboard' },
    'select-profile': { num: 0, label: '',                   back: '/transfer/intro' },
    pharmacy:         { num: 1, label: 'Choose pharmacy',    back: '/transfer/select-profile' },
    confirm:          { num: 1, label: 'Choose pharmacy',    back: '/transfer/pharmacy' },
    medication:       { num: 2, label: 'Select medications', back: '/transfer/confirm' },
    review:           { num: 3, label: 'Review & submit',    back: '/transfer/medication' },
  };

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  get initials(): string { return this.authService.getUserInitials(); }
  get userFullName(): string { return this.authService.getUserInfo()?.fullName ?? 'User'; }
  get userEmail(): string { return this.authService.getUserInfo()?.email ?? ''; }

  private get segment(): string {
    const parts = this.router.url.split('?')[0].split('/');
    return parts[parts.length - 1] || 'intro';
  }

  get isIntro(): boolean { return this.segment === 'intro' || this.segment === 'select-profile'; }

  get currentStep(): StepInfo {
    return this.stepMap[this.segment] ?? this.stepMap['intro'];
  }

  get progressPct(): number {
    return Math.round((this.currentStep.num / 3) * 100);
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  goBack(): void {
    this.router.navigate([this.currentStep.back]);
  }

  logout(): void {
    this.dropdownOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
