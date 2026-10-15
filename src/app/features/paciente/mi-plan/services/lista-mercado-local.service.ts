import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'nutrismart.mi-plan.lista-mercado';

@Injectable({ providedIn: 'root' })
export class ListaMercadoLocalService {
  private readonly checkedState = signal<string[]>(this.load());
  readonly checkedItems = this.checkedState.asReadonly();

  toggle(key: string): void {
    const current = this.checkedState();
    const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
    this.checkedState.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  private load(): string[] {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : [];
    } catch {
      return [];
    }
  }
}
