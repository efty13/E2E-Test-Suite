import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TalentProfileService } from './talent-profile.service';
import { TalentProfile } from './talent.model';

@Component({
  selector: 'app-talent-profile-detail',
  standalone: true,
  template: `
    @if (profile(); as p) {
      <div data-testid="profile-detail-page" class="min-h-screen bg-gray-50">

        <!-- Header -->
        <div class="border-b border-gray-200 bg-white px-6 py-4">
          <div class="mx-auto flex max-w-2xl items-center gap-4">
            <button
              data-testid="profile-back-button"
              (click)="goBack()"
              class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Geri
            </button>
            <h1 class="text-lg font-semibold text-gray-900">Profil Detayı</h1>
          </div>
        </div>

        <!-- Content -->
        <div class="mx-auto max-w-2xl px-6 py-8 space-y-4">

          <!-- Fotoğraf & İsim kartı -->
          <div class="flex items-center gap-6 rounded-2xl bg-white p-6 shadow-sm">
            @if (p.photoDataUrl) {
              <img
                data-testid="profile-detail-photo"
                [src]="p.photoDataUrl"
                alt="{{ p.firstName }} {{ p.lastName }}"
                class="h-24 w-24 rounded-full object-cover ring-2 ring-indigo-100"
              />
            } @else {
              <div
                data-testid="profile-detail-photo"
                class="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-semibold text-indigo-700 select-none"
              >
                {{ (p.firstName[0] ?? '') + (p.lastName[0] ?? '') }}
              </div>
            }

            <div>
              <p
                data-testid="profile-detail-first-name"
                class="text-xl font-bold text-gray-900"
              >{{ p.firstName }}</p>
              <p
                data-testid="profile-detail-last-name"
                class="text-base text-gray-500"
              >{{ p.lastName }}</p>
            </div>
          </div>

          <!-- Ölçüler -->
          <div class="rounded-2xl bg-white p-6 shadow-sm space-y-3">
            <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ölçüler</h2>

            <div class="flex justify-between border-b border-gray-100 pb-3">
              <span class="text-sm text-gray-500">Boy</span>
              <span data-testid="profile-detail-height" class="text-sm font-medium text-gray-900">
                {{ p.height ? p.height + ' cm' : '—' }}
              </span>
            </div>

            <div class="flex justify-between border-b border-gray-100 pb-3">
              <span class="text-sm text-gray-500">Kilo</span>
              <span data-testid="profile-detail-weight" class="text-sm font-medium text-gray-900">
                {{ p.weight ? p.weight + ' kg' : '—' }}
              </span>
            </div>

            <div class="flex justify-between border-b border-gray-100 pb-3">
              <span class="text-sm text-gray-500">Göz Rengi</span>
              <span data-testid="profile-detail-eye-color" class="text-sm font-medium text-gray-900">
                {{ p.eyeColor || '—' }}
              </span>
            </div>

            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Saç Rengi</span>
              <span data-testid="profile-detail-hair-color" class="text-sm font-medium text-gray-900">
                {{ p.hairColor || '—' }}
              </span>
            </div>
          </div>

          <!-- Eylemler -->
          <div class="grid grid-cols-2 gap-3">
            <button
              data-testid="profile-edit-button"
              (click)="goToEdit()"
              class="rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm hover:border-indigo-200 hover:text-indigo-700"
            >
              Düzenle
            </button>
            <button
              data-testid="profile-delete-button"
              (click)="delete()"
              class="rounded-xl border border-red-100 bg-white py-3 text-sm font-semibold text-red-500 shadow-sm hover:bg-red-50"
            >
              Sil
            </button>
          </div>

        </div>
      </div>
    } @else {
      <!-- Profil bulunamadı -->
      <div class="flex min-h-screen items-center justify-center">
        <div class="text-center">
          <p class="text-sm text-gray-400">Profil bulunamadı.</p>
          <button
            (click)="goBack()"
            class="mt-4 text-sm text-indigo-600 hover:text-indigo-800"
          >
            Listeye dön
          </button>
        </div>
      </div>
    }
  `,
})
export class TalentProfileDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(TalentProfileService);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly profile = signal<TalentProfile | undefined>(
    this.service.getById(this.id),
  );

  protected goBack(): void {
    this.router.navigate(['/talents']);
  }

  protected goToEdit(): void {
    this.router.navigate(['/talents', this.id, 'edit']);
  }

  protected delete(): void {
    this.service.delete(this.id);
    this.router.navigate(['/talents']);
  }
}
