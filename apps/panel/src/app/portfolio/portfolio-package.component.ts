import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PortfolioService } from './portfolio.service';

@Component({
  selector: 'app-portfolio-package',
  standalone: true,
  imports: [],
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
      <h1 class="text-lg font-bold text-gray-800">Portfolio Package</h1>
      <button
        (click)="goBack()"
        class="text-sm text-indigo-600 hover:underline cursor-pointer"
      >
        ← Geri Dön
      </button>
    </div>

    <!-- Package page -->
    <main
      data-testid="package-page"
      class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      @if (svc.selectedTalents().length === 0) {
        <p class="col-span-full text-center text-gray-500 mt-10">
          Hiç talent seçilmedi. Lütfen geri dönüp seçim yapın.
        </p>
      }

      @for (talent of svc.selectedTalents(); track talent.id) {
        <div
          data-testid="package-card"
          class="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <!-- Photo placeholder -->
          <div
            data-testid="package-talent-photo"
            class="h-20 w-20 rounded-full flex items-center justify-center text-white text-xl font-bold select-none"
            [class]="talent.avatarColor"
          >
            {{ talent.initials }}
          </div>

          <!-- Name -->
          <span
            data-testid="package-talent-label"
            class="text-sm font-semibold text-gray-800 text-center"
          >
            {{ talent.fullName }}
          </span>
        </div>
      }
    </main>
  `,
})
export class PortfolioPackageComponent {
  protected readonly svc = inject(PortfolioService);
  private readonly router = inject(Router);

  protected goBack(): void {
    this.router.navigate(['/portfolio']);
  }
}
