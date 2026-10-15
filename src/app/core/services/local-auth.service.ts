import { Injectable } from '@angular/core';
import { UserRole } from '../models/role.model';

const ACCOUNTS_KEY = 'nutrismart.demo.accounts';

export interface DemoAccount {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 1,
    name: 'Daniel Henriquez',
    email: 'daniel@email.co',
    password: 'admin2026',
    role: 'administrador',
    active: true,
  },
  {
    id: 2,
    name: 'Sebastian Bassa',
    email: 'sebastian@email.co',
    password: 'nutri2026',
    role: 'nutricionista',
    active: true,
  },
  {
    id: 3,
    name: 'Bryan Fernandez',
    email: 'bryan.fernandez@email.co',
    password: 'paciente2026',
    role: 'paciente',
    active: true,
  },
];

@Injectable({ providedIn: 'root' })
export class LocalAuthService {
  authenticate(email: string, password: string, role: UserRole): DemoAccount | null {
    const normalizedEmail = email.trim().toLocaleLowerCase('es-CO');
    const account = this.loadAccounts().find(
      (item) =>
        item.email.toLocaleLowerCase('es-CO') === normalizedEmail &&
        item.password === password &&
        item.role === role &&
        item.active,
    );

    return account ?? null;
  }

  private loadAccounts(): DemoAccount[] {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    if (stored) {
      try {
        const accounts: unknown = JSON.parse(stored);
        if (Array.isArray(accounts)) return accounts as DemoAccount[];
      } catch {
       
      }
    }

    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEMO_ACCOUNTS));
    return DEMO_ACCOUNTS;
  }
}
