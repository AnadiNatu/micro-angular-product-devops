import { Component, NgModule } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { CreateProductDTO } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";
import { ProductService } from "../../../../core/services/product.service";

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , CustomCurrencyPipe],
})
export class CreateProductComponent {
  productForm : FormGroup;
  isSubmitting = false;
  errorMsg     = '';
 
  // ─── Image state ──────────────────────────────────────────────────────────
  selectedImageFile: File | null   = null;
  imagePreview     : string | null = null;  // local blob preview
  uploadedImageUrl : string | null = null;  // Supabase URL set after upload
  isUploadingImage = false;
  imageUploadError = '';
 
  // Holds the productId after creation so removeImage() can call the delete endpoint
  private createdProductId: number | null = null;
 
  categories = ['Electronics', 'Accessories', 'Furniture', 'Clothing', 'Books'];
 
  constructor(
    private fb            : FormBuilder,
    private adminService  : AdminService,
    private productService: ProductService,
    private router        : Router
  ) {
    this.productForm = this.fb.group({
      productName     : ['', [Validators.required, Validators.minLength(3)]],
      productDesc     : ['', [Validators.required, Validators.minLength(10)]],
      price           : [0,  [Validators.required, Validators.min(0.01)]],
      productInventory: [0,  [Validators.required, Validators.min(0)]],
      category        : ['Electronics', Validators.required],
    });
  }
 
  // ─── Image Selection ──────────────────────────────────────────────────────
 
  onImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
 
    // Client-side guard: 5 MB, images only
    if (file.size > 5 * 1024 * 1024) {
      this.imageUploadError = 'File exceeds 5 MB. Please choose a smaller image.';
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.imageUploadError = 'Only image files are allowed (JPG, PNG, GIF, WebP).';
      return;
    }
 
    this.imageUploadError  = '';
    this.selectedImageFile = file;
 
    // Show local preview immediately — no network call yet
    const reader = new FileReader();
    reader.onload = e => { this.imagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }
 
  /**
   * Remove image.
   * - If already uploaded to Supabase → DELETE /api/products/{id}/images/delete
   * - If only a local preview          → just clear state
   */
  removeImage(): void {
    if (this.uploadedImageUrl && this.createdProductId !== null) {
      this.isUploadingImage = true;
      this.productService
        .deleteProductImage(this.createdProductId, this.uploadedImageUrl)
        .subscribe({
          next : () => { this.resetImageState(); this.isUploadingImage = false; },
          error: () => { this.resetImageState(); this.isUploadingImage = false; },
        });
    } else {
      this.resetImageState();
    }
  }
 
  private resetImageState(): void {
    this.selectedImageFile = null;
    this.imagePreview      = null;
    this.uploadedImageUrl  = null;
    this.imageUploadError  = '';
  }
 
  // ─── Form Submit ──────────────────────────────────────────────────────────
 
  onSubmit(): void {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(k =>
        this.productForm.get(k)?.markAsTouched()
      );
      return;
    }
 
    this.isSubmitting = true;
    this.errorMsg     = '';
 
    const dto: CreateProductDTO = {
      productName     : this.productForm.value.productName,
      productDesc     : this.productForm.value.productDesc,
      price           : this.productForm.value.price,
      productInventory: this.productForm.value.productInventory,
    };
 
    // Step 1 — create product record
    this.adminService.createProduct(dto).subscribe({
      next: product => {
        this.createdProductId = product.productId;
 
        // Step 2 — upload image to Supabase if one was selected
        if (this.selectedImageFile) {
          this.isUploadingImage = true;
 
          // POST /api/products/{productId}/images/upload
          this.productService
            .uploadProductImage(product.productId, this.selectedImageFile)
            .subscribe({
              next: res => {
                // res: { message: string; imageUrl: string }
                this.uploadedImageUrl = res.imageUrl;
                this.isUploadingImage = false;
                this.finishCreate();
              },
              error: () => {
                // Product saved — image upload failed. Warn then navigate.
                this.isUploadingImage = false;
                this.errorMsg =
                  'Product created but image upload failed. ' +
                  'You can upload it from the product list.';
                setTimeout(() => this.finishCreate(), 2500);
              },
            });
        } else {
          this.finishCreate();
        }
      },
      error: err => {
        this.isSubmitting = false;
        this.errorMsg = err?.error?.message ?? err?.message ?? 'Failed to create product.';
      },
    });
  }
 
  private finishCreate(): void {
    this.isSubmitting = false;
    this.showToast('Product created successfully!');
    this.router.navigate(['/admin/products']);
  }
 
  // ─── Helpers ──────────────────────────────────────────────────────────────
 
  hasError(fieldName: string): boolean {
    const f = this.productForm.get(fieldName);
    return !!(f && f.invalid && f.touched);
  }
 
  getErrorMessage(fieldName: string): string {
    const f = this.productForm.get(fieldName);
    if (f?.hasError('required'))  return `${this.label(fieldName)} is required`;
    if (f?.hasError('minlength')) return `${this.label(fieldName)} must be at least ${f.errors?.['minlength'].requiredLength} characters`;
    if (f?.hasError('min'))       return `${this.label(fieldName)} must be at least ${f.errors?.['min'].min}`;
    return '';
  }
 
  private label(f: string): string {
    const m: Record<string, string> = {
      productName     : 'Product name',
      productDesc     : 'Description',
      price           : 'Price',
      productInventory: 'Inventory',
      category        : 'Category',
    };
    return m[f] ?? f;
  }
 
  cancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.router.navigate(['/admin/products']);
    }
  }
 
  private showToast(msg: string): void {
    const el = document.createElement('div');
    el.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    el.style.zIndex = '9999';
    el.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${msg}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}