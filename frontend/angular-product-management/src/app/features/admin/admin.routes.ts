import { Routes } from "@angular/router";
import { AdminLayoutComponent } from "./admin-layout/admn-layout.component";
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component";
import { CreateOrderComponent } from "./components/create-order/create-order.component";
import { CreateProductComponent } from "./components/create-product/create-product.component";
import { HealthMonitorComponent } from "./components/health-monitor/health-monitor.component";
import { OrderListComponent } from "./components/order-list/order-list.component";
import { OrderLogsByProductComponent } from "./components/order-logs-by-product/order-logs-by-product.component";
import { OrderLogsByUsersComponent } from "./components/order-logs-by-users/order-logs-by-users.component";
import { ProductListComponent } from "./components/product-list/product-list.component";
import { UpdateOrderComponent } from "./components/update-order/update-order.component";
import { UpdateProductComponent } from "./components/update-product/update-product.component";
import { UserListComponent } from "./components/user-list/user-list.component";



export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'create-product', component: CreateProductComponent },
      { path: 'update-product/:name', component: UpdateProductComponent },
      { path: 'orders', component: OrderListComponent },
      { path: 'create-order', component: CreateOrderComponent },
      { path: 'update-order/:orderId', component: UpdateOrderComponent },
      { path: 'users', component: UserListComponent },
      { path: 'logs/product', component: OrderLogsByProductComponent },
      { path: 'logs/users', component: OrderLogsByUsersComponent },
      { path: 'health', component: HealthMonitorComponent }
    ]
  }
];