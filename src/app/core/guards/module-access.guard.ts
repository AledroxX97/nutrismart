import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ROLE_NAVIGATION } from '../models/role.model';
import { LocalSessionService } from '../services/local-session.service';

export const moduleAccessGuard: CanActivateFn = (route) => {
  const session = inject(LocalSessionService);
  const router = inject(Router);
  const role = session.role();
  if (!role) return router.createUrlTree(['/acceso']);
  const slug = route.paramMap.get('slug') ?? route.data['moduleSlug'];
  return ROLE_NAVIGATION[role].some((item) => item.slug === slug)
    ? true
    : router.createUrlTree(['/inicio']);
};
