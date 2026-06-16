import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.gaurd';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/home',
    pathMatch: 'full'
  },
  {
    // canActivate here means: if already logged in, skip auth pages entirely
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [AuthGuard],
    data: { isAuthRoute: true }
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' }
  },
   {
    path: 'user',
    loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES),
    canActivate: [AuthGuard],
    data: { role: 'USER' }
  },
  {
    path: '**',
    redirectTo: 'auth/home'
  }
];
