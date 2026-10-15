import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ROLE_NAVIGATION } from '../../../../core/models/role.model';
import { LocalSessionService } from '../../../../core/services/local-session.service';

@Component({
  selector: 'ns-module-page',
  imports: [RouterLink],
  templateUrl: './module-page.component.html',
  styleUrl: './module-page.component.css',
})
export class ModulePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly session = inject(LocalSessionService);
  readonly slug = computed(() => this.route.snapshot.paramMap.get('slug') ?? '');
  readonly module = computed(() => {
    const role = this.session.role();
    return role ? (ROLE_NAVIGATION[role].find((item) => item.slug === this.slug()) ?? null) : null;
  });

  returnHome(): void {
    void this.router.navigate(['/inicio']);
  }
}
