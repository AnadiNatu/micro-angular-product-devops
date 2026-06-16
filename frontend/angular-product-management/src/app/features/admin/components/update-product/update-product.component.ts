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
  productName: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get product name from route
    this.productName = this.route.snapshot.paramMap.get('name') || '';
    
    if (this.productName) {
      this.loadProduct();
    } else {
      alert('Invalid product');
      this.router.navigate(['/admin/products']);
    }
  }

  /**
   * Load product data
   */
  private loadProduct(): void {
    this.isLoading = true;

    this.adminService.getAllProducts().subscribe({
      next: (products) => {
        const product = products.find(p => p.productName === this.productName);
        
        if (product) {
          this.productData = product;
          this.initializeForm(product);
          this.isLoading = false;
        } else {
          alert('Product not found');
          this.router.navigate(['/admin/products']);
        }
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
      productDesc: [product.productDesc, [Validators.required, Validators.minLength(10)]],
      price: [product.price, [Validators.required, Validators.min(0.01)]],
      productInventory: [product.productInventory, [Validators.required, Validators.min(0)]]
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const updatedProduct: UpdateProductDTO = {
      productName: this.productData.productName,
      productDesc: this.productForm.get('productDesc')?.value,
      price: this.productForm.get('price')?.value,
      productInventory: this.productForm.get('productInventory')?.value
    };

    this.adminService.updateProduct(updatedProduct).subscribe({
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