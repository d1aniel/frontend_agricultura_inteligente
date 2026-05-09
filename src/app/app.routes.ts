import { Routes } from '@angular/router';
import { Create } from './components/crud/create/create';
import { Login } from './components/auth/login/login';
import { ForgotPassword } from './components/auth/forgot-password/forgot-password';
import { ChangeTemporaryPassword } from './components/auth/change-temporary-password/change-temporary-password';
import { Delete } from './components/crud/delete/delete';
import { Getall } from './components/crud/getall/getall';
import { Update } from './components/crud/update/update';
import { Dashboard } from './components/dashboard/dashboard';
import { ADMIN_ENTITIES } from './models/admin.models';
import { activeRoleGuard, administrativeRoleGuard, authGuard, guestGuard } from './services/auth.guard';

const crudRoutes: Routes = ADMIN_ENTITIES
  .filter((entity) => entity.hideFromRoutes !== true)
  .flatMap((entity) => [
    {
      path: entity.route,
      component: Getall,
      data: { entityKey: entity.key, action: 'getall' }
    },
    {
      path: `${entity.route}/create`,
      component: Create,
      data: { entityKey: entity.key, action: 'create' }
    },
    {
      path: `${entity.route}/update/:id`,
      component: Update,
      data: { entityKey: entity.key, action: 'update' }
    },
    {
      path: `${entity.route}/delete/:id`,
      component: Delete,
      data: { entityKey: entity.key, action: 'delete' }
    }
  ]);

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard], title: 'Iniciar sesion' },
  { path: 'olvide-contrasena', component: ForgotPassword, canActivate: [guestGuard], title: 'Recuperar acceso' },
  { path: 'cambiar-contrasena-temporal', component: ChangeTemporaryPassword, canActivate: [authGuard], title: 'Cambiar contrasena' },
  { path: '', component: Dashboard, canActivate: [authGuard], title: 'Panel general' },
  ...crudRoutes.map((route) => ({
    ...route,
    canActivate: route.data?.['action'] !== 'getall'
      || (route.data?.['entityKey'] && ADMIN_ENTITIES.find((entity) => entity.key === route.data?.['entityKey'])?.requiresAdministrativeRole)
      ? [authGuard, activeRoleGuard, administrativeRoleGuard]
      : [authGuard, activeRoleGuard]
  })),
  { path: '**', redirectTo: '' }
];
