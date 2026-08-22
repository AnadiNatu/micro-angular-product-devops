import { Component, NgModule } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { getOrderStatusBadgeClass, Order, OrderLogDTO } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-order-logs-by-product',
  standalone: true,
  templateUrl: './order-logs-by-product.component.html',
  styleUrls: ['./order-logs-by-product.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , CurrencyPipe , CustomCurrencyPipe],
})
export class OrderLogsByProductComponent {
  productName: string = '';
  // logs: OrderLogDTO[] = [];
  logs      : OrderLogDTO[] = [];
  filteredLogs: OrderLogDTO[] = [];
  isLoading: boolean = false;
  hasSearched: boolean = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  /**
   * Fetch logs for product
   */
  // fetchLogs(): void {
  //   const trimmed = this.productName.trim();
    
  //   if (!trimmed) {
  //     alert('Please enter a product name');
  //     return;
  //   }

  //   this.isLoading = true;
  //   this.hasSearched = true;

  //   this.adminService.getOrderLogsByProduct(trimmed).subscribe({
  //     next: (data) => {
  //       this.logs = data;
  //       this.isLoading = false;
  //       console.log('Logs fetched:', data.length);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching logs:', error);
  //       this.isLoading = false;
  //       this.logs = [];
  //     }
  //   });
  // }

   fetchLogs(): void {

    const trimmed = this.productName.trim();

    if (!trimmed) {
      this.logs = [];
      this.filteredLogs = [];
      this.hasSearched = false;

      alert('Please enter a product name');

      return;
    }

    this.isLoading = true;
    this.hasSearched = true;

    this.adminService.getOrderLogsByProduct(trimmed).subscribe({

      next: (data: OrderLogDTO[]) => {

        console.log(
          '[OrderLogsByProduct] Logs fetched:',
          data
        );

        this.logs = data;
        this.filteredLogs = data;

        this.isLoading = false;
      },

      error: (error) => {

        console.error(
          '[OrderLogsByProduct] Error fetching logs:',
          error
        );

        this.logs = [];
        this.filteredLogs = [];

        this.isLoading = false;
      }

    });
  }


  /**
   * Clear search
   */
 clearSearch(): void {

    this.productName = '';

    this.logs = [];
    this.filteredLogs = [];

    this.hasSearched = false;
  }

  // getTotalQty(order: Order): number {
  //   return (order.items ?? []).reduce((s, i) => s + (i.quantity ?? 0), 0);
  // }

  //   getFirstProductName(order: Order): string {
  //   return order.items?.[0]?.productName ?? `Order #${order.orderId}`;
  // }

   getStatusBadgeClass = getOrderStatusBadgeClass;

  /**
   * Get status badge class
   */
  // getStatusBadgeClass(status: string): string {
  //   const statusMap: { [key: string]: string } = {
  //     'DELIVERED': 'bg-success',
  //     'COMPLETED': 'bg-success',
  //     'DISPATCHED': 'bg-info',
  //     'SHIPPED': 'bg-info',
  //     'ORDERED': 'bg-warning text-dark',
  //     'PENDING': 'bg-warning text-dark',
  //     'CANCELLED': 'bg-danger'
  //   };
    
  //   return statusMap[status] || 'bg-secondary';
  // }

  /**
   * Navigate back
   */
  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}