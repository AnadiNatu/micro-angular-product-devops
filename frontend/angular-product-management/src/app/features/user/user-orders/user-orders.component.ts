import { Component, OnInit } from '@angular/core';
import { Order } from '../../../core/models/product.model';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../admin/services/admin.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-orders',
  imports: [CommonModule , DatePipe],
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
  getStatusClass(status: string): string {
    const map: { [k: string]: string } = {
      DELIVERED: 'bg-success', 
      COMPLETED: 'bg-success',
      DISPATCHED: 'bg-info', 
      SHIPPED: 'bg-info',
      ORDERED: 'bg-warning text-dark', 
      PENDING: 'bg-warning text-dark',
      CONFIRMED: 'bg-info',
      PROCESSING: 'bg-primary',
      CANCELLED: 'bg-danger'
    };
    return map[status] || 'bg-secondary';
  }
}