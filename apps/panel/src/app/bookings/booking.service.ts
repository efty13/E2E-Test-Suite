import { Injectable, signal } from '@angular/core';
import { Booking } from './booking.model';

const SEED: Booking[] = [
  {
    id: 1,
    model: 'Alice Martin',
    client: 'Vogue Paris',
    date: '2026-04-10',
    time: '10:00',
    notes: 'Sabah çekimi, doğal ışık tercih edilmeli.',
  },
  {
    id: 2,
    model: 'Kenji Tanaka',
    client: 'Nike Creative',
    date: '2026-04-15',
    time: '14:00',
    notes: 'Spor koleksiyonu, aksiyon pozları.',
  },
  {
    id: 3,
    model: 'Sofia Ferreira',
    client: 'Gucci',
    date: '2026-04-22',
    time: '09:30',
    notes: '',
  },
];

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly _bookings = signal<Booking[]>(SEED);
  readonly bookings = this._bookings.asReadonly();

  private nextId = SEED.length + 1;

  getById(id: number): Booking | undefined {
    return this._bookings().find((b) => b.id === id);
  }

  /** Aynı model + tarih + saat kombinasyonu zaten varsa true döner. excludeId edit modunda mevcut kaydı hariç tutar. */
  hasConflict(model: string, date: string, time: string, excludeId?: number): boolean {
    return this._bookings().some(
      (b) => b.model === model && b.date === date && b.time === time && b.id !== excludeId,
    );
  }

  add(data: Omit<Booking, 'id'>): Booking {
    const booking: Booking = { ...data, id: this.nextId++ };
    this._bookings.update((list) => [...list, booking]);
    return booking;
  }

  update(id: number, data: Omit<Booking, 'id'>): void {
    this._bookings.update((list) =>
      list.map((b) => (b.id === id ? { ...data, id } : b)),
    );
  }

  delete(id: number): void {
    this._bookings.update((list) => list.filter((b) => b.id !== id));
  }
}
