import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MOCK_TALENTS, PortfolioService } from './portfolio.service';

@Component({
  selector: 'app-talent-selection',
  standalone: true,
  imports: [],
  template: `
    <!-- Toolbar -->
    <div
      data-testid="talent-select-toolbar"
      class="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shadow-sm"
    >
      <span
        data-testid="talent-selected-count"
        class="text-sm font-medium text-gray-600"
      >
        {{ svc.selectedCount() }} talent seçildi
      </span>

      <button
        data-testid="talent-create-package-button"
        [disabled]="svc.selectedCount() === 0"
        (click)="createPackage()"
        class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
        [class]="
          svc.selectedCount() > 0
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        "
      >
        Paket Oluştur
      </button>
    </div>

    <!-- Talent list -->
    <main
      data-testid="talent-page"
      class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      @for (talent of talents; track talent.id) {
        <label
          class="relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 cursor-pointer transition-colors"
          [class]="
            svc.isSelected(talent.id)
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          "
        >
          <!-- Checkbox (hidden visually but accessible) -->
          <input
            type="checkbox"
            data-testid="talent-checkbox"
            [checked]="svc.isSelected(talent.id)"
            (change)="svc.toggle(talent.id)"
            class="absolute top-3 right-3 h-4 w-4 accent-indigo-600"
          />

          <!-- Photo placeholder -->
          <div
            data-testid="talent-photo"
            class="h-20 w-20 rounded-full flex items-center justify-center text-white text-xl font-bold select-none"
            [class]="talent.avatarColor"
          >
            {{ talent.initials }}
          </div>

          <!-- Name -->
          <span
            data-testid="talent-label"
            class="text-sm font-semibold text-gray-800 text-center"
          >
            {{ talent.fullName }}
          </span>
        </label>
      }
    </main>
  `,
})
export class TalentSelectionComponent {
  protected readonly svc = inject(PortfolioService);
  protected readonly talents = MOCK_TALENTS;
  private readonly router = inject(Router);

  protected createPackage(): void {
    this.router.navigate(['/portfolio/package']);
  }
}
