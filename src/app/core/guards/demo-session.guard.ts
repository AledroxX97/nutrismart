import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocalSessionService } from '../services/local-session.service';

export const demoSessionGuard: CanActivateFn = () => {
  const session = inject(LocalSessionService);
  return session.role() ? true : inject(Router).createUrlTree(['/acceso']);
};
