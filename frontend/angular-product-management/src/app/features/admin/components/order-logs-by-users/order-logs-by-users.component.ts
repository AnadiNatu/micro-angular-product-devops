import { Component, NgModule, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { OrderLogDTO } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-order-logs-by-users',
  templateUrl: './order-logs-by-users.component.html',
  styleUrls: ['./order-logs-by-users.component.css'],
imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , CustomCurrencyPipe],
})
export class OrderLogsByUsersComponent implements OnInit {
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
   * Fetch all order logs
   */
  fetchLogs(): void {
    this.isLoading = true;

    this.adminService.getOrderLogsByUsers().subscribe({
      next: (data) => {
        this.logs = data;
        this.filteredLogs = data;
        this.isLoading = false;
        console.log('User logs fetched:', data.length);
      },
      error: (error) => {
        console.error('Error fetching logs:', error);
        this.isLoading = false;
        this.logs = [];
        this.filteredLogs = [];
      }
    });
  }

  /**
   * Filter logs by user
   */
  filterLogs(): void {
    const identifier = this.userIdentifier.trim().toLowerCase();
    
    if (!identifier) {
      this.filteredLogs = this.logs;
      return;
    }

    this.filteredLogs = this.logs.filter(log => 
      log.userName.toLowerCase().includes(identifier)
    );

    console.log('Filtered logs:', this.filteredLogs.length);
  }

  /**
   * Clear filter
   */
  clearFilter(): void {
    this.userIdentifier = '';
    this.filteredLogs = this.logs;
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
   * Navigate back
   */
  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}