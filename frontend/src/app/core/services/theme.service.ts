import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'pw-theme';
  private _dark = false;

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    this._dark = saved
      ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.apply();
  }

  get isDark(): boolean { return this._dark; }

  toggle(): void {
    this._dark = !this._dark;
    localStorage.setItem(this.STORAGE_KEY, this._dark ? 'dark' : 'light');
    this.apply();
  }

  private apply(): void {
    document.documentElement.setAttribute('data-theme', this._dark ? 'dark' : 'light');
  }
}
