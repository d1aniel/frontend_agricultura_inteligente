import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated) {
    if (auth.currentUser?.requiere_cambio_password === true && !state.url.startsWith('/cambiar-contrasena-temporal')) {
      return router.createUrlTree(['/cambiar-contrasena-temporal']);
    }
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

  if (auth.currentUser?.requiere_cambio_password === true) {
    return router.createUrlTree(['/cambiar-contrasena-temporal']);
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
