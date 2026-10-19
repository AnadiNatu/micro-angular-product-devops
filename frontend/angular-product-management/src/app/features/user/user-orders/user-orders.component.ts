import { Component, OnInit } from '@angular/core';
import { Order } from '../../../core/models/product.model';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../admin/services/admin.service';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-user-orders',
  imports: [CommonModule , DatePipe , CurrencyPipe,

    NzCardModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzSpinModule,
    NzTagModule

  ],
  standalone: true,
  templateUrl: './user-orders.component.html',
  styleUrl: './user-orders.component.css'
})
export class UserOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (userId) {
      this.adminService.getOrdersByUserId(userId).subscribe({
        next: (orders) => { 
          this.orders = orders; 
          this.isLoading = false; 
        },
        error: (err) => { 
          console.error('Failed to load orders:', err);
          this.isLoading = false; 
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  /**
   * Get first product name from order items
   */
  getOrderProductName(order: Order): string {
    if (!order.items || order.items.length === 0) {
      return `Order #${order.orderId}`;
    }
    return order.items[0].productName?.toString() || `Order #${order.orderId}`;
  }

  /**
   * Get total quantity from order items
   */
  getOrderQuantity(order: Order): number {
    if (!order.items) return 0;
    return order.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  }

  /**
   * Get status badge class
   */
  getStatusColor(status: string): string {
    const map: { [k: string]: string } = {
      
      DELIVERED: 'success',
      COMPLETED: 'success',

      DISPATCHED: 'processing',
      SHIPPED: 'processing',

      ORDERED: 'warning',
      PENDING: 'warning',

      CONFIRMED: 'blue',

      PROCESSING: 'processing',

      CANCELLED: 'error'
    };
    return map[status] || 'default';
  }

   getStatusIcon(status: string): string {

    const map: { [key: string]: string } = {

      DELIVERED: 'check-circle',
      COMPLETED: 'check-circle',

      DISPATCHED: 'car',
      SHIPPED: 'car',

      ORDERED: 'clock-circle',
      PENDING: 'clock-circle',

      CONFIRMED: 'check',

      PROCESSING: 'sync',

      CANCELLED: 'close-circle'
    };

    return map[status] || 'info-circle';
  }
}