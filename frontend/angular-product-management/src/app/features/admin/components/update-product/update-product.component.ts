import { Component, NgModule, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Product, UpdateProductDTO } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , CustomCurrencyPipe],
})
export class UpdateProductComponent implements OnInit {
  productForm!: FormGroup;
  productData!: Product;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  productId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get product ID from route (not name)
    const idParam = this.route.snapshot.paramMap.get('id');
    this.productId = idParam ? +idParam : 0;
    
    if (this.productId) {
      this.loadProduct();
    } else {
      alert('Invalid product');
      this.router.navigate(['/admin/products']);
    }
  }

  /**
   * Load product data by ID
   */
  private loadProduct(): void {
    this.isLoading = true;

    this.adminService.getProduct(this.productId).subscribe({
      next: (product) => {
        this.productData = product;
        this.initializeForm(product);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.isLoading = false;
        alert('Failed to load product');
        this.router.navigate(['/admin/products']);
      }
    });
  }

  /**
   * Initialize form with product data
   */
  private initializeForm(product: Product): void {
    this.productForm = this.fb.group({
      productId: [{ value: product.productId, disabled: true }],
      productName: [{ value: product.productName, disabled: true }],
      description: [product.description || product.description, [Validators.required, Validators.minLength(10)]],
      price: [product.price, [Validators.required, Validators.min(0.01)]],
      stockQuantity: [product.stockQuantity || 0, [Validators.required, Validators.min(0)]]
    });
  }

  /**
   * Handle form submission
   * FIX: Signature is updateProduct(productId: number, product: Partial<UpdateProductDTO>)
   */
  onSubmit(): void {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const updatedProduct: Partial<UpdateProductDTO> = {
      description: this.productForm.get('description')?.value,
      price: this.productForm.get('price')?.value,
      stockQuantity: this.productForm.get('stockQuantity')?.value
    };

    // FIX: Pass productId as first argument
    this.adminService.updateProduct(this.productId, updatedProduct).subscribe({
      next: () => {
        console.log('Product updated successfully');
        this.isSubmitting = false;
        alert('Product updated successfully!');
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.isSubmitting = false;
        alert('Failed to update product. Please try again.');
      }
    });
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string): boolean {
    const field = this.productForm?.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Get error message
   */
  getErrorMessage(fieldName: string): string {
    const field = this.productForm?.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Must be at least ${minLength} characters`;
    }
    if (field?.hasError('min')) {
      const min = field.errors?.['min'].min;
      return `Must be at least ${min}`;
    }
    
    return '';
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    this.router.navigate(['/admin/products']);
  }
}