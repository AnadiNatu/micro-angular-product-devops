import { Component } from '@angular/core';
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
export class UserOrdersComponent {
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
        next: (orders) => { this.orders = orders; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
    } else {
      this.isLoading = false;
    }
  }

  getStatusClass(status: string): string {
    const map: { [k: string]: string } = {
      DELIVERED: 'bg-success', COMPLETED: 'bg-success',
      DISPATCHED: 'bg-info', SHIPPED: 'bg-info',
      ORDERED: 'bg-warning text-dark', PENDING: 'bg-warning text-dark',
      CANCELLED: 'bg-danger'
    };
    return map[status] || 'bg-secondary';
  }
}
