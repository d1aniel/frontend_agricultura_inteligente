import { Routes } from '@angular/router';
import { Create } from './components/crud/create/create';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { VerifyOtp } from './components/auth/verify-otp/verify-otp';
import { Delete } from './components/crud/delete/delete';
import { Getall } from './components/crud/getall/getall';
import { Update } from './components/crud/update/update';
import { Dashboard } from './components/dashboard/dashboard';
import { ADMIN_ENTITIES } from './models/admin.models';
import { authGuard, guestGuard } from './services/auth.guard';

const crudRoutes: Routes = ADMIN_ENTITIES.flatMap((entity) => [
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
  { path: 'registro', component: Register, canActivate: [guestGuard], title: 'Crear cuenta' },
  { path: 'verificar-2fa', component: VerifyOtp, canActivate: [guestGuard], title: 'Verificar codigo' },
  { path: '', component: Dashboard, canActivate: [authGuard], title: 'Panel general' },
  ...crudRoutes.map((route) => ({ ...route, canActivate: [authGuard] })),
  { path: '**', redirectTo: '' }
];
