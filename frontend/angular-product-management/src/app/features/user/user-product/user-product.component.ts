import { Component } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../admin/services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HighlightDirective } from '../../../shared/directives/highlight.directive';
import { CustomCurrencyPipe } from '../../../shared/pipes/custom-currency.pipe';

@Component({
  selector: 'app-user-product',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomCurrencyPipe, HighlightDirective],
  templateUrl: './user-product.component.html',
  styleUrl: './user-product.component.css'
})
export class UserProductComponent {
  products: Product[] = [];
  filtered: Product[] = [];
  searchTerm = '';
  selectedCategory = 'all';
  isLoading = true;
  userName = '';
  categories = ['all', 'Electronics', 'Accessories', 'Furniture', 'Clothing'];

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getCurrentUser()?.fname || 'User';
    this.adminService.getActiveProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filtered = products;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  filterProducts(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filtered = this.products.filter(p => {
      const matchSearch = !term ||
        p.productName.toLowerCase().includes(term) ||
        p.productDesc.toLowerCase().includes(term);
      const matchCat = this.selectedCategory === 'all' || p.category === this.selectedCategory;
      return matchSearch && matchCat;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.filtered = this.products;
  }
}
