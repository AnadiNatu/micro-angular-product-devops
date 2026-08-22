import { Component, NgModule, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Order } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-update-order',
  standalone: true,
  templateUrl: './update-order.component.html',
  styleUrls: ['./update-order.component.css'],
  imports: [CommonModule , FormsModule, ReactiveFormsModule],
})
export class UpdateOrderComponent implements OnInit {
  orderForm!: FormGroup;
  orderData!: Order;
  orderId!: number;
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  statusOptions = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get order ID from route
    const idParam = this.route.snapshot.paramMap.get('orderId');
    this.orderId = idParam ? +idParam : 0;

    if (this.orderId) {
      this.loadOrder();
    } else {
      alert('Invalid order ID');
      this.router.navigate(['/admin/orders']);
    }
  }

  /**
   * Load order data
   */
  private loadOrder(): void {
    this.isLoading = true;

    this.adminService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.orderData = order;
        this.initializeForm(order);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.isLoading = false;
        alert('Failed to load order');
        this.router.navigate(['/admin/orders']);
      }
    });
  }

  /**
   * Initialize form with order data
   * FIX: Order no longer has flat orderQuantity — it's derived from items[]
   */
  private initializeForm(order: Order): void {
    // Calculate total quantity from items
    const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
    // Get first product name from items
    const firstProductName = order.items?.[0]?.productName ?? 'Unknown Product';

    this.orderForm = this.fb.group({
      orderId: [{ value: order.orderId, disabled: true }],
      orderDate: [{ value: this.formatDateForInput(order.orderDate), disabled: true }],
      productName: [{ value: firstProductName, disabled: true }],
      username: [{ value: order.username, disabled: true }],
      userId: [{ value: order.userId, disabled: true }],
      // FIX: totalQuantity is now calculated from items, not a direct property
      totalQuantity: [
        { value: totalQuantity, disabled: true },
        [Validators.required, Validators.min(1)]
      ],
      estimatedDelivery: [this.formatDateForInput(order.estimatedDelivery), Validators.required],
      deliveryDate: [this.formatDateForInput(order.deliveryDate), Validators.required],
      orderStatus: [order.orderStatus, Validators.required]
    });
  }

  /**
   * Format date for input[type="date"]
   */
  private formatDateForInput(date: Date | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Handle form submission
   * FIX: Only status is updatable via backend PUT /orders/{id}/status
   */
  onSubmit(): void {
    if (this.orderForm.invalid) {
      Object.keys(this.orderForm.controls).forEach(key => {
        this.orderForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Only update status (that's what the backend endpoint supports)
    const newStatus = this.orderForm.get('orderStatus')?.value;

    this.adminService.updateOrderStatus(this.orderId, newStatus).subscribe({
      next: () => {
        console.log('Order updated successfully');
        this.isSubmitting = false;
        alert('Order updated successfully!');
        this.router.navigate(['/admin/orders']);
      },
      error: (error) => {
        console.error('Error updating order:', error);
        this.isSubmitting = false;
        alert('Failed to update order. Please try again.');
      }
    });
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string): boolean {
    const field = this.orderForm?.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Get error message
   */
  getErrorMessage(fieldName: string): string {
    const field = this.orderForm?.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    if (field?.hasError('min')) {
      return 'Quantity must be at least 1';
    }
    
    return '';
  }

  /**
   * Get product name from items
   */
  getProductName(): string {
    return this.orderData?.items?.[0]?.productName?.toString() ?? 'Unknown';
  }

  /**
   * Get total quantity from items
   */
  getTotalQuantity(): number {
    return this.orderData?.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/admin/orders']);
  }
}