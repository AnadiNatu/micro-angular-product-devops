import { Component, NgModule } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { CreateProductDTO } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , CustomCurrencyPipe],
})
export class CreateProductComponent {
  productForm: FormGroup;
  isSubmitting: boolean = false;
  imagePreview: string | null = null;

  categories = ['Electronics', 'Accessories', 'Furniture', 'Clothing', 'Books'];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(3)]],
      productDesc: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      productInventory: [0, [Validators.required, Validators.min(0)]],
      category: ['Electronics', Validators.required]
    });
  }

  /*Handle form submission*/
  onSubmit(): void {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const productData: CreateProductDTO = {
      productName: this.productForm.value.productName,
      productDesc: this.productForm.value.productDesc,
      price: this.productForm.value.price,
      productInventory: this.productForm.value.productInventory
    };

    this.adminService.createProduct(productData).subscribe({
      next: (product) => {
        console.log('Product created:', product);
        this.isSubmitting = false;
        alert('Product created successfully!');
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.isSubmitting = false;
        alert('Failed to create product. Please try again.');
      }
    });
  }

  /*Handle image upload (mock)*/
  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /*Remove image preview*/
  removeImage(): void {
    this.imagePreview = null;
  }

  /*Check if field has error*/
  hasError(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /*Get error message*/
  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }
    if (field?.hasError('min')) {
      const min = field.errors?.['min'].min;
      return `${this.getFieldLabel(fieldName)} must be at least ${min}`;
    }
    
    return '';
  }

  /**
   * Get field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      productName: 'Product name',
      productDesc: 'Description',
      price: 'Price',
      productInventory: 'Inventory',
      category: 'Category'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.router.navigate(['/admin/products']);
    }
  }
}