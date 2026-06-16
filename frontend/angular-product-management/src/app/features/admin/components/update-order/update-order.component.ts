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
  templateUrl: './update-order.component.html',
  styleUrls: ['./update-order.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , CustomCurrencyPipe],
})
export class UpdateOrderComponent implements OnInit {
  orderForm!: FormGroup;
  orderData!: Order;
  orderId!: number;
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  statusOptions = ['ORDERED', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'PENDING', 'SHIPPED'];

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

    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        const order = orders.find(o => o.orderId === this.orderId);
        
        if (order) {
          this.orderData = order;
          this.initializeForm(order);
          this.isLoading = false;
        } else {
          alert('Order not found');
          this.router.navigate(['/admin/orders']);
        }
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
   */
  private initializeForm(order: Order): void {
    this.orderForm = this.fb.group({
      orderId: [{ value: order.orderId, disabled: true }],
      orderDate: [{ value: this.formatDateForInput(order.orderDate), disabled: true }],
      productName: [{ value: order.productName, disabled: true }],
      userName: [{ value: order.userName, disabled: true }],
      userId: [{ value: order.userId, disabled: true }],
      orderQuantity: [order.orderQuantity, [Validators.required, Validators.min(1)]],
      estimateDeliveryDate: [this.formatDateForInput(order.estimateDeliveryDate), Validators.required],
      deliveryDate: [this.formatDateForInput(order.deliveryDate), Validators.required],
      orderStatus: [order.orderStatus, Validators.required]
    });
  }

  /**
   * Format date for input[type="date"]
   */
  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.orderForm.invalid) {
      Object.keys(this.orderForm.controls).forEach(key => {
        this.orderForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const updatedOrder: Order = {
      ...this.orderData,
      orderQuantity: this.orderForm.get('orderQuantity')?.value,
      estimateDeliveryDate: new Date(this.orderForm.get('estimateDeliveryDate')?.value),
      deliveryDate: new Date(this.orderForm.get('deliveryDate')?.value),
      orderStatus: this.orderForm.get('orderStatus')?.value as any
    };

    this.adminService.updateOrder(updatedOrder).subscribe({
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
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/admin/orders']);
  }
}