import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Thin wrapper around the Supabase browser client.
 *
 * Uses the ANON (public) key from environment.ts — this is intentional and
 * safe.  Row Level Security (RLS) policies on every table ensure users can
 * only access their own data, so the anon key cannot be used to read
 * another user's records even if it is exposed.
 *
 * The service_role key lives exclusively in the Express backend (.env) and
 * must NEVER appear in this file or any other Angular file.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  /** Raw Supabase client — expose for direct reads where convenient. */
  readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  /**
   * Returns the currently active session, or null if no user is signed in.
   * Used by BookingService to retrieve the authenticated user's UUID before
   * submitting a booking.
   */
  async getSession(): Promise<Session | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  /**
   * Emits on every auth state change (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED …).
   * Components can subscribe to react to session changes without polling.
   */
  authChanges(): Observable<{ event: AuthChangeEvent; session: Session | null }> {
    return new Observable((observer) => {
      const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
        observer.next({ event, session });
      });
      return () => data.subscription.unsubscribe();
    });
  }

  /** Sign in with email and password. */
  signIn(email: string, password: string) {
    return from(
      this.supabase.auth.signInWithPassword({ email, password })
    );
  }

  /** Create a new account. */
  signUp(email: string, password: string, fullName?: string) {
    return from(
      this.supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
    );
  }

  /** Sign the current user out. */
  signOut() {
    return from(this.supabase.auth.signOut());
  }
}
