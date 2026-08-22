import { Component, NgModule, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { getOrderStatusBadgeClass, Order } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-order-list',
  standalone: true,
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
  imports: [CommonModule , FormsModule, ReactiveFormsModule ],
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
  // loadOrders(): void {
  //   this.isLoading = true;
    
  //   this.adminService.getAllOrders().subscribe({
  //     next: (orders) => {
  //       this.orders = orders;
  //       this.filteredOrders = orders;
  //       this.isLoading = false;
  //       console.log('Orders loaded:', orders.length);
  //     },
  //     error: (error) => {
  //       console.error('Error loading orders:', error);
  //       this.isLoading = false;
  //     }
  //   });
  // }
  loadOrders(): void {
    this.isLoading = true;
    this.adminService.getAllOrders().subscribe({
      next: orders => {
        this.orders         = orders.sort((a, b) =>
          new Date(b.orderDate ?? 0).getTime() - new Date(a.orderDate ?? 0).getTime()
        );
        this.filteredOrders = this.orders;
        this.isLoading      = false;
      },
      error: err => { console.error('[OrderList]', err); this.isLoading = false; },
    });
  }

  /**
   * Get first product name from order items (for display)
   */
  // getOrderProductName(order: Order): string {
  //   if (!order.items || order.items.length === 0) {
  //     return `Order #${order.orderId}`;
  //   }
  //   return order.items[0].productName?.toString() || `Order #${order.orderId}`;
  // }
  getOrderProductName(order: Order): string {
    if (!order.items?.length) return `Order #${order.orderId}`;
    const first = order.items[0].productName;
    return order.items.length > 1
      ? `${first} + ${order.items.length - 1} more`
      : first;
  }

  /**
   * Get total quantity from order items
   */
   getOrderTotalQuantity(order: Order): number {
    return (order.items ?? []).reduce((s, i) => s + (i.quantity ?? 0), 0);
  }

  /**
   * Apply filters
   */
  // applyFilters(): void {
  //   this.filteredOrders = this.orders.filter(order => {
  //     // Product name filter — check if ANY item matches
  //     const matchesProduct = !this.productNameFilter || 
  //       (order.items?.some(item => 
  //         String(item.productName).toLowerCase()
  //           .includes(this.productNameFilter.toLowerCase())
  //       ) ?? false);
      
  //     // User ID filter
  //     const matchesUser = !this.userIdFilter || 
  //       order.userId === this.userIdFilter;
      
  //     // Status filter
  //     const matchesStatus = this.statusFilter === 'all' || 
  //       order.orderStatus === this.statusFilter;
      
  //     return matchesProduct && matchesUser && matchesStatus;
  //   });

  //   console.log('Filtered orders:', this.filteredOrders.length);
  // }
  applyFilters(): void {
    this.filteredOrders = this.orders.filter(o => {
      const matchProduct = !this.productNameFilter ||
        o.items?.some(i =>
          i.productName.toLowerCase().includes(this.productNameFilter.toLowerCase())
        );
      const matchUser   = !this.userIdFilter || o.userId === this.userIdFilter;
      const matchStatus = this.statusFilter === 'all' || o.orderStatus === this.statusFilter;
      return matchProduct && matchUser && matchStatus;
    });
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
   * FIX: Now passes orderId (not userId + productName)
   */
  // deleteOrder(order: Order): void {
  //   const productNames = order.items?.map(i => i.productName).join(', ') || 'Unknown';
  //   const confirmMessage = `Are you sure you want to delete order #${order.orderId}?\n\nProduct: ${productNames}\nCustomer: ${order.username}`;
    
  //   if (confirm(confirmMessage)) {
  //     // FIX: Pass orderId directly
  //     this.adminService.deleteOrder(order.orderId).subscribe({
  //       next: () => {
  //         console.log('Order deleted:', order.orderId);
  //         this.loadOrders();
  //         this.showSuccessMessage('Order deleted successfully');
  //       },
  //       error: (error) => {
  //         console.error('Error deleting order:', error);
  //         alert('Failed to delete order. Please try again.');
  //       }
  //     });
  //   }
  // }
   deleteOrder(order: Order): void {
    if (!confirm(`Cancel order #${order.orderId}?\nThis cannot be undone.`)) return;
    this.adminService.cancelOrder(order.orderId).subscribe({
      next: () => { this.showToast('Order cancelled'); this.loadOrders(); },
      error: err => alert('Failed: ' + (err?.error?.message ?? err?.message)),
    });
  }

  /**
   * Navigate to create order
   */
  // createNewOrder(): void {
  //   this.router.navigate(['/admin/create-order']);
  // }

  createNewOrder(): void { this.router.navigate(['/admin/create-order']); }
  goBack()        : void { this.router.navigate(['/admin/dashboard']); }


  /**
   * Get status badge class
   */
      getStatusBadgeClass = getOrderStatusBadgeClass;

  /**
   * Show success message
   */
  // private showSuccessMessage(message: string): void {
  //   const alertDiv = document.createElement('div');
  //   alertDiv.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
  //   alertDiv.style.zIndex = '9999';
  //   alertDiv.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${message}`;
  //   document.body.appendChild(alertDiv);

  //   setTimeout(() => alertDiv.remove(), 3000);
  // }
   private showToast(msg: string): void {
    const el = document.createElement('div');
    el.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    el.style.zIndex = '9999';
    el.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${msg}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}