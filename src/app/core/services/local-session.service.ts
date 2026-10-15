import { computed, Injectable, signal } from '@angular/core';
import { ROLE_LABELS, ROLES, UserRole } from '../models/role.model';

const SESSION_KEY = 'nutrismart.demo.role';

@Injectable({ providedIn: 'root' })
export class LocalSessionService {
  private readonly roleState = signal<UserRole | null>(this.readRole());

  readonly role = this.roleState.asReadonly();
  readonly roleLabel = computed(() => {
    const role = this.roleState();
    return role ? ROLE_LABELS[role] : null;
  });

  selectRole(role: UserRole): void {
    this.roleState.set(role);
    localStorage.setItem(SESSION_KEY, role);
  }

  closeDemoSession(): void {
    localStorage.removeItem(SESSION_KEY);
    this.roleState.set(null);
  }

  private readRole(): UserRole | null {
    const role = localStorage.getItem(SESSION_KEY);
    return role && ROLES.includes(role as UserRole) ? (role as UserRole) : null;
  }
}
