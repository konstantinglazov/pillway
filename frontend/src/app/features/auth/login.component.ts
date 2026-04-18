import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

/**
 * Login / Sign-up component.
 *
 * Presents a single form that can toggle between "Sign In" and "Sign Up"
 * modes.  Uses Supabase email/password auth via SupabaseService.
 */
@Component({
  selector: 'pw-login',
  template: `
    <div class="auth-wrapper">
      <div class="auth-card card">
        <h1 class="auth-title">
          {{ isSignUp ? 'Create an account' : 'Sign in to Pillway' }}
        </h1>

        <!-- Error banner -->
        <div *ngIf="errorMessage" class="auth-error">{{ errorMessage }}</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <!-- Full name — sign-up only -->
          <div class="form-group" *ngIf="isSignUp">
            <label for="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              formControlName="fullName"
              placeholder="Jane Smith"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="you@example.com"
              [class.is-invalid]="isInvalid('email')"
            />
            <div *ngIf="isInvalid('email')" class="invalid-feedback">
              Please enter a valid email address.
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              [class.is-invalid]="isInvalid('password')"
            />
            <div *ngIf="isInvalid('password')" class="invalid-feedback">
              Password must be at least 6 characters.
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary submit-btn"
            [disabled]="isLoading"
          >
            <span *ngIf="isLoading" class="spinner"></span>
            {{ isSignUp ? 'Create Account' : 'Sign In' }}
          </button>
        </form>

        <p class="toggle-mode">
          {{ isSignUp ? 'Already have an account?' : 'New to Pillway?' }}
          <button type="button" class="link-btn" (click)="toggleMode()">
            {{ isSignUp ? 'Sign in' : 'Create one' }}
          </button>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: #f0f4ff;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
    }

    .auth-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #1a1a2e;
    }

    .auth-error {
      background: #f8d7da;
      border: 1px solid #f5c2c7;
      color: #842029;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .submit-btn {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.75rem;
      font-size: 1rem;
    }

    .toggle-mode {
      text-align: center;
      margin-top: 1.25rem;
      font-size: 0.9rem;
      color: #6c757d;
    }

    .link-btn {
      background: none;
      border: none;
      color: #0d6efd;
      cursor: pointer;
      font-size: inherit;
      text-decoration: underline;
      padding: 0;
    }
  `],
})
export class LoginComponent {
  form: FormGroup;
  isSignUp = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly supabaseService: SupabaseService,
    private readonly router: Router
  ) {
    this.form = this.fb.group({
      fullName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return (ctrl?.invalid && ctrl?.touched) ?? false;
  }

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, fullName } = this.form.value as {
      email: string;
      password: string;
      fullName: string;
    };

    const action$ = this.isSignUp
      ? this.supabaseService.signUp(email, password, fullName)
      : this.supabaseService.signIn(email, password);

    action$.subscribe({
      next: ({ error }) => {
        this.isLoading = false;
        if (error) {
          this.errorMessage = error.message;
        } else {
          this.router.navigate(['/transfer']);
        }
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message;
      },
    });
  }
}
