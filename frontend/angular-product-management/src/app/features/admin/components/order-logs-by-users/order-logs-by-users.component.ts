import { Component, NgModule, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { getOrderStatusBadgeClass, Order, OrderLogDTO } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-order-logs-by-users',
  templateUrl: './order-logs-by-users.component.html',
  standalone: true,
  styleUrls: ['./order-logs-by-users.component.css'],
imports: [CommonModule , FormsModule, ReactiveFormsModule , CustomCurrencyPipe],
})
export class OrderLogsByUsersComponent implements OnInit {
 
  // Backend returns OrderLogDTO[], NOT Order[]
  logs: OrderLogDTO[] = [];
  filteredLogs: OrderLogDTO[] = [];

  userIdentifier: string = '';
  isLoading: boolean = true;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  /**
   * Fetch order logs for all users.
   *
   * Backend:
   * GET /api/orders/logs/users
   *
   * Frontend service:
   * Observable<OrderLogDTO[]>
   */
  fetchLogs(): void {
    this.isLoading = true;

    this.adminService.getOrderLogsByUsers().subscribe({
      next: (data: OrderLogDTO[]) => {
        this.logs = data;
        this.filteredLogs = data;
        this.isLoading = false;
      },

      error: (err) => {
        console.error('[OrderLogsByUsers] Failed to fetch logs:', err);
        this.logs = [];
        this.filteredLogs = [];
        this.isLoading = false;
      }
    });
  }

  /**
   * Filter logs by username.
   *
   * OrderLogDTO contains userName, not username/userId.
   */
  filterLogs(): void {
    const term = this.userIdentifier.trim().toLowerCase();

    if (!term) {
      this.filteredLogs = this.logs;
      return;
    }

    this.filteredLogs = this.logs.filter(log =>
      (log.userName ?? '').toLowerCase().includes(term)
    );
  }

  /**
   * Clear username filter.
   */
  clearFilter(): void {
    this.userIdentifier = '';
    this.filteredLogs = this.logs;
  }

  /**
   * Status badge styling.
   */
  getStatusBadgeClass = getOrderStatusBadgeClass;

  /**
   * Navigate back to admin dashboard.
   */
  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}