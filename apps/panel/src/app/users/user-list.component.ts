import { Component, inject } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Users</h1>
        <span class="count">{{ users().length }} users</span>
      </header>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          @for (user of users(); track user.id) {
            <tr>
              <td>{{ user.name }}</td>
              <td class="email">{{ user.email }}</td>
              <td><span class="badge badge-{{ user.role }}">{{ user.role }}</span></td>
              <td><span class="badge" [class.badge-active]="user.active" [class.badge-inactive]="!user.active">
                {{ user.active ? 'Active' : 'Inactive' }}
              </span></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .page {
      max-width: 860px;
      margin: 40px auto;
      padding: 0 24px;
      font-family: system-ui, sans-serif;
    }

    .page-header {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 24px;

      h1 { margin: 0; font-size: 1.5rem; }

      .count {
        font-size: 0.875rem;
        color: #6b7280;
      }
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    th {
      text-align: left;
      padding: 10px 14px;
      border-bottom: 2px solid #e5e7eb;
      color: #374151;
      font-weight: 600;
    }

    td {
      padding: 12px 14px;
      border-bottom: 1px solid #f3f4f6;
      color: #111827;

      &.email { color: #6b7280; }
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f9fafb; }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 500;
      background: #e5e7eb;
      color: #374151;

      &.badge-admin  { background: #ede9fe; color: #6d28d9; }
      &.badge-editor { background: #dbeafe; color: #1d4ed8; }
      &.badge-viewer { background: #f3f4f6; color: #6b7280; }

      &.badge-active   { background: #d1fae5; color: #065f46; }
      &.badge-inactive { background: #fee2e2; color: #991b1b; }
    }
  `,
})
export class UserListComponent {
  protected readonly users = inject(UserService).users;
}
