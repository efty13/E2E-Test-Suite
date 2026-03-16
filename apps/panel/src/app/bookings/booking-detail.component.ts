import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingModalComponent } from './booking-modal.component';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [BookingModalComponent],
  template: `
    <div data-testid="booking-detail-page" class="min-h-screen bg-gray-50">

      <!-- Header -->
      <div class="border-b border-gray-200 bg-white px-6 py-4">
        <div class="mx-auto flex max-w-2xl items-center gap-4">
          <button
            data-testid="booking-back-button"
            (click)="goBack()"
            class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Geri
          </button>
          <h1 class="text-lg font-semibold text-gray-900">Booking Detayı</h1>
        </div>
      </div>

      <div class="mx-auto max-w-2xl px-6 py-8">

        @if (booking()) {
          <!-- Detail card -->
          <div class="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <!-- Avatar + name banner -->
            <div class="flex items-center gap-4 border-b border-gray-100 px-6 py-5">
              <div class="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700 select-none">
                {{ initials(booking()!.model) }}
              </div>
              <div>
                <p
                  data-testid="booking-detail-model"
                  class="text-base font-semibold text-gray-900"
                >
                  {{ booking()!.model }}
                </p>
                <p
                  data-testid="booking-detail-client"
                  class="text-sm text-gray-500"
                >
                  {{ booking()!.client }}
                </p>
              </div>
            </div>

            <!-- Fields -->
            <dl class="divide-y divide-gray-100 px-6">

              <div class="flex justify-between py-4">
                <dt class="text-sm font-medium text-gray-500">Tarih</dt>
                <dd
                  data-testid="booking-detail-date"
                  class="text-sm font-medium text-gray-900"
                >
                  {{ formatDate(booking()!.date) }}
                </dd>
              </div>

              <div class="flex justify-between py-4">
                <dt class="text-sm font-medium text-gray-500">Saat</dt>
                <dd
                  data-testid="booking-detail-time"
                  class="text-sm font-medium text-gray-900"
                >
                  {{ booking()!.time }}
                </dd>
              </div>

              <div class="py-4">
                <dt class="mb-2 text-sm font-medium text-gray-500">Notlar</dt>
                <dd
                  data-testid="booking-detail-notes"
                  class="text-sm text-gray-700 whitespace-pre-line"
                >
                  {{ booking()!.notes || '—' }}
                </dd>
              </div>

            </dl>
          </div>

          <!-- Actions -->
          <div class="mt-4 flex gap-3">
            <button
              data-testid="booking-edit-button"
              (click)="isEditModalOpen.set(true)"
              class="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Düzenle
            </button>
            <button
              data-testid="booking-delete-button"
              (click)="delete()"
              class="flex-1 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50"
            >
              Sil
            </button>
          </div>

        } @else {
          <div class="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <p class="text-sm text-gray-400">Booking bulunamadı.</p>
          </div>
        }

      </div>
    </div>

    @if (isEditModalOpen()) {
      <app-booking-modal
        [bookingId]="bookingId"
        (closed)="isEditModalOpen.set(false)"
      />
    }
  `,
})
export class BookingDetailComponent {
  private readonly service = inject(BookingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly bookingId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly booking = computed(() => this.service.getById(this.bookingId));
  protected readonly isEditModalOpen = signal(false);

  protected goBack(): void {
    this.router.navigate(['/bookings']);
  }

  protected delete(): void {
    this.service.delete(this.bookingId);
    this.router.navigate(['/bookings']);
  }

  protected initials(name: string): string {
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  }

  protected formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
