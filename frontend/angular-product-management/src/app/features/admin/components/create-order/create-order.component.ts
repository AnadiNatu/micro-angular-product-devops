import { Component, NgModule, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Product, CreateOrderDTO } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , CustomCurrencyPipe],
})
export class CreateOrderComponent implements OnInit {
  orderForm: FormGroup;
  isSubmitting: boolean = false;
  products: Product[] = [];
  selectedProduct: Product | null = null;

  // Order status options
  statusOptions = ['ORDERED', 'DISPATCHED', 'DELIVERED', 'PENDING', 'SHIPPED'];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      productName: ['', Validators.required],
      orderQuantity: [1, [Validators.required, Validators.min(1)]],
      estimateDeliveryDate: ['', Validators.required],
      deliveryDate: ['', Validators.required],
      orderStatus: ['ORDERED', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.setDefaultDates();
  }

  /**
   * Load available products
   */
  loadProducts(): void {
    this.adminService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        console.log('Products loaded:', products.length);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  /**
   * Set default delivery dates
   */
  setDefaultDates(): void {
    const today = new Date();
    const estimatedDelivery = new Date(today);
    estimatedDelivery.setDate(today.getDate() + 7); // 7 days from now

    const actualDelivery = new Date(today);
    actualDelivery.setDate(today.getDate() + 10); // 10 days from now

    this.orderForm.patchValue({
      estimateDeliveryDate: this.formatDate(estimatedDelivery),
      deliveryDate: this.formatDate(actualDelivery)
    });
  }

  /**
   * Format date for input[type="date"]
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Handle product selection
   */
  onProductSelect(): void {
    const productName = this.orderForm.get('productName')?.value;
    this.selectedProduct = this.products.find(p => p.productName === productName) || null;
    
    if (this.selectedProduct) {
      console.log('Selected product:', this.selectedProduct);
      
      // Auto-set quantity limit based on inventory
      const quantityControl = this.orderForm.get('orderQuantity');
      quantityControl?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(this.selectedProduct.productInventory)
      ]);
      quantityControl?.updateValueAndValidity();
    }
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

    // Check inventory
    if (this.selectedProduct && 
        this.orderForm.value.orderQuantity > this.selectedProduct.productInventory) {
      alert(`Insufficient inventory! Only ${this.selectedProduct.productInventory} units available.`);
      return;
    }

    this.isSubmitting = true;

    const orderData: CreateOrderDTO = {
      productName: this.orderForm.value.productName,
      orderQuantity: this.orderForm.value.orderQuantity,
      estimateDeliveryDate: new Date(this.orderForm.value.estimateDeliveryDate),
      deliveryDate: new Date(this.orderForm.value.deliveryDate),
      orderStatus: this.orderForm.value.orderStatus
    };

    this.adminService.createOrder(orderData).subscribe({
      next: (order) => {
        console.log('Order created:', order);
        this.isSubmitting = false;
        alert('Order created successfully!');
        this.router.navigate(['/admin/orders']);
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.isSubmitting = false;
        alert('Failed to create order. Please try again.');
      }
    });
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Get error message
   */
  getErrorMessage(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('min')) {
      const min = field.errors?.['min'].min;
      return `${this.getFieldLabel(fieldName)} must be at least ${min}`;
    }
    if (field?.hasError('max')) {
      const max = field.errors?.['max'].max;
      return `Only ${max} units available in stock`;
    }
    
    return '';
  }

  /**
   * Get field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      productName: 'Product',
      orderQuantity: 'Quantity',
      estimateDeliveryDate: 'Estimated delivery date',
      deliveryDate: 'Delivery date',
      orderStatus: 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.router.navigate(['/admin/orders']);
    }
  }
}