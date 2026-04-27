import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'pw-step-select-profile',
  standalone: false,
  template: `
    <h2 class="step-heading">Who is this transfer for?</h2>
    <p class="step-subheading">Select a profile to continue with your prescription transfer.</p>

    <div class="profile-list">
      <button type="button" class="profile-card selected" (click)="onContinue()" aria-pressed="true">
        <div class="profile-avatar" aria-hidden="true">{{ initials }}</div>
        <div class="profile-info">
          <div class="profile-name">{{ fullName }}</div>
          <div class="profile-email">{{ email }}</div>
          <div class="profile-badge">Primary profile</div>
        </div>
        <div class="profile-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="m4.5 12.75 6 6 9-13.5"/>
          </svg>
        </div>
      </button>
    </div>

    <div class="step-actions" style="margin-top: 1.5rem;">
      <button type="button" class="btn btn-primary btn-lg btn-full" (click)="onContinue()">
        Continue
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
      </button>
    </div>
  `,
  styles: [`
    .profile-list {
      display: flex;
      flex-direction: column;
      gap: .65rem;
    }

    .profile-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.1rem;
      border: 2px solid var(--border);
      border-radius: 12px;
      cursor: pointer;
      transition: all var(--transition);
      background: var(--surface);
      width: 100%;
      text-align: left;

      &:hover { border-color: var(--primary-border); background: var(--primary-light); }

      &.selected {
        border-color: var(--primary);
        background: var(--primary-light);
        box-shadow: 0 0 0 3px rgba(220,65,39,.08);
      }
    }

    .profile-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: .88rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      letter-spacing: .02em;
    }

    .profile-info { flex: 1; min-width: 0; }

    .profile-name {
      font-size: .95rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: .1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profile-email {
      font-size: .8rem;
      color: var(--text-muted);
      margin-bottom: .35rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profile-badge {
      display: inline-block;
      font-size: .68rem;
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
      background: var(--primary-light);
      color: var(--primary);
      border: 1px solid var(--primary-border);
      border-radius: 20px;
      padding: .15rem .55rem;
    }

    .profile-check {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--primary);
      border: 2px solid var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #fff;
      svg { width: 13px; height: 13px; }
    }
  `],
})
export class StepSelectProfileComponent {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  get fullName(): string { return this.authService.getUserInfo()?.fullName ?? 'User'; }
  get email(): string { return this.authService.getUserInfo()?.email ?? ''; }
  get initials(): string { return this.authService.getUserInitials(); }

  onContinue(): void { this.router.navigate(['/transfer/pharmacy']); }
}
