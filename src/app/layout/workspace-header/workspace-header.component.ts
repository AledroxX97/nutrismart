import { Component, computed, inject } from '@angular/core';
import { ROLE_LABELS } from '../../core/models/role.model';
import { LocalSessionService } from '../../core/services/local-session.service';

@Component({
  selector: 'ns-workspace-header',
  templateUrl: './workspace-header.component.html',
  styleUrl: './workspace-header.component.css',
})
export class WorkspaceHeaderComponent {
  private readonly session = inject(LocalSessionService);
  readonly role = this.session.role;
  readonly roleLabel = this.session.roleLabel;
  readonly displayName = computed(() => {
    const role = this.role();
    return role === 'nutricionista'
      ? 'Dr. Sebastian Bassa'
      : role === 'administrador'
        ? 'Daniel Henriquez'
        : 'Bryan Fernandez';
  });
  readonly initials = computed(() => {
    const role = this.role();
    return role === 'nutricionista' ? 'LM' : role === 'administrador' ? 'CT' : 'MR';
  });
  readonly roleTitle = computed(() => {
    const role = this.role();
    return role ? ROLE_LABELS[role] : '';
  });
}
