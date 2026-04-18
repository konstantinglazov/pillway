import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'pw-login',
  standalone: false,
  template: `
    <div class="page-center">
      <div class="auth-shell">

        <!-- Left brand panel -->
        <aside class="auth-brand">
          <div class="brand-logo">💊</div>
          <h1 class="brand-name">Pillway</h1>
          <p class="brand-tagline">Prescription transfers, simplified.</p>
          <ul class="brand-features">
            <li><span>🔒</span> Secure &amp; private</li>
            <li><span>⚡</span> Transfers in minutes</li>
            <li><span>📍</span> Find nearby pharmacies</li>
            <li><span>💊</span> All prescription types</li>
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
            <div class="alert alert-error" role="alert">⚠ {{ errorMessage }}</div>
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
      background: linear-gradient(160deg, #1e40af 0%, #2563eb 65%, #3b82f6 100%);
      color: #fff;
      padding: 2.75rem 2rem;
      display: flex;
      flex-direction: column;
      gap: .6rem;
    }

    .brand-logo { font-size: 2.5rem; line-height: 1; }
    .brand-name { font-size: 1.85rem; font-weight: 800; letter-spacing: -.03em; }
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
      }
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
      background: #f1f5f9;
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
