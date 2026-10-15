import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ROLE_NAVIGATION, UserRole } from '../../core/models/role.model';
import { LocalSessionService } from '../../core/services/local-session.service';
import { AppBrandComponent } from '../../shared/components/app-brand/app-brand.component';

@Component({
  selector: 'ns-workspace-sidebar',
  imports: [RouterLink, RouterLinkActive, AppBrandComponent],
  templateUrl: './workspace-sidebar.component.html',
  styleUrl: './workspace-sidebar.component.css',
})
export class WorkspaceSidebarComponent {
  private readonly router = inject(Router);
  private readonly session = inject(LocalSessionService);
  readonly navigation = computed(() => ROLE_NAVIGATION[this.session.role() ?? 'nutricionista']);

  iconFor(icon: string): string {
    const icons: Record<string, string> = {
      people: '♙',
      nutrition: '◉',
      location: '⌖',
      tune: '⚙',
      library: '▤',
      restaurant: '◒',
      monitor: '↗',
      calendar: '▦',
      sparkles: '✳',
      check: '✓',
    };
    return icons[icon] ?? '•';
  }

  changeProfile(): void {
    this.session.closeDemoSession();
    void this.router.navigate(['/acceso']);
  }
}
