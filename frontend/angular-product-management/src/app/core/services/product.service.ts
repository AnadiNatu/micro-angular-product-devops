import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

// ─── Response shapes returned by the Spring controllers ───────────────────────

export interface ImageUploadResponse {
  message: string;
  imageUrl: string;
}

export interface ImageDeleteResponse {
  message: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ProductService {

  // All requests go through the API Gateway on 8083
  private readonly BASE = 'http://localhost:8083/api/products';

  constructor(private http: HttpClient) {}

  // ══════════════════════════════════════════════════════════════════════════
  //  Core product endpoints  (no PageResponse — arrays / single objects only)
  // ══════════════════════════════════════════════════════════════════════════

  /** GET /api/products  →  Product[] */
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.BASE);
  }

  /** GET /api/products/active  →  Product[] */
  getActiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.BASE}/active`);
  }

  /** GET /api/products/{productId}  →  Product */
  getProduct(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.BASE}/${productId}`);
  }

  /** POST /api/products  →  Product */
  createProduct(payload: {
    productName: string;
    description: string;
    price: number;
    stockQuantity: number;
    category?: string;
  }): Observable<Product> {
    return this.http.post<Product>(this.BASE, payload);
  }

  /** PUT /api/products/{productId}  →  Product */
  updateProduct(productId: number, payload: {
    productName?: string;
    description?: string;
    price?: number;
    stockQuantity?: number;
    category?: string;
  }): Observable<Product> {
    return this.http.put<Product>(`${this.BASE}/${productId}`, payload);
  }

  /** DELETE /api/products/{productId}  →  void */
  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${productId}`);
  }

  /** PUT /api/products/{productId}/deactivate  →  Product */
  deactivateProduct(productId: number): Observable<Product> {
    return this.http.put<Product>(`${this.BASE}/${productId}/deactivate`, null);
  }

  /** PUT /api/products/{productId}/stock?quantity=n  →  Product */
  updateStock(productId: number, quantity: number): Observable<Product> {
    const params = new HttpParams().set('quantity', quantity);
    return this.http.put<Product>(`${this.BASE}/${productId}/stock`, null, { params });
  }

  /** GET /api/products/search?keyword=…  →  Product[] */
  searchProducts(keyword: string): Observable<Product[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Product[]>(`${this.BASE}/search`, { params });
  }

  /** GET /api/products/category/{category}  →  Product[] */
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.BASE}/category/${encodeURIComponent(category)}`
    );
  }

  /** POST /api/products/list  →  Product[]  (fetch by list of IDs) */
  getProductsByIds(ids: number[]): Observable<Product[]> {
    return this.http.post<Product[]>(`${this.BASE}/list`, ids);
  }

  /** GET /api/products/{productId}/available  →  boolean */
  isProductAvailable(productId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.BASE}/${productId}/available`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Supabase image endpoints
  //  Controller base: /api/products/{productId}/images
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * POST /api/products/{productId}/images/upload
   * Multipart upload — returns { message, imageUrl }.
   */
  uploadProductImage(
    productId: number,
    file: File
  ): Observable<ImageUploadResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ImageUploadResponse>(
      `${this.BASE}/${productId}/images/upload`,
      form
    );
  }

  /**
   * PUT /api/products/{productId}/images/update?oldImageUrl=…
   * Replaces existing image. Pass oldImageUrl so the backend deletes the
   * previous Supabase file before uploading the new one.
   * Returns { message, imageUrl }.
   */
  updateProductImage(
    productId: number,
    file: File,
    oldImageUrl: string | null = null
  ): Observable<ImageUploadResponse> {
    const form = new FormData();
    form.append('file', file);
    let params = new HttpParams();
    if (oldImageUrl) {
      params = params.set('oldImageUrl', oldImageUrl);
    }
    return this.http.put<ImageUploadResponse>(
      `${this.BASE}/${productId}/images/update`,
      form,
      { params }
    );
  }

  /**
   * DELETE /api/products/{productId}/images/delete?imageUrl=…
   * Returns { message } on success.
   */
  deleteProductImage(
    productId: number,
    imageUrl: string
  ): Observable<ImageDeleteResponse> {
    const params = new HttpParams().set('imageUrl', imageUrl);
    return this.http.delete<ImageDeleteResponse>(
      `${this.BASE}/${productId}/images/delete`,
      { params }
    );
  }

  /**
   * GET /api/products/{productId}/images/list
   * Returns raw JSON string from Supabase Storage listing.
   */
  listProductImages(productId: number): Observable<string> {
    return this.http.get<string>(
      `${this.BASE}/${productId}/images/list`
    );
  }
}