import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TalentProfileService } from './talent-profile.service';

@Component({
  selector: 'app-talent-profile-form',
  standalone: true,
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- Header -->
      <div class="border-b border-gray-200 bg-white px-6 py-4">
        <div class="mx-auto flex max-w-2xl items-center gap-4">
          <button
            data-testid="profile-back-button"
            (click)="cancel()"
            class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Geri
          </button>
          <h1 class="text-lg font-semibold text-gray-900">
            {{ isEditMode() ? 'Profili Düzenle' : 'Yeni Profil' }}
          </h1>
        </div>
      </div>

      <!-- Form -->
      <div class="mx-auto max-w-2xl px-6 py-8">
        <form
          data-testid="profile-form"
          (submit)="$event.preventDefault(); save()"
          class="space-y-6 rounded-2xl bg-white p-8 shadow-sm"
        >

          <!-- Fotoğraf yükleme -->
          <div class="flex flex-col items-center gap-4">
            @if (photoDataUrl()) {
              <img
                data-testid="profile-photo-preview"
                [src]="photoDataUrl()"
                alt="Profil fotoğrafı önizleme"
                class="h-28 w-28 rounded-full object-cover ring-2 ring-indigo-200"
              />
            } @else {
              <div class="flex h-28 w-28 items-center justify-center rounded-full bg-gray-100 text-3xl font-semibold text-gray-300 select-none">
                {{ previewInitials() }}
              </div>
            }

            <label class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Fotoğraf Seç
              <input
                data-testid="profile-photo-input"
                type="file"
                accept="image/*"
                class="hidden"
                (change)="onPhotoChange($event)"
              />
            </label>
          </div>

          <!-- Ad & Soyad -->
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Ad <span class="text-red-400">*</span></label>
              <input
                data-testid="profile-first-name-input"
                type="text"
                [value]="firstName()"
                (input)="firstName.set($any($event.target).value)"
                placeholder="Ad"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Soyad <span class="text-red-400">*</span></label>
              <input
                data-testid="profile-last-name-input"
                type="text"
                [value]="lastName()"
                (input)="lastName.set($any($event.target).value)"
                placeholder="Soyad"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- Boy & Kilo -->
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Boy (cm)</label>
              <input
                data-testid="profile-height-input"
                type="number"
                [value]="height()"
                (input)="height.set($any($event.target).value)"
                placeholder="175"
                min="0"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Kilo (kg)</label>
              <input
                data-testid="profile-weight-input"
                type="number"
                [value]="weight()"
                (input)="weight.set($any($event.target).value)"
                placeholder="60"
                min="0"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- Göz Rengi & Saç Rengi -->
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Göz Rengi</label>
              <input
                data-testid="profile-eye-color-input"
                type="text"
                [value]="eyeColor()"
                (input)="eyeColor.set($any($event.target).value)"
                placeholder="Kahverengi"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Saç Rengi</label>
              <input
                data-testid="profile-hair-color-input"
                type="text"
                [value]="hairColor()"
                (input)="hairColor.set($any($event.target).value)"
                placeholder="Siyah"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- Validation hatası -->
          @if (showError()) {
            <p
              data-testid="profile-form-error"
              class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
            >
              Ad ve Soyad alanları zorunludur.
            </p>
          }

          <!-- Eylemler -->
          <div class="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              data-testid="profile-cancel-button"
              type="button"
              (click)="cancel()"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              İptal
            </button>
            <button
              data-testid="profile-save-button"
              type="submit"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {{ isEditMode() ? 'Güncelle' : 'Kaydet' }}
            </button>
          </div>

        </form>
      </div>

    </div>
  `,
})
export class TalentProfileFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(TalentProfileService);

  private readonly profileId = signal<number | null>(null);
  readonly isEditMode = computed(() => this.profileId() !== null);

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly height = signal('');
  readonly weight = signal('');
  readonly eyeColor = signal('');
  readonly hairColor = signal('');
  readonly photoDataUrl = signal('');

  private readonly saveTried = signal(false);

  readonly previewInitials = computed(() => {
    const f = this.firstName()[0] ?? '';
    const l = this.lastName()[0] ?? '';
    return (f + l).toUpperCase() || '?';
  });

  private readonly isValid = computed(
    () => this.firstName().trim() !== '' && this.lastName().trim() !== '',
  );

  readonly showError = computed(() => this.saveTried() && !this.isValid());

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      const profile = this.service.getById(id);
      if (profile) {
        this.profileId.set(id);
        this.firstName.set(profile.firstName);
        this.lastName.set(profile.lastName);
        this.height.set(profile.height);
        this.weight.set(profile.weight);
        this.eyeColor.set(profile.eyeColor);
        this.hairColor.set(profile.hairColor);
        this.photoDataUrl.set(profile.photoDataUrl);
      }
    }
  }

  protected onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoDataUrl.set((e.target?.result as string) ?? '');
    };
    reader.readAsDataURL(file);
  }

  protected save(): void {
    this.saveTried.set(true);
    if (!this.isValid()) return;

    const data = {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      height: this.height(),
      weight: this.weight(),
      eyeColor: this.eyeColor(),
      hairColor: this.hairColor(),
      photoDataUrl: this.photoDataUrl(),
    };

    const id = this.profileId();
    if (id !== null) {
      this.service.update(id, data);
      this.router.navigate(['/talents', id]);
    } else {
      const created = this.service.add(data);
      this.router.navigate(['/talents', created.id]);
    }
  }

  protected cancel(): void {
    const id = this.profileId();
    if (id !== null) {
      this.router.navigate(['/talents', id]);
    } else {
      this.router.navigate(['/talents']);
    }
  }
}
