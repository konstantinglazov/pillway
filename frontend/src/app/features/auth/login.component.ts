import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'pw-login',
  standalone: false,
  template: `
    <div class="page-center">
      <button class="theme-toggle" (click)="theme.toggle()" [attr.aria-label]="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        @if (theme.isDark) {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        } @else {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        }
      </button>
      <div class="auth-shell">

        <!-- Left brand panel -->
        <aside class="auth-brand">
          <div class="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="M8.5 8.5 16 16"/></svg>
          </div>
          <h1 class="brand-name">Pillway</h1>
          <p class="brand-tagline">Prescription transfers, simplified.</p>
          <ul class="brand-features">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Secure &amp; private
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Transfers in minutes
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Find nearby pharmacies
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="M8.5 8.5 16 16"/></svg>
              All prescription types
            </li>
          </ul>
        </aside>

        <!-- Right form panel -->
        <div class="auth-form-panel card">

          <div class="auth-header">
            <h2>{{ isSignUp ? 'Create account' : 'Welcome back' }}</h2>
            <p>{{ isSignUp ? 'Start your first prescription transfer.' : 'Sign in to manage your transfers.' }}</p>
          </div>

          <div class="tab-bar" role="tablist">
            <button role="tab" class="tab" [class.tab-active]="!isSignUp" (click)="setMode(false)">Sign In</button>
            <button role="tab" class="tab" [class.tab-active]="isSignUp"  (click)="setMode(true)">Create Account</button>
          </div>

          @if (errorMessage) {
            <div class="alert alert-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px;flex-shrink:0;margin-top:.1rem"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ errorMessage }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

            @if (isSignUp) {
              <div class="form-field">
                <label for="fullName">Full Name</label>
                <input id="fullName" type="text" formControlName="fullName"
                  placeholder="Jane Smith" autocomplete="name" />
              </div>
            }

            <div class="form-field">
              <label for="email">Email</label>
              <input id="email" type="email" formControlName="email"
                placeholder="you@example.com" autocomplete="email"
                [class.is-invalid]="isInvalid('email')" />
              @if (isInvalid('email')) {
                <div class="field-error">Enter a valid email address.</div>
              }
            </div>

            <div class="form-field">
              <label for="password">Password</label>
              <input id="password" type="password" formControlName="password"
                [placeholder]="isSignUp ? 'At least 6 characters' : '••••••••'"
                [autocomplete]="isSignUp ? 'new-password' : 'current-password'"
                [class.is-invalid]="isInvalid('password')" />
              @if (isInvalid('password')) {
                <div class="field-error">At least 6 characters required.</div>
              }
            </div>

            <button type="submit" class="btn btn-primary btn-lg submit-btn" [disabled]="isLoading">
              @if (isLoading) { <span class="spinner"></span> }
              {{ isLoading ? 'Please wait…' : (isSignUp ? 'Create Account' : 'Sign In') }}
            </button>
          </form>

          <p class="auth-switch">
            {{ isSignUp ? 'Already have an account?' : "Don't have an account?" }}
            <button class="link-btn" (click)="setMode(!isSignUp)">{{ isSignUp ? 'Sign in' : 'Create one' }}</button>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-shell {
      display: flex;
      width: 100%;
      max-width: 860px;
      min-height: 520px;
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--shadow-xl);
    }

    .auth-brand {
      flex: 0 0 290px;
      background: linear-gradient(160deg, #b83218 0%, #DC4127 60%, #e05a3a 100%);
      color: #fff;
      padding: 2.75rem 2rem;
      display: flex;
      flex-direction: column;
      gap: .6rem;
    }

    .brand-logo {
      width: 48px;
      height: 48px;
      background: rgba(255,255,255,.15);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      svg { width: 28px; height: 28px; }
    }
    .brand-name { font-size: 1.85rem; font-weight: 800; letter-spacing: -.03em; margin-top: .25rem; }
    .brand-tagline { font-size: .9rem; opacity: .8; margin-bottom: 1.25rem; }

    .brand-features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: .7rem;

      li {
        display: flex;
        align-items: center;
        gap: .55rem;
        font-size: .88rem;
        opacity: .9;
        font-weight: 500;
        svg { width: 16px; height: 16px; flex-shrink: 0; opacity: .9; }
      }
    }

    .theme-toggle {
      position: fixed;
      top: 1rem;
      right: 1rem;
      width: 38px;
      height: 38px;
      border-radius: var(--radius-sm);
      border: 1.5px solid rgba(255,255,255,.25);
      background: rgba(255,255,255,.1);
      backdrop-filter: blur(8px);
      color: var(--text);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition);
      svg { width: 16px; height: 16px; }
      &:hover { background: rgba(255,255,255,.2); border-color: rgba(255,255,255,.4); }
    }

    .auth-form-panel {
      flex: 1;
      padding: 2.5rem 2.25rem;
      border-radius: 0;
      border: none;
      display: flex;
      flex-direction: column;
    }

    .auth-header {
      margin-bottom: 1.4rem;
      h2 { font-size: 1.4rem; font-weight: 700; letter-spacing: -.025em; }
      p  { font-size: .875rem; color: var(--text-muted); margin-top: .2rem; }
    }

    .tab-bar {
      display: flex;
      background: var(--bg);
      border-radius: var(--radius-sm);
      padding: 3px;
      margin-bottom: 1.4rem;
      gap: 3px;
    }

    .tab {
      flex: 1;
      padding: .5rem;
      border: none;
      background: transparent;
      border-radius: 6px;
      font-size: .875rem;
      font-weight: 500;
      font-family: inherit;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition);

      &.tab-active { background: var(--surface); color: var(--primary); font-weight: 600; box-shadow: var(--shadow-sm); }
      &:not(.tab-active):hover { color: var(--text); }
    }

    .submit-btn { width: 100%; margin-top: .5rem; }

    .auth-switch {
      text-align: center;
      font-size: .85rem;
      color: var(--text-muted);
      margin-top: 1.2rem;
    }

    .link-btn {
      background: none; border: none; color: var(--primary); font-weight: 600;
      cursor: pointer; font-size: inherit; font-family: inherit; padding: 0;
      text-decoration: underline; text-underline-offset: 2px;
      &:hover { color: var(--primary-dark); }
    }

    @media (max-width: 640px) {
      .auth-shell { flex-direction: column; max-width: 420px; }
      .auth-brand { flex: none; padding: 1.5rem; .brand-features { display: none; } }
      .auth-form-panel { padding: 1.75rem 1.5rem; }
    }
  `],
})
export class LoginComponent {
  form: FormGroup;
  isSignUp  = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    readonly theme: ThemeService,
  ) {
    this.form = this.fb.group({
      fullName: [''],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return (ctrl?.invalid && ctrl?.touched) ?? false;
  }

  setMode(signUp: boolean): void {
    this.isSignUp = signUp;
    this.errorMessage = '';
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading = true;
    this.errorMessage = '';
    const { email, password, fullName } = this.form.value as { email: string; password: string; fullName: string };
    const action$ = this.isSignUp
      ? this.authService.register(email, password, fullName)
      : this.authService.login(email, password);
    action$.subscribe({
      next:  () => { this.isLoading = false; this.router.navigate(['/transfer']); },
      error: (err: Error) => { this.isLoading = false; this.errorMessage = err.message; },
    });
  }
}
