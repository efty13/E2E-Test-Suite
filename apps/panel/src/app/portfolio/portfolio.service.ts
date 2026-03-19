import { Injectable, signal } from '@angular/core';

export interface Talent {
  id: number;
  fullName: string;
  initials: string;
  avatarColor: string;
}

export const MOCK_TALENTS: Talent[] = [
  { id: 1, fullName: 'Ayşe Yılmaz',   initials: 'AY', avatarColor: 'bg-rose-400'    },
  { id: 2, fullName: 'Mehmet Kara',   initials: 'MK', avatarColor: 'bg-slate-500'   },
  { id: 3, fullName: 'Zeynep Demir',  initials: 'ZD', avatarColor: 'bg-violet-400'  },
  { id: 4, fullName: 'Can Öztürk',    initials: 'CÖ', avatarColor: 'bg-amber-400'   },
  { id: 5, fullName: 'Elif Aksoy',    initials: 'EA', avatarColor: 'bg-emerald-400' },
  { id: 6, fullName: 'Burak Çelik',   initials: 'BÇ', avatarColor: 'bg-sky-400'     },
];

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly _selectedIds = signal<Set<number>>(new Set());
  readonly selectedIds = this._selectedIds.asReadonly();

  toggle(id: number): void {
    this._selectedIds.update((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isSelected(id: number): boolean {
    return this._selectedIds().has(id);
  }

  selectedCount(): number {
    return this._selectedIds().size;
  }

  selectedTalents(): Talent[] {
    const ids = this._selectedIds();
    return MOCK_TALENTS.filter((t) => ids.has(t.id));
  }

  clearAll(): void {
    this._selectedIds.set(new Set());
  }
}
