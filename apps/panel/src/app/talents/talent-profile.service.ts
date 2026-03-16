import { Injectable, signal } from '@angular/core';
import { TalentProfile } from './talent.model';

const STORAGE_KEY = 'talent-profiles';

@Injectable({ providedIn: 'root' })
export class TalentProfileService {
  private readonly _profiles = signal<TalentProfile[]>(this.loadFromStorage());
  readonly profiles = this._profiles.asReadonly();

  private nextId = this.computeNextId();

  private loadFromStorage(): TalentProfile[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as TalentProfile[]) : [];
    } catch {
      return [];
    }
  }

  private computeNextId(): number {
    const list = this._profiles();
    return list.length > 0 ? Math.max(...list.map((p) => p.id)) + 1 : 1;
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._profiles()));
  }

  getById(id: number): TalentProfile | undefined {
    return this._profiles().find((p) => p.id === id);
  }

  add(data: Omit<TalentProfile, 'id'>): TalentProfile {
    const profile: TalentProfile = { ...data, id: this.nextId++ };
    this._profiles.update((list) => [...list, profile]);
    this.persist();
    return profile;
  }

  update(id: number, data: Omit<TalentProfile, 'id'>): void {
    this._profiles.update((list) =>
      list.map((p) => (p.id === id ? { ...data, id } : p)),
    );
    this.persist();
  }

  delete(id: number): void {
    this._profiles.update((list) => list.filter((p) => p.id !== id));
    this.persist();
  }
}
