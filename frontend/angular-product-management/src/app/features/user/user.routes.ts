import { Routes } from '@angular/router';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { UserOrdersComponent } from './user-orders/user-orders.component';
import { UserProductComponent } from './user-product/user-product.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: UserProductComponent },
      { path: 'orders', component: UserOrdersComponent },
      {
        path: 'profile',
        loadComponent: () => import('../../shared/components/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  }
];