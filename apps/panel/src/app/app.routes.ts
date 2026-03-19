import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  {
    path: 'users',
    loadComponent: () =>
      import('./users/user-list.component').then((m) => m.UserListComponent),
  },

  // Talents — sıra önemli: 'new' mutlaka ':id' rotasından önce gelmeli
  {
    path: 'talents',
    loadComponent: () =>
      import('./talents/talent-list.component').then((m) => m.TalentListComponent),
  },
  {
    path: 'talents/new',
    loadComponent: () =>
      import('./talents/talent-profile-form.component').then((m) => m.TalentProfileFormComponent),
  },
  {
    path: 'talents/:id',
    loadComponent: () =>
      import('./talents/talent-profile-detail.component').then((m) => m.TalentProfileDetailComponent),
  },
  {
    path: 'talents/:id/edit',
    loadComponent: () =>
      import('./talents/talent-profile-form.component').then((m) => m.TalentProfileFormComponent),
  },

  // Settings
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings.component').then((m) => m.SettingsComponent),
  },

  // Portfolio Package — talent selection & package creation flow
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./portfolio/talent-selection.component').then((m) => m.TalentSelectionComponent),
  },
  {
    path: 'portfolio/package',
    loadComponent: () =>
      import('./portfolio/portfolio-package.component').then((m) => m.PortfolioPackageComponent),
  },

  // Statement
  {
    path: 'statement',
    loadComponent: () =>
      import('./statement/statement.component').then((m) => m.StatementComponent),
  },

  // Bookings
  {
    path: 'bookings',
    loadComponent: () =>
      import('./bookings/booking-list.component').then((m) => m.BookingListComponent),
  },
  {
    path: 'bookings/:id',
    loadComponent: () =>
      import('./bookings/booking-detail.component').then((m) => m.BookingDetailComponent),
  },
];
