import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

/**
 * Route guard that blocks access to protected routes (e.g. /transfer) when
 * no active Supabase session exists.  Unauthenticated users are redirected to
 * /login instead.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const session = await this.supabaseService.getSession();

    if (session) {
      return true;
    }

    return this.router.createUrlTree(['/login']);
  }
}
