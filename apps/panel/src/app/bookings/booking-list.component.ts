import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BookingModalComponent } from './booking-modal.component';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [BookingModalComponent],
  template: `
    <div data-testid="booking-page" class="min-h-screen bg-gray-50">

      <!-- Header -->
      <div class="border-b border-gray-200 bg-white px-6 py-4">
        <div class="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 class="text-lg font-semibold text-gray-900">Bookings</h1>
            <p class="text-sm text-gray-400">{{ bookings().length }} kayıt</p>
          </div>
          <button
            data-testid="booking-new-button"
            (click)="isModalOpen.set(true)"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            + Yeni Booking
          </button>
        </div>
      </div>

      <!-- List -->
      <div class="mx-auto max-w-3xl px-6 py-6">
        <div data-testid="booking-list" class="space-y-3">

          @if (bookings().length === 0) {
            <div class="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <p class="text-sm text-gray-400">Henüz booking yok.</p>
              <p class="mt-1 text-xs text-gray-300">
                Yukarıdaki butona tıklayarak ilk booking'i oluştur.
              </p>
            </div>
          }

          @for (booking of bookings(); track booking.id) {
            <button
              data-testid="booking-list-item"
              (click)="goToDetail(booking.id)"
              class="flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md text-left"
            >
              <!-- Avatar -->
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 select-none">
                {{ initials(booking.model) }}
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1">
                <p
                  data-testid="booking-label"
                  class="truncate text-sm font-semibold text-gray-900"
                >
                  {{ booking.model }}
                </p>
                <p class="truncate text-xs text-gray-500">{{ booking.client }}</p>
              </div>

              <!-- Date & time -->
              <div class="shrink-0 text-right">
                <p class="text-sm font-medium text-gray-700">{{ formatDate(booking.date) }}</p>
                <p class="text-xs text-gray-400">{{ booking.time }}</p>
              </div>

              <!-- Chevron -->
              <svg class="h-4 w-4 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          }

        </div>
      </div>
    </div>

    @if (isModalOpen()) {
      <app-booking-modal (closed)="isModalOpen.set(false)" />
    }
  `,
})
export class BookingListComponent {
  private readonly service = inject(BookingService);
  private readonly router = inject(Router);

  protected readonly bookings = this.service.bookings;
  protected readonly isModalOpen = signal(false);

  protected goToDetail(id: number): void {
    this.router.navigate(['/bookings', id]);
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
