import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['/']);
};

export const administrativeRoleGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.hasAdministrativeRole) {
    return true;
  }

  return router.createUrlTree(['/']);
};

export const activeRoleGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.hasActiveRole) {
    return true;
  }

  return router.createUrlTree(['/']);
};
