import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TalentProfileService } from './talent-profile.service';
import { TalentProfile } from './talent.model';

@Component({
  selector: 'app-talent-list',
  standalone: true,
  template: `
    <div data-testid="profile-page" class="min-h-screen bg-gray-50">

      <!-- Header -->
      <div class="border-b border-gray-200 bg-white px-6 py-4">
        <div class="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 class="text-lg font-semibold text-gray-900">Talent Profilleri</h1>
            <p class="text-sm text-gray-400">{{ profiles().length }} profil</p>
          </div>
          <button
            data-testid="profile-new-button"
            (click)="goToNew()"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            + Yeni Profil
          </button>
        </div>
      </div>

      <!-- List -->
      <div class="mx-auto max-w-5xl px-6 py-6">

        @if (profiles().length === 0) {
          <div class="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
            <p class="text-sm text-gray-400">Henüz profil yok.</p>
            <p class="mt-1 text-xs text-gray-300">Yukarıdaki butona tıklayarak ilk profili oluştur.</p>
          </div>
        }

        <div
          data-testid="profile-list"
          class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          @for (profile of profiles(); track profile.id) {
            <button
              data-testid="profile-card"
              (click)="goToDetail(profile.id)"
              class="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 pt-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md text-center"
            >
              <!-- Avatar / Fotoğraf -->
              @if (profile.photoDataUrl) {
                <img
                  [src]="profile.photoDataUrl"
                  alt="{{ profile.firstName }} {{ profile.lastName }}"
                  class="mb-3 h-20 w-20 rounded-full object-cover"
                />
              } @else {
                <div class="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-700 select-none">
                  {{ initials(profile) }}
                </div>
              }

              <!-- Ad Soyad -->
              <p
                data-testid="profile-label"
                class="text-sm font-semibold text-gray-900 leading-tight"
              >
                {{ profile.firstName }} {{ profile.lastName }}
              </p>

              <!-- Özet ölçüler -->
              @if (profile.height || profile.weight) {
                <p class="mt-1 text-xs text-gray-400">
                  {{ profile.height ? profile.height + ' cm' : '' }}
                  {{ profile.height && profile.weight ? '·' : '' }}
                  {{ profile.weight ? profile.weight + ' kg' : '' }}
                </p>
              }
            </button>
          }
        </div>

      </div>
    </div>
  `,
})
export class TalentListComponent {
  private readonly router = inject(Router);
  private readonly service = inject(TalentProfileService);

  protected readonly profiles = this.service.profiles;

  protected goToNew(): void {
    this.router.navigate(['/talents/new']);
  }

  protected goToDetail(id: number): void {
    this.router.navigate(['/talents', id]);
  }

  protected initials(profile: TalentProfile): string {
    return `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase();
  }
}
