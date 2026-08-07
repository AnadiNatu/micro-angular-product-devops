import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormGroup, FormBuilder, FormArray, Validators,
  FormsModule, ReactiveFormsModule, AbstractControl
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product, CreatedOrderDto, CreateOrderItemDto } from '../../../../core/models/product.model';

// ─────────────────────────────────────────────────────────────────────────────
// create-order.component.ts
//
// Matches the new CreatedOrderDto:
//   userId, items: CreateOrderItemDto[], full shipping fields, notes
//
// The product selector lets the user pick products from the active catalogue
// and set a quantity per item. The component builds the items[] array from
// the FormArray before submitting.
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css'],
  imports: [ CommonModule, FormsModule, ReactiveFormsModule]
})
export class CreateOrderComponent implements OnInit {

  orderForm!:    FormGroup;
  products:      Product[] = [];
  isLoading      = false;
  isSubmitting   = false;
  loadingProducts = true;

  constructor(
    private fb:           FormBuilder,
    private adminService: AdminService,
    private authService:  AuthService,
    private router:       Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadProducts();
  }

  // ── Form builder ────────────────────────────────────────────────────────────
  private buildForm(): void {
    const currentUser = this.authService.getCurrentUser();

    this.orderForm = this.fb.group({
      userId:          [currentUser?.id ?? null, Validators.required],

      // items FormArray — each entry is { productId, quantity }
      items: this.fb.array(
        [this.buildItemGroup()],
        [Validators.required, Validators.minLength(1)]
      ),

      // Shipping
      shippingName:    ['', [Validators.required, Validators.maxLength(100)]],
      shippingPhone:   ['', [Validators.required, Validators.maxLength(20)]],
      shippingEmail:   ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      shippingAddress: ['', [Validators.required, Validators.maxLength(500)]],
      shippingCity:    ['', [Validators.required, Validators.maxLength(100)]],
      shippingState:   ['', [Validators.required, Validators.maxLength(100)]],
      shippingCountry: ['', [Validators.required, Validators.maxLength(100)]],
      postalCode:      ['', [Validators.required, Validators.maxLength(20)]],
      notes:           ['', Validators.maxLength(1000)]
    });
  }

  private buildItemGroup(): FormGroup {
    return this.fb.group({
      productId: [null, Validators.required],
      quantity:  [1,    [Validators.required, Validators.min(1)]]
    });
  }

  // ── FormArray helpers ───────────────────────────────────────────────────────
  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  itemControls(): AbstractControl[] {
    return this.items.controls;
  }

  addItem(): void {
    this.items.push(this.buildItemGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  // ── Helpers for template ────────────────────────────────────────────────────
  hasError(path: string): boolean {
    const c = this.orderForm.get(path);
    return !!(c && c.invalid && c.touched);
  }

  itemHasError(index: number, field: string): boolean {
    const c = this.items.at(index)?.get(field);
    return !!(c && c.invalid && c.touched);
  }

  // Calculate live total from selected products + quantities
  get estimatedTotal(): number {
    let total = 0;
    for (const ctrl of this.items.controls) {
      const pid = ctrl.get('productId')?.value;
      const qty = ctrl.get('quantity')?.value ?? 0;
      const product = this.products.find(p => p.productId === +pid);
      if (product) total += product.price * qty;
    }
    return total;
  }

  getProductName(productId: number | string | null): string {
    if (!productId) return '—';
    const p = this.products.find(p => p.productId === +productId);
    return p ? p.productName : '—';
  }

  getProductPrice(productId: number | string | null): number {
    if (!productId) return 0;
    const p = this.products.find(p => p.productId === +productId);
    return p ? p.price : 0;
  }

  getProductStock(productId: number | string | null): number {
    if (!productId) return 0;
    const p = this.products.find(p => p.productId === +productId);
    return p?.stockQuantity ?? 0;
  }

  // ── Data loading ─────────────────────────────────────────────────────────────
  private loadProducts(): void {
    this.loadingProducts = true;
    this.adminService.getActiveProducts().subscribe({
      next:  ps  => { this.products = ps; this.loadingProducts = false; },
      error: ()  => { this.loadingProducts = false; }
    });
  }

  // ── Submission ──────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const v = this.orderForm.getRawValue();

    const payload: CreatedOrderDto = {
      userId:          v.userId,
      items:           v.items.map((i: any): CreateOrderItemDto => ({
        productId: +i.productId,
        quantity:  +i.quantity
      })),
      shippingName:    v.shippingName,
      shippingPhone:   v.shippingPhone,
      shippingEmail:   v.shippingEmail,
      shippingAddress: v.shippingAddress,
      shippingCity:    v.shippingCity,
      shippingState:   v.shippingState,
      shippingCountry: v.shippingCountry,
      postalCode:      v.postalCode,
      notes:           v.notes || undefined
    };

    this.adminService.createOrder(payload).subscribe({
      next: order => {
        this.isSubmitting = false;
        alert(`Order #${order.orderId} created successfully!`);
        this.router.navigate(['/admin/orders']);
      },
      error: err => {
        this.isSubmitting = false;
        const msg = err?.error?.message || err?.message || 'Failed to create order';
        alert(`Error: ${msg}`);
      }
    });
  }

  cancel(): void { this.router.navigate(['/admin/orders']); }
}