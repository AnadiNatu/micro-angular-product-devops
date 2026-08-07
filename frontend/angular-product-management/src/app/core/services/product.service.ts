import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

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

  private readonly BASE_SUFFIX = environment.apiBaseUrl;

  // All requests go through the API Gateway on 8083
  private readonly BASE = `${this.BASE_SUFFIX}/api/products`;

  constructor(private http: HttpClient) {}

  //  Core product endpoints  (no PageResponse — arrays / single objects only)


public mapProduct(product: any): Product {
  return {
    productId: product.productId ?? product.id ?? 0,

    productName: product.productName ?? '',

    description: product.description ?? '',

    price: Number(product.price ?? 0),

    sku: product.sku ?? '',

    category: product.category ?? '',

    image: product.image ?? product.imageUrl ?? '',

    imageUrl: product.imageUrl ?? product.image ?? '',

    productOrderIds: product.productOrderIds ?? [],

    active: product.active ?? true,

    stockQuantity: Number(product.stockQuantity ?? 0),

    createdByUsername: product.createdByUsername
      ?? product.creatorUsername
      ?? '',

    createdByUserId: Number(
      product.createdByUserId
      ?? product.creatorUserId
      ?? 0
    ),

    createdOn: product.createdOn
      ? new Date(product.createdOn)
      : new Date(),

    updatedOn: product.updatedOn
      ? new Date(product.updatedOn)
      : new Date()
  };
}

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

  //  Supabase image endpoints
  //  Controller base: /api/products/{productId}/images
  uploadProductImage(productId: number, file: File): Observable<ImageUploadResponse> {
  const form = new FormData();
  form.append('file', file);
  return this.http.post<ImageUploadResponse>(
    `${this.BASE}/${productId}/images/upload`,     // FIX: singular, matches ProductController
    form
  );
}

updateProductImage(productId: number, file: File): Observable<ImageUploadResponse> {
  // Backend's ProductService.uploadProductImage() already handles
  // "replace if exists" internally — no separate update endpoint needed.
  const form = new FormData();
  form.append('file', file);
  return this.http.post<ImageUploadResponse>(
    `${this.BASE}/${productId}/images/update`,
    form
  );
}

deleteProductImage(productId: number): Observable<ImageDeleteResponse> {
  // FIX: backend DELETE /{productId}/image doesn't need imageUrl param —
  // it reads product.imageUrl from the DB itself.
  return this.http.delete<ImageDeleteResponse>(`${this.BASE}/${productId}/images/delete`);
}

  listProductImages(productId: number): Observable<string> {
    return this.http.get<string>(
      `${this.BASE}/${productId}/images/list`
    );
  }

  /** GET /api/products/{productId}/image → { imageUrl: string | null } */
getProductImage(productId: number): Observable<{ imageUrl: string | null }> {
  return this.http.get<{ imageUrl: string | null }>(`${this.BASE}/${productId}/images/get`);
}
}