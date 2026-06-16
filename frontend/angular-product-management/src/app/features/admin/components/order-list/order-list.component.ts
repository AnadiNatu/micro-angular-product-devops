import { Component, NgModule, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Order } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , CustomCurrencyPipe],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  
  // Filter inputs
  productNameFilter: string = '';
  userIdFilter: number | null = null;
  statusFilter: string = 'all';
  
  isLoading: boolean = true;

  // Status options
  statusOptions = ['all', 'ORDERED', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'PENDING', 'SHIPPED'];

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  /**
   * Load all orders
   */
  loadOrders(): void {
    this.isLoading = true;
    
    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = orders;
        this.isLoading = false;
        console.log('Orders loaded:', orders.length);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      // Product name filter
      const matchesProduct = !this.productNameFilter || 
        order.productName.toLowerCase().includes(this.productNameFilter.toLowerCase());
      
      // User ID filter
      const matchesUser = !this.userIdFilter || 
        order.userId === this.userIdFilter;
      
      // Status filter
      const matchesStatus = this.statusFilter === 'all' || 
        order.orderStatus === this.statusFilter;
      
      return matchesProduct && matchesUser && matchesStatus;
    });

    console.log('Filtered orders:', this.filteredOrders.length);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.productNameFilter = '';
    this.userIdFilter = null;
    this.statusFilter = 'all';
    this.filteredOrders = this.orders;
  }

  /**
   * Navigate to update order
   */
  updateOrder(orderId: number): void {
    this.router.navigate(['/admin/update-order', orderId]);
  }

  /**
   * Delete order with confirmation
   */
  deleteOrder(order: Order): void {
    const confirmMessage = `Are you sure you want to delete order #${order.orderId}?\n\nProduct: ${order.productName}\nCustomer: ${order.userName}`;
    
    if (confirm(confirmMessage)) {
      this.adminService.deleteOrder(order.userId, order.productName).subscribe({
        next: () => {
          console.log('Order deleted:', order.orderId);
          this.loadOrders();
          this.showSuccessMessage('Order deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          alert('Failed to delete order. Please try again.');
        }
      });
    }
  }

  /**
   * Navigate to create order
   */
  createNewOrder(): void {
    this.router.navigate(['/admin/create-order']);
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'DELIVERED': 'bg-success',
      'COMPLETED': 'bg-success',
      'DISPATCHED': 'bg-info',
      'SHIPPED': 'bg-info',
      'ORDERED': 'bg-warning text-dark',
      'PENDING': 'bg-warning text-dark',
      'CANCELLED': 'bg-danger'
    };
    
    return statusMap[status] || 'bg-secondary';
  }

  /**
   * Show success message
   */
  private showSuccessMessage(message: string): void {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${message}`;
    document.body.appendChild(alertDiv);

    setTimeout(() => alertDiv.remove(), 3000);
  }

  /**
   * Navigate back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}