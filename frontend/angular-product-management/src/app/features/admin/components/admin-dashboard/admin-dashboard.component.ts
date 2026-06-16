import { Component, NgModule, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Product, Order } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { HeaderComponent } from "../../../../shared/components/header/header.component";
import { SidebarComponent } from "../../../../shared/components/sidebar/sidebar.component";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , HeaderComponent , SidebarComponent , CustomCurrencyPipe],
})
export class AdminDashboardComponent implements OnInit {
  // Dashboard stats
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0
  };

  products: Product[] = [];
  recentOrders: Order[] = [];
  isLoading: boolean = true;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Load all dashboard data
   */
  public loadDashboardData(): void {
    this.isLoading = true;

    // Load stats
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        console.log('Dashboard stats loaded:', stats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });

    // Load products
    this.adminService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });

    // Load recent orders
    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        this.recentOrders = orders.slice(0, 5); // Get last 5 orders
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  /**
   * Sort products by price (ascending)
   */
  filterByAsc(): void {
    this.adminService.getProductsByAscOrder().subscribe({
      next: (products) => {
        this.products = products;
      }
    });
  }

  /**
   * Sort products by price (descending)
   */
  filterByDesc(): void {
    this.adminService.getProductsByDescOrder().subscribe({
      next: (products) => {
        this.products = products;
      }
    });
  }

  /**
   * Get top ordered products
   */
  filterTopOrdered(): void {
    this.adminService.getTopOrderedProducts().subscribe({
      next: (products) => {
        this.products = products;
      }
    });
  }

  /**
   * Navigate to product details
   */
  viewProduct(productName: string): void {
    this.router.navigate(['/admin/update-product', productName]);
  }

  /**
   * Navigate to order details
   */
  viewOrder(orderId: number): void {
    this.router.navigate(['/admin/update-order', orderId]);
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-success';
      case 'DISPATCHED':
      case 'SHIPPED':
        return 'bg-info';
      case 'ORDERED':
      case 'PENDING':
        return 'bg-warning';
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  /**
   * Get stock level indicator
   */
  getStockLevel(inventory: number): { label: string; class: string } {
    if (inventory === 0) {
      return { label: 'Out of Stock', class: 'text-danger' };
    } else if (inventory < 50) {
      return { label: 'Low Stock', class: 'text-warning' };
    } else {
      return { label: 'In Stock', class: 'text-success' };
    }
  }
}