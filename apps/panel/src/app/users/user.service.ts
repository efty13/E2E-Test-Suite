import { Injectable, signal } from '@angular/core';
import { User } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly _users = signal<User[]>([
    { id: 1, name: 'Alice Martin',  email: 'alice@example.com',  role: 'admin',  active: true  },
    { id: 2, name: 'Bob Chen',      email: 'bob@example.com',    role: 'editor', active: true  },
    { id: 3, name: 'Carol Yıldız',  email: 'carol@example.com',  role: 'viewer', active: false },
    { id: 4, name: 'David Kowalski',email: 'david@example.com',  role: 'editor', active: true  },
    { id: 5, name: 'Eva Rossi',     email: 'eva@example.com',    role: 'viewer', active: true  },
  ]);

  readonly users = this._users.asReadonly();
}
