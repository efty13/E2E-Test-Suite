import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { BookingService } from './booking.service';

export const MOCK_MODELS = [
  'Alice Martin',
  'James Whitfield',
  'Sofia Ferreira',
  'Kenji Tanaka',
  'Amara Osei',
  'Lukas Hoffmann',
];

export const MOCK_CLIENTS = [
  'Vogue Paris',
  'H&M Studio',
  'Nike Creative',
  'Zara Campaign',
  "L'Oréal Paris",
  'Gucci',
];

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  template: `
    <!-- Backdrop (görsel; tıklama dialog container'da yakalanır) -->
    <div class="fixed inset-0 z-40 bg-black/50" aria-hidden="true"></div>

    <!-- Dialog container — dış alana tıklayınca kapanır -->
    <div
      data-testid="booking-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      (click)="cancel()"
    >
      <!-- Kart — tıklama propagasyonu durdurulur, modal kapanmaz -->
      <div class="w-full max-w-md rounded-2xl bg-white shadow-xl" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 id="modal-title" class="text-base font-semibold text-gray-900">
            {{ bookingId() !== null ? 'Booking Düzenle' : 'Yeni Booking' }}
          </h2>
          <button
            (click)="cancel()"
            class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Kapat"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <div class="space-y-4 px-6 py-5">

          <!-- Model -->
          <div class="flex flex-col gap-1.5">
            <label for="modal-model" class="text-sm font-medium text-gray-700">Model</label>
            <select
              id="modal-model"
              data-testid="booking-model-select"
              (change)="onFieldChange(); selectedModel.set($any($event.target).value)"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Model seçin</option>
              @for (m of models; track m) {
                <option [value]="m">{{ m }}</option>
              }
            </select>
          </div>

          <!-- Client -->
          <div class="flex flex-col gap-1.5">
            <label for="modal-client" class="text-sm font-medium text-gray-700">Client</label>
            <select
              id="modal-client"
              data-testid="booking-client-select"
              (change)="selectedClient.set($any($event.target).value)"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Client seçin</option>
              @for (c of clients; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>

          <!-- Date & Time -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label for="modal-date" class="text-sm font-medium text-gray-700">Tarih</label>
              <input
                id="modal-date"
                type="date"
                data-testid="booking-date-input"
                [value]="date()"
                (input)="onFieldChange(); date.set($any($event.target).value)"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="modal-time" class="text-sm font-medium text-gray-700">Saat</label>
              <input
                id="modal-time"
                type="time"
                data-testid="booking-time-input"
                [value]="time()"
                (input)="onFieldChange(); time.set($any($event.target).value)"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- Notes -->
          <div class="flex flex-col gap-1.5">
            <label for="modal-notes" class="text-sm font-medium text-gray-700">
              Notlar <span class="text-gray-400 font-normal">(opsiyonel)</span>
            </label>
            <textarea
              id="modal-notes"
              data-testid="booking-notes-input"
              [value]="notes()"
              (input)="notes.set($any($event.target).value)"
              rows="3"
              placeholder="Çekim notları, özel istekler…"
              class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            ></textarea>
          </div>

          <!-- Validation error -->
          @if (showError()) {
            <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              Kaydetmek için boş alanları doldurun.
            </p>
          }

          <!-- Conflict error -->
          @if (showConflictError()) {
            <p data-testid="booking-conflict-error" class="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Bu model için seçilen tarih ve saatte zaten bir booking var.
            </p>
          }
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            data-testid="booking-cancel-button"
            (click)="cancel()"
            class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            İptal
          </button>
          <button
            data-testid="booking-save-button"
            (click)="save()"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Kaydet
          </button>
        </div>

      </div>
    </div>
  `,
})
export class BookingModalComponent {
  protected readonly models = MOCK_MODELS;
  protected readonly clients = MOCK_CLIENTS;

  /** null → create mode, number → edit mode */
  readonly bookingId = input<number | null>(null);
  readonly closed = output<void>();

  protected readonly selectedModel = signal('');
  protected readonly selectedClient = signal('');
  protected readonly date = signal('');
  protected readonly time = signal('');
  protected readonly notes = signal('');

  private readonly _saveTried = signal(false);
  protected readonly showConflictError = signal(false);

  private readonly isFormValid = computed(
    () =>
      this.selectedModel() !== '' &&
      this.selectedClient() !== '' &&
      this.date() !== '' &&
      this.time() !== '',
  );

  protected readonly showError = computed(
    () => this._saveTried() && !this.isFormValid(),
  );

  private readonly service = inject(BookingService);

  constructor() {
    // Edit modunda mevcut booking verisini forma yükle
    effect(() => {
      const id = this.bookingId();
      if (id === null) return;
      const booking = this.service.getById(id);
      if (!booking) return;
      this.selectedModel.set(booking.model);
      this.selectedClient.set(booking.client);
      this.date.set(booking.date);
      this.time.set(booking.time);
      this.notes.set(booking.notes);
    }, { allowSignalWrites: true });
  }

  /** Herhangi bir alan değiştiğinde conflict hatasını sıfırla */
  protected onFieldChange(): void {
    this.showConflictError.set(false);
  }

  protected save(): void {
    this._saveTried.set(true);
    if (!this.isFormValid()) return;

    const model = this.selectedModel();
    const date = this.date();
    const time = this.time();
    const id = this.bookingId();

    // Conflict kontrolü: aynı model + tarih + saat kombinasyonu var mı?
    // Edit modunda kendi kaydı hariç tutulur.
    if (this.service.hasConflict(model, date, time, id ?? undefined)) {
      this.showConflictError.set(true);
      return;
    }

    const data = {
      model,
      client: this.selectedClient(),
      date,
      time,
      notes: this.notes(),
    };

    if (id !== null) {
      this.service.update(id, data);
    } else {
      this.service.add(data);
    }

    this.closed.emit();
  }

  protected cancel(): void {
    this.closed.emit();
  }
}
