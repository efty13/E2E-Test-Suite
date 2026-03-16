import { Component, computed, inject } from '@angular/core';
import { UserPreferencesService } from './user-preferences.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div data-testid="settings-page" class="min-h-screen bg-gray-50">

      <!-- Header -->
      <div class="border-b border-gray-200 bg-white px-6 py-4">
        <div class="mx-auto max-w-2xl">
          <h1 class="text-lg font-semibold text-gray-900">Ayarlar</h1>
          <p class="text-sm text-gray-400">Uygulama tercihlerin</p>
        </div>
      </div>

      <div class="mx-auto max-w-2xl space-y-4 px-6 py-8">

        <!-- ── Tema ─────────────────────────────────────────────────────── -->
        <section class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Tema</h2>

          <div
            data-testid="settings-theme-group"
            class="grid grid-cols-2 gap-3"
          >
            <!-- Açık tema -->
            <button
              data-testid="settings-theme-light"
              type="button"
              (click)="setTheme('light')"
              [attr.aria-pressed]="theme() === 'light'"
              [class]="theme() === 'light'
                ? 'ring-2 ring-indigo-500 border-indigo-300 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-gray-300'"
              class="flex flex-col items-center gap-2 rounded-xl border p-4 transition focus:outline-none"
            >
              <svg class="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm0 15a5 5 0 100-10 5 5 0 000 10zm7.07-12.07a1 1 0 010 1.41l-.71.71a1 1 0 01-1.41-1.41l.71-.71a1 1 0 011.41 0zM21 11h1a1 1 0 010 2h-1a1 1 0 010-2zm-2.93 7.07a1 1 0 01-1.41 0l-.71-.71a1 1 0 011.41-1.41l.71.71a1 1 0 010 1.41zM13 20v1a1 1 0 01-2 0v-1a1 1 0 012 0zm-7.07-1.93a1 1 0 010-1.41l.71-.71a1 1 0 011.41 1.41l-.71.71a1 1 0 01-1.41 0zM3 13H2a1 1 0 010-2h1a1 1 0 010 2zm1.93-9.07a1 1 0 011.41 0l.71.71A1 1 0 015.64 6.05l-.71-.71a1 1 0 010-1.41z"/>
              </svg>
              <span class="text-sm font-medium text-gray-700">Açık</span>
              @if (theme() === 'light') {
                <span
                  data-testid="settings-theme-active-label"
                  class="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
                >Aktif</span>
              }
            </button>

            <!-- Koyu tema -->
            <button
              data-testid="settings-theme-dark"
              type="button"
              (click)="setTheme('dark')"
              [attr.aria-pressed]="theme() === 'dark'"
              [class]="theme() === 'dark'
                ? 'ring-2 ring-indigo-500 border-indigo-300 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-gray-300'"
              class="flex flex-col items-center gap-2 rounded-xl border p-4 transition focus:outline-none"
            >
              <svg class="h-6 w-6 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
              </svg>
              <span class="text-sm font-medium text-gray-700">Koyu</span>
              @if (theme() === 'dark') {
                <span
                  data-testid="settings-theme-active-label"
                  class="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
                >Aktif</span>
              }
            </button>
          </div>
        </section>

        <!-- ── Dil ──────────────────────────────────────────────────────── -->
        <section class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Dil</h2>

          <div class="flex flex-col gap-1.5">
            <label for="settings-lang" class="text-sm font-medium text-gray-700">
              Arayüz dili
            </label>
            <select
              id="settings-lang"
              data-testid="settings-language-select"
              (change)="setLanguage($any($event.target).value)"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="tr" [selected]="language() === 'tr'">Türkçe</option>
              <option value="en" [selected]="language() === 'en'">English</option>
            </select>
          </div>
        </section>

        <!-- ── Bildirimler ──────────────────────────────────────────────── -->
        <section class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Bildirimler
          </h2>

          <div class="space-y-4">

            <!-- E-posta -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">E-posta bildirimleri</p>
                <p class="text-xs text-gray-400">Yeni booking ve güncellemeler</p>
              </div>
              <button
                data-testid="settings-notif-email-toggle"
                type="button"
                role="switch"
                [attr.aria-checked]="notifications().email"
                (click)="toggleNotif('email')"
                [class]="notifications().email ? 'bg-indigo-600' : 'bg-gray-200'"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span
                  [class]="notifications().email ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                ></span>
              </button>
            </div>

            <div class="border-t border-gray-100"></div>

            <!-- Push -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">Push bildirimleri</p>
                <p class="text-xs text-gray-400">Tarayıcı anlık bildirimleri</p>
              </div>
              <button
                data-testid="settings-notif-push-toggle"
                type="button"
                role="switch"
                [attr.aria-checked]="notifications().push"
                (click)="toggleNotif('push')"
                [class]="notifications().push ? 'bg-indigo-600' : 'bg-gray-200'"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span
                  [class]="notifications().push ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                ></span>
              </button>
            </div>

            <div class="border-t border-gray-100"></div>

            <!-- SMS -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">SMS bildirimleri</p>
                <p class="text-xs text-gray-400">Telefon kısa mesajı</p>
              </div>
              <button
                data-testid="settings-notif-sms-toggle"
                type="button"
                role="switch"
                [attr.aria-checked]="notifications().sms"
                (click)="toggleNotif('sms')"
                [class]="notifications().sms ? 'bg-indigo-600' : 'bg-gray-200'"
                class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span
                  [class]="notifications().sms ? 'translate-x-6' : 'translate-x-1'"
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                ></span>
              </button>
            </div>

          </div>
        </section>

        <!-- ── Varsayılanlara Dön ────────────────────────────────────────── -->
        <div class="flex justify-end">
          <button
            data-testid="settings-reset-button"
            type="button"
            (click)="resetToDefaults()"
            class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:border-gray-300 hover:text-gray-700"
          >
            Varsayılanlara Dön
          </button>
        </div>

      </div>
    </div>
  `,
})
export class SettingsComponent {
  private readonly service = inject(UserPreferencesService);

  protected readonly theme        = computed(() => this.service.prefs().theme);
  protected readonly language     = computed(() => this.service.prefs().language);
  protected readonly notifications = computed(() => this.service.prefs().notifications);

  protected setTheme(value: 'light' | 'dark'): void {
    this.service.setTheme(value);
  }

  protected setLanguage(value: string): void {
    if (value === 'tr' || value === 'en') {
      this.service.setLanguage(value);
    }
  }

  protected toggleNotif(key: 'email' | 'push' | 'sms'): void {
    this.service.setNotification(key, !this.notifications()[key]);
  }

  protected resetToDefaults(): void {
    this.service.setTheme('light');
    this.service.setLanguage('tr');
    this.service.setNotification('email', true);
    this.service.setNotification('push', true);
    this.service.setNotification('sms', false);
  }
}
