import { Component, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Product } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { ProductService } from "../../../../core/services/product.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, HighlightDirective, CustomCurrencyPipe],
})
export class ProductListComponent implements OnInit {
  products        : Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm       = '';
  selectedCategory = 'all';
  isLoading        = true;

  categories = ['all', 'Electronics', 'Accessories', 'Furniture', 'Clothing'];

  // ─── Per-row image state (keyed by productId) ─────────────────────────────
  imageLoadingMap: Record<number, boolean> = {};
  imageErrorMap  : Record<number, string>  = {};

  constructor(
    private adminService  : AdminService,
    private productService: ProductService,
    private router        : Router
  ) {}

  ngOnInit(): void { this.loadProducts(); }

  // ─── Product loading ──────────────────────────────────────────────────────

  loadProducts(): void {
    this.isLoading = true;
    this.adminService.getAllProducts().subscribe({
      next: products => {
        this.products         = products;
        this.filteredProducts = products;
        this.isLoading        = false;
      },
      error: err => {
        console.error('[ProductList] load error', err);
        this.isLoading = false;
      },
    });
  }

  // ─── Filtering ────────────────────────────────────────────────────────────

  searchProducts(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = this.products.filter(p => {
      const matchSearch =
        p.productName.toLowerCase().includes(term) ||
        p.productDesc.toLowerCase().includes(term);
      const matchCat =
        this.selectedCategory === 'all' || p.category === this.selectedCategory;
      return matchSearch && matchCat;
    });
  }

  filterByCategory(): void { this.searchProducts(); }

  clearFilters(): void {
    this.searchTerm       = '';
    this.selectedCategory = 'all';
    this.filteredProducts = this.products;
  }

  // ─── Product actions ──────────────────────────────────────────────────────

  updateProduct(productName: string): void {
    this.router.navigate(['/admin/update-product', productName]);
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Delete "${product.productName}"?\nThis cannot be undone.`)) return;
    this.adminService.deactivateProduct(product.productId).subscribe({
      next: () => { this.loadProducts(); this.showToast('Product deactivated successfully'); },
      error: err => alert('Failed: ' + (err?.error?.message ?? err.message)),
    });
  }

  createNewProduct(): void { this.router.navigate(['/admin/create-product']); }
  goBack()          : void { this.router.navigate(['/admin/dashboard']); }

  // ─── Supabase image CRUD (inline per row) ─────────────────────────────────
  onRowImageSelect(event: Event, product: Product): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    // Always reset the input so the same file can be re-selected if needed
    input.value = '';

    // Client-side validation
    this.imageErrorMap[product.productId] = '';
    if (file.size > 5 * 1024 * 1024) {
      this.imageErrorMap[product.productId] = 'Max 5 MB exceeded.';
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.imageErrorMap[product.productId] = 'Only image files are allowed.';
      return;
    }

    this.imageLoadingMap[product.productId] = true;

    const existingUrl = product.imageUrl ?? null;

    // Choose upload vs update based on whether an image already exists
    const request$ = existingUrl
      ? this.productService.updateProductImage(product.productId, file, existingUrl)
      : this.productService.uploadProductImage(product.productId, file);

    request$.subscribe({
      next: res => {
        // res: { message: string; imageUrl: string }
        // Patch both the master and filtered arrays so the <img> updates immediately
        this.patchProductImage(product.productId, res.imageUrl);
        this.imageLoadingMap[product.productId] = false;
        this.showToast(existingUrl ? 'Image replaced successfully' : 'Image uploaded successfully');
      },
      error: err => {
        this.imageErrorMap[product.productId]   =
          err?.error?.error ?? err?.message ?? 'Upload failed. Try again.';
        this.imageLoadingMap[product.productId] = false;
        console.error('[ProductList] image upload error', err);
      },
    });
  }

  /**
   * DELETE /api/products/{productId}/images/delete?imageUrl=…
   * Clears imageUrl on the local product object after a successful delete.
   */
  deleteRowImage(product: Product): void {
    if (!product.imageUrl) return;
    if (!confirm(`Delete image for "${product.productName}"?`)) return;

    this.imageErrorMap[product.productId]   = '';
    this.imageLoadingMap[product.productId] = true;

    this.productService
      .deleteProductImage(product.productId, product.imageUrl)
      .subscribe({
        next: () => {
          // res: { message: string }
          this.patchProductImage(product.productId, undefined);
          this.imageLoadingMap[product.productId] = false;
          this.showToast('Image deleted successfully');
        },
        error: err => {
          this.imageErrorMap[product.productId]   =
            err?.error?.error ?? err?.message ?? 'Delete failed. Try again.';
          this.imageLoadingMap[product.productId] = false;
          console.error('[ProductList] image delete error', err);
        },
      });
  }

  isImageLoading(productId: number): boolean { return !!this.imageLoadingMap[productId]; }
  getImageError (productId: number): string  { return this.imageErrorMap[productId] ?? ''; }
  clearImageError(productId: number): void   { this.imageErrorMap[productId] = ''; }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Syncs imageUrl change across both the master and filtered arrays. */
  private patchProductImage(productId: number, url: string | undefined): void {
    [this.products, this.filteredProducts].forEach(arr => {
      const p = arr.find(x => x.productId === productId);
      if (p) {
        p.imageUrl = url;
        p.image    = url;   // keep legacy `image` field in sync too
      }
    });
  }

  getStockBadge(inventory: number): { label: string; class: string } {
    if (inventory === 0)   return { label: 'Out of Stock', class: 'bg-danger' };
    if (inventory < 20)    return { label: 'Critical',     class: 'bg-warning text-dark' };
    if (inventory < 50)    return { label: 'Low Stock',    class: 'bg-info' };
    return                        { label: 'In Stock',     class: 'bg-success' };
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