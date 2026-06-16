import { Component, NgModule, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Product } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , CustomCurrencyPipe],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;

  // Filter options
  selectedCategory: string = 'all';
  categories: string[] = ['all', 'Electronics', 'Accessories', 'Furniture', 'Clothing'];

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Load all products
   */
  loadProducts(): void {
    this.isLoading = true;
    this.adminService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.isLoading = false;
        console.log('Products loaded:', products.length);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Search products by name or description
   */
  searchProducts(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = 
        product.productName.toLowerCase().includes(term) ||
        product.productDesc.toLowerCase().includes(term);
      
      const matchesCategory = 
        this.selectedCategory === 'all' || 
        product.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    console.log('Filtered products:', this.filteredProducts.length);
  }

  /**
   * Filter by category
   */
  filterByCategory(): void {
    this.searchProducts(); // Reuse search logic
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.filteredProducts = this.products;
  }

  /**
   * Navigate to update product
   */
  updateProduct(productName: string): void {
    this.router.navigate(['/admin/update-product', productName]);
  }

  /**
   * Delete product with confirmation
   */
  deleteProduct(product: Product): void {
    const confirmMessage = `Are you sure you want to delete "${product.productName}"?\n\nThis action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      this.adminService.deleteProduct(product.productName).subscribe({
        next: () => {
          console.log('Product deleted:', product.productName);
          this.loadProducts(); // Reload list
          this.showSuccessMessage('Product deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product. Please try again.');
        }
      });
    }
  }

  /**
   * Navigate to create product
   */
  createNewProduct(): void {
    this.router.navigate(['/admin/create-product']);
  }

  /**
   * Get stock level badge
   */
  getStockBadge(inventory: number): { label: string; class: string } {
    if (inventory === 0) {
      return { label: 'Out of Stock', class: 'bg-danger' };
    } else if (inventory < 20) {
      return { label: 'Critical', class: 'bg-warning text-dark' };
    } else if (inventory < 50) {
      return { label: 'Low Stock', class: 'bg-info' };
    } else {
      return { label: 'In Stock', class: 'bg-success' };
    }
  }

  /**
   * Show success message
   */
  private showSuccessMessage(message: string): void {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${message}`;
    document.body.appendChild(alertDiv);

    setTimeout(() => alertDiv.remove(), 3000);
  }

  /**
   * Navigate back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}