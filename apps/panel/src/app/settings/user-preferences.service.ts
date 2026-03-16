import { Injectable, signal } from '@angular/core';
import {
  DEFAULT_PREFERENCES,
  Language,
  NotificationPreferences,
  Theme,
  UserPreferences,
} from './user-preferences.model';

const STORAGE_KEY = 'user-preferences';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private readonly _prefs = signal<UserPreferences>(this.load());
  readonly prefs = this._prefs.asReadonly();

  // ─── Read ─────────────────────────────────────────────────────────────────

  private load(): UserPreferences {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_PREFERENCES };
      const parsed = JSON.parse(raw) as Partial<UserPreferences>;
      return {
        theme: parsed.theme ?? DEFAULT_PREFERENCES.theme,
        language: parsed.language ?? DEFAULT_PREFERENCES.language,
        notifications: {
          ...DEFAULT_PREFERENCES.notifications,
          ...parsed.notifications,
        },
      };
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  }

  // ─── Write ────────────────────────────────────────────────────────────────

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._prefs()));
  }

  setTheme(theme: Theme): void {
    this._prefs.update((p) => ({ ...p, theme }));
    this.persist();
  }

  setLanguage(language: Language): void {
    this._prefs.update((p) => ({ ...p, language }));
    this.persist();
  }

  setNotification(key: keyof NotificationPreferences, value: boolean): void {
    this._prefs.update((p) => ({
      ...p,
      notifications: { ...p.notifications, [key]: value },
    }));
    this.persist();
  }
}
