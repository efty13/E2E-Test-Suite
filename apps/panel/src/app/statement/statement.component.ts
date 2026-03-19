import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Booking {
  id: number;
  label: string;
  fee: number;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
}

const INITIAL_BOOKINGS: Booking[] = [
  { id: 1, label: 'Wedding Shoot – Ayşe & Mert', fee: 1000 },
  { id: 2, label: 'Corporate Event – TechConf 2026', fee: 2000 },
  { id: 3, label: 'Portrait Session – Studio Day', fee: 1500 },
];

@Component({
  selector: 'app-statement',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 px-6 py-8" data-testid="statement-page">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Statement</h1>
        <p class="mt-1 text-sm text-gray-500">Booking fees, expenses and commission summary</p>
      </div>

      <div class="mx-auto max-w-3xl space-y-6">

        <!-- Booking List -->
        <section class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-base font-semibold text-gray-700">Bookings</h2>
          <ul data-testid="statement-booking-list" class="divide-y divide-gray-100">
            @for (booking of bookings; track booking.id) {
              <li
                class="flex items-center justify-between py-3"
                data-testid="statement-booking-item"
              >
                <span
                  class="text-sm text-gray-800"
                  data-testid="statement-booking-label"
                >{{ booking.label }}</span>
                <span
                  class="font-mono text-sm font-medium text-gray-900"
                  data-testid="statement-booking-fee"
                >{{ booking.fee }}</span>
              </li>
            }
          </ul>
        </section>

        <!-- Expense Form -->
        <section class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-base font-semibold text-gray-700">Add Expense</h2>
          <form
            data-testid="statement-expense-form"
            (ngSubmit)="addExpense()"
            class="flex gap-3"
          >
            <input
              type="text"
              placeholder="Description"
              [(ngModel)]="newDescription"
              name="description"
              data-testid="statement-expense-description-input"
              class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Amount"
              [(ngModel)]="newAmount"
              name="amount"
              min="0"
              data-testid="statement-expense-amount-input"
              class="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              data-testid="statement-expenseadd-button"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
              [disabled]="!newDescription || newAmount <= 0"
            >
              Add
            </button>
          </form>
        </section>

        <!-- Expense List -->
        @if (expenses().length > 0) {
          <section class="rounded-2xl bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-base font-semibold text-gray-700">Expenses</h2>
            <ul data-testid="statement-expense-list" class="divide-y divide-gray-100">
              @for (expense of expenses(); track expense.id) {
                <li
                  class="flex items-center justify-between py-3"
                  data-testid="statement-expense-item"
                >
                  <span
                    class="text-sm text-gray-800"
                    data-testid="statement-expense-label"
                  >{{ expense.description }}</span>
                  <span
                    class="font-mono text-sm font-medium text-red-600"
                    data-testid="statement-expense-amount"
                  >{{ expense.amount }}</span>
                </li>
              }
            </ul>
          </section>
        }

        <!-- Commission Rate -->
        <section class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-base font-semibold text-gray-700">Commission Rate</h2>
          <div class="flex items-center gap-3">
            <input
              type="number"
              [(ngModel)]="commissionRate"
              name="commissionRate"
              min="0"
              max="100"
              data-testid="statement-commission-rate-input"
              class="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-500">%</span>
          </div>
        </section>

        <!-- Summary -->
        <section class="rounded-2xl bg-indigo-50 p-6 shadow-sm">
          <h2 class="mb-4 text-base font-semibold text-indigo-800">Summary</h2>
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-sm text-gray-600">Total Fees</dt>
              <dd
                class="font-mono text-sm font-semibold text-gray-900"
                data-testid="statement-total-fees"
              >{{ totalFees() }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-600">Total Expenses</dt>
              <dd
                class="font-mono text-sm font-semibold text-red-600"
                data-testid="statement-total-expenses"
              >{{ totalExpenses() }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-600">Commission ({{ commissionRate }}%)</dt>
              <dd
                class="font-mono text-sm font-semibold text-orange-600"
                data-testid="statement-commission-total"
              >{{ commission() }}</dd>
            </div>
            <div class="flex justify-between border-t border-indigo-200 pt-3">
              <dt class="text-sm font-semibold text-gray-800">Net Amount</dt>
              <dd
                class="font-mono text-sm font-bold text-indigo-700"
                data-testid="statement-net-amount"
              >{{ netAmount() }}</dd>
            </div>
          </dl>
        </section>

      </div>
    </div>
  `,
})
export class StatementComponent {
  readonly bookings: Booking[] = INITIAL_BOOKINGS;

  readonly expenses = signal<Expense[]>([]);

  readonly commissionRateSignal = signal<number>(20);
  newDescription = '';
  newAmount = 0;

  private nextExpenseId = 1;

  get commissionRate(): number {
    return this.commissionRateSignal();
  }

  set commissionRate(value: number) {
    this.commissionRateSignal.set(Number(value));
  }

  readonly totalFees = computed(() =>
    this.bookings.reduce((sum, b) => sum + b.fee, 0)
  );

  readonly totalExpenses = computed(() =>
    this.expenses().reduce((sum, e) => sum + e.amount, 0)
  );

  readonly commission = computed(() =>
    this.totalFees() * (this.commissionRateSignal() / 100)
  );

  readonly netAmount = computed(() =>
    this.totalFees() - this.totalExpenses() - this.commission()
  );

  addExpense(): void {
    if (!this.newDescription || this.newAmount <= 0) return;
    this.expenses.update((list) => [
      ...list,
      {
        id: this.nextExpenseId++,
        description: this.newDescription,
        amount: this.newAmount,
      },
    ]);
    this.newDescription = '';
    this.newAmount = 0;
  }
}
