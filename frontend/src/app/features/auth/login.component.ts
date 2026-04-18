import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'pw-login',
  template: `
    <div class="page-center">
      <div class="auth-card card">

        <div class="brand">
          <div class="brand-icon">💊</div>
          <h1 class="brand-name">Pillway</h1>
          <p class="brand-tagline">Prescription transfers made simple</p>
        </div>

        <div class="tab-bar">
          <button class="tab" [class.tab-active]="!isSignUp" (click)="setMode(false)">Sign In</button>
          <button class="tab" [class.tab-active]="isSignUp"  (click)="setMode(true)">Create Account</button>
        </div>

        <div *ngIf="errorMessage" class="alert alert-error">
          <span>⚠️</span> {{ errorMessage }}
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="form-field" *ngIf="isSignUp">
            <label for="fullName">Full Name</label>
            <input id="fullName" type="text" formControlName="fullName" placeholder="Jane Smith" />
          </div>

          <div class="form-field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email"
              placeholder="you@example.com"
              [class.is-invalid]="isInvalid('email')" />
            <div class="field-error" *ngIf="isInvalid('email')">Enter a valid email address.</div>
          </div>

          <div class="form-field">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password"
              placeholder="••••••••"
              [class.is-invalid]="isInvalid('password')" />
            <div class="field-error" *ngIf="isInvalid('password')">At least 6 characters.</div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg submit-btn" [disabled]="isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            {{ isLoading ? 'Please wait…' : (isSignUp ? 'Create Account' : 'Sign In') }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-card { width: 100%; max-width: 420px; padding: 2.5rem 2rem; }

    .brand { text-align: center; margin-bottom: 2rem; }
    .brand-icon { font-size: 2.8rem; margin-bottom: .5rem; display: block; }
    .brand-name { font-size: 1.9rem; font-weight: 700; color: var(--primary); margin: 0 0 .3rem; }
    .brand-tagline { color: var(--text-muted); font-size: .9rem; margin: 0; }

    .tab-bar {
      display: flex; background: var(--bg); border-radius: var(--radius-sm);
      padding: 3px; margin-bottom: 1.5rem; gap: 3px;
    }
    .tab {
      flex: 1; padding: .55rem; border: none; background: transparent;
      border-radius: 6px; font-size: .9rem; font-weight: 500;
      font-family: inherit; color: var(--text-muted); cursor: pointer;
      transition: all var(--transition);

      &.tab-active {
        background: var(--surface); color: var(--primary);
        font-weight: 600; box-shadow: var(--shadow);
      }
    }

    .submit-btn { width: 100%; margin-top: .5rem; }
  `],
})
export class LoginComponent {
  form: FormGroup;
  isSignUp = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
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
      next: () => { this.isLoading = false; this.router.navigate(['/transfer']); },
      error: (err: Error) => { this.isLoading = false; this.errorMessage = err.message; },
    });
  }
}
