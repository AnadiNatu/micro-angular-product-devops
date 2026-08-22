import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import {
  Product, Order, CreateProductDTO, UpdateProductDTO,
  CreateOrderDTO, OrderLogDTO, BackendProduct, BackendOrder,
  ImageUploadResponse,
  CreatedOrderDto,
  OrderItemDto
} from '../../../core/models/product.model';
import { User, UserRole } from '../../../core/models/user.model';
import { ImageDeleteResponse, ProductService } from '../../../core/services/product.service';
import { environment } from '../../../../environments/environment';
interface PageResponse<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
}

// All backend OrderStatus values
const ALL_ORDER_STATUSES = [
  'PENDING', 'CONFIRMED', 'PROCESSING',
  'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
];

@Injectable({ providedIn: 'root' })
export class AdminService {

  // FIX: All calls go through the API Gateway, not direct service ports.
  //      Old code used DS1_URL=:8081 and DS2_URL=:8082 directly, bypassing
  //      the gateway auth filter so requests arrived without JWT headers.
 private readonly BASE_SUFFIX = environment.apiBaseUrl;
  private readonly ADMIN_BASE = `${this.BASE_SUFFIX}/api`;
  // ── Mock data (fallback when backend is unreachable) ─────────────────────────
  private mockProducts: Product[] = [
    {
      productId: 1, productName: 'Laptop Pro 15',
      description: 'High-performance laptop with 16GB RAM',
      price: 1299.99, sku: 'LAP-001', category: 'Electronics',
      image: '', stockQuantity: 45, active: true,
      createdByUsername: 'admin', createdByUserId: 1,
      brand: 'TechBrand',
      createdOn: new Date(), updatedOn: new Date()
    },
    {
      productId: 2, productName: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse',
      price: 29.99, sku: 'MOU-001', category: 'Accessories',
      image: '', stockQuantity: 150, active: true,
      brand: 'TechBrand2',
      createdByUsername: 'admin', createdByUserId: 1,
      createdOn: new Date(), updatedOn: new Date()
    }
  ];

  private mockOrders: Order[] = [];

  private mockUsers: User[] = [
    {
      id: 1, username: 'admin', email: 'admin@example.com',
      roles: ['ROLE_ADMIN'], role: UserRole.ADMIN
    }
  ];

  constructor(
    private http:           HttpClient,
    private productService: ProductService
  ) {}

  // ===========================================================================
  // MAPPERS
  // ===========================================================================

  // Map raw backend ProductDto → frontend Product
  // Delegates to ProductService.mapProduct so there is one source of truth.
  private mapProduct(p: any): Product {
    return this.productService.mapProduct(p);
  }

  // Map raw backend OrderDto → frontend Order
  // FIX: Old code read o.quantities?.[0] and o.productIds?.[0] (flat arrays).
  //      New backend sends items: OrderItemDto[].
  //      Convenience fields (productName, orderQuantity) are derived from items[].
  private mapOrder(o: any): Order {
    const items: OrderItemDto[] = (o.items ?? []).map((i: any): OrderItemDto => ({
      orderItemId:     i.orderItemId,
      orderId:         i.orderId,
      productId:       i.productId,
      productName:     i.productName,
      category:        i.category,
      brand:           i.brand,
      sku:             i.sku,
      creatorUserId:   i.creatorUserId,
      description:     i.description,
      creatorUsername: i.creatorUsername,
      quantity:        i.quantity,
      unitPrice:       i.unitPrice,
      subtotal:        i.subtotal
    }));

    return {
      orderId:          o.orderId,
      orderNumber:      o.orderNumber ?? '',
      userId:           o.userId,
      username:         o.username ?? 'Unknown',
      orderStatus:      o.orderStatus,
      totalAmount:      o.totalAmount ?? 0,
      items,

      // Shipping
      shippingName:    o.shippingName    ?? '',
      shippingPhone:   o.shippingPhone   ?? '',
      shippingEmail:   o.shippingEmail   ?? '',
      shippingAddress: o.shippingAddress ?? '',   // note: triple-d typo is in the model
      shippingCity:    o.shippingCity    ?? '',
      shippingState:   o.shippingState   ?? '',
      shippingCountry: o.shippingCountry ?? '',
      postalCode:      o.postalCode      ?? '',
      notes:           o.notes           ?? '',

      // Dates
      orderDate:          o.orderDate         ? new Date(o.orderDate)         : new Date(),
      createdOn:          o.createdOn         ? new Date(o.createdOn)         : new Date(),
      updatedOn:          o.updatedOn         ? new Date(o.updatedOn)         : new Date(),
      shippedDate:        o.shippedDate       ? new Date(o.shippedDate)       : null as any,
      estimatedDelivery:  o.estimatedDelivery ? new Date(o.estimatedDelivery) : null as any,
      deliveryDate:       o.deliveryDate      ? new Date(o.deliveryDate)      : null as any,
      cancelledDate:      o.cancelledDate     ? new Date(o.cancelledDate)     : null as any
    };
  }

  // Map raw backend user record → frontend User
  private mapUser(u: any): User {
    const rawRoles: string[] = u.role
      ? [String(u.role)]
      : (u.roles ?? []);
    const role = rawRoles.some(r => r.toUpperCase().includes('ADMIN'))
      ? UserRole.ADMIN : UserRole.USER;

    return {
      id:          u.userId ?? u.id ?? 0,
      username:    u.name ?? u.username ?? u.email?.split('@')[0] ?? 'User',
      email:       u.email ?? '',
      roles:       rawRoles,
      role,
      phoneNumber: u.phone ?? u.phoneNumber,
      // Legacy aliases
      fname: (u.name ?? u.username ?? '').split(' ')[0],
      lname: (u.name ?? u.username ?? '').split(' ').slice(1).join(' ')
    };
  }

  // ===========================================================================
  // PRODUCT OPERATIONS  — /api/products  (DS1 via gateway)
  // ===========================================================================

  // GET /api/products?page=0&size=100&sortBy=createdOn  →  Page<ProductDto>
  getAllProducts(page = 0, size = 100): Observable<Product[]> {
    return this.http.get<PageResponse<any>>(
      `${this.ADMIN_BASE}/products?page=${page}&size=${size}&sortBy=createdOn`
    ).pipe(
      map(r => (r.content ?? (r as any) ?? []).map((p: any) => this.mapProduct(p))),
      catchError(() => of([...this.mockProducts]))
    );
  }

  // GET /api/products/active?page=0&size=50
  getActiveProducts(page = 0, size = 50): Observable<Product[]> {
    return this.http.get<PageResponse<any>>(
      `${this.ADMIN_BASE}/products/active?page=${page}&size=${size}`
    ).pipe(
      map(r => (r.content ?? (r as any) ?? []).map((p: any) => this.mapProduct(p))),
      catchError(() => of([...this.mockProducts]))
    );
  }

  // GET /api/products/{productId}
  getProduct(productId: number): Observable<Product> {
    return this.http.get<any>(`${this.ADMIN_BASE}/products/${productId}`).pipe(
      map(p => this.mapProduct(p))
    );
  }

  // POST /api/products
  // createProduct(product: CreateProductDTO): Observable<Product> {
  //   return this.http.post<any>(`${this.ADMIN_BASE}/products`, product).pipe(
  //     map(p => this.mapProduct(p)),
  //     catchError(() => {
  //       const np: Product = {
  //         productId: Date.now(), ...product,
  //         description: product.description,
  //         sku: product.sku,
  //         stockQuantity: product.stockQuantity,
  //         active: true,
  //         image: '', createdByUsername: '', createdByUserId: 0,
  //         createdOn: new Date(), updatedOn: new Date()
  //       };
  //       this.mockProducts.push(np);
  //       return of(np);
  //     })
  //   );
  // }

  // POST /api/products
createProduct(product: CreateProductDTO): Observable<Product> {
  return this.http.post<any>(`${this.ADMIN_BASE}/products`, product).pipe(
    map(p => this.mapProduct(p))
    // REMOVED catchError — a failed creation must fail loudly, not fake success.
    // Let the component's error handler show the real message to the admin.
  );
}

  // FIX: Old code called PUT /products/{product.productName} (name in path).
  //      Backend controller is PUT /products/{productId} (ID in path).
  // updateProduct(productId: number, product: Partial<UpdateProductDTO>): Observable<Product> {
  //   return this.http.put<any>(`${this.ADMIN_BASE}/products/${productId}`, product).pipe(
  //     map(p => this.mapProduct(p)),
  //     catchError(() => of({} as Product))
  //   );
  // }

  // PUT /api/products/{productId}/deactivate
  deactivateProduct(productId: number): Observable<Product> {
    return this.productService.deactivateProduct(productId);
  }

  // PUT /api/products/{productId}/stock?quantity=n
  updateStock(productId: number, quantity: number): Observable<Product> {
    return this.productService.updateStock(productId, quantity);
  }

  // GET /api/products/search?keyword=…
  searchProducts(keyword: string): Observable<Product[]> {
    return this.http.get<PageResponse<any>>(
      `${this.ADMIN_BASE}/products/search?keyword=${encodeURIComponent(keyword)}`
    ).pipe(
      map(r => (r.content ?? (r as any) ?? []).map((p: any) => this.mapProduct(p))),
      catchError(() =>
        this.getAllProducts().pipe(
          map(ps => ps.filter(p =>
            p.productName.toLowerCase().includes(keyword.toLowerCase())
          ))
        )
      )
    );
  }

  // GET /api/products/{productId}/order-stats
  getProductOrderStats(productId: number): Observable<{ product: Product; totalOrders: number }> {
    return this.http.get<any>(`${this.ADMIN_BASE}/products/${productId}/order-stats`).pipe(
      map(r => ({
        product:     this.mapProduct(r.product),
        totalOrders: r.totalOrders ?? 0
      }))
    );
  }

  // Sorted convenience helpers
  getProductsByAscOrder():  Observable<Product[]> {
    return this.getAllProducts().pipe(map(ps => [...ps].sort((a, b) => a.price - b.price)));
  }
  getProductsByDescOrder(): Observable<Product[]> {
    return this.getAllProducts().pipe(map(ps => [...ps].sort((a, b) => b.price - a.price)));
  }
  getTopOrderedProducts():  Observable<Product[]> {
    return this.getAllProducts().pipe(map(ps => ps.slice(0, 3)));
  }

  // Image operations — delegates to ProductService (which uses correct endpoints)
  uploadProductImage(
  productId: number,
  file: File
): Observable<ImageUploadResponse> {
  return this.productService.uploadProductImage(
    productId,
    file
  );
}

updateProductImage(productId: number,file: File,oldImageUrl: string | null = null): Observable<ImageUploadResponse> {
  return this.productService.updateProductImage(productId,file);
}

deleteProductImage(productId: number): Observable<ImageDeleteResponse> 
{return this.productService.deleteProductImage(productId);}

  // ===========================================================================
  // ORDER OPERATIONS  — /api/orders  (DS2 via gateway)
  // ===========================================================================

  // FIX: Old code only fetched PENDING orders from one status endpoint.
  //      Backend has no single "get-all" endpoint so we fan out across all
  //      statuses with forkJoin and flatten the results.
  getAllOrders(page = 0, size = 50): Observable<Order[]> {
    const requests = ALL_ORDER_STATUSES.map(status =>
      this.http.get<PageResponse<any>>(
        `${this.ADMIN_BASE}/orders/status/${status}?page=${page}&size=${size}`
      ).pipe(
        map(r => (r.content ?? (r as any) ?? []).map((o: any) => this.mapOrder(o))),
        catchError(() => of([] as Order[]))
      )
    );
    return forkJoin(requests).pipe(
      map(results => results.flat()),
      catchError(() => of([...this.mockOrders]))
    );
  }

  // GET /api/orders/{orderId}
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<any>(`${this.ADMIN_BASE}/orders/${orderId}`).pipe(
      map(o => this.mapOrder(o))
    );
  }

  // GET /api/orders/user/{userId}?page=0&size=100
  getOrdersByUserId(userId: number, page = 0, size = 100): Observable<Order[]> {
    return this.http.get<PageResponse<any>>(
      `${this.ADMIN_BASE}/orders/user/${userId}?page=${page}&size=${size}`
    ).pipe(
      map(r => (r.content ?? (r as any) ?? []).map((o: any) => this.mapOrder(o))),
      catchError(() => of(this.mockOrders.filter(o => o.userId === userId)))
    );
  }

  // GET /api/orders/status/{status}?page=0&size=50
  getOrdersByStatus(status: string, page = 0, size = 50): Observable<Order[]> {
    return this.http.get<PageResponse<any>>(
      `${this.ADMIN_BASE}/orders/status/${status}?page=${page}&size=${size}`
    ).pipe(
      map(r => (r.content ?? (r as any) ?? []).map((o: any) => this.mapOrder(o))),
      catchError(() => of([]))
    );
  }

  // POST /api/orders  — payload is CreatedOrderDto (items[] + shipping)
  createOrder(order: CreatedOrderDto): Observable<Order> {
    return this.http.post<any>(`${this.ADMIN_BASE}/orders`, order).pipe(
      map(o => this.mapOrder(o)),
      catchError(err => { throw err; })
    );
  }

  // PUT /api/orders/{orderId}/status?status=XXX
  // FIX: Only status is updatable via the backend endpoint.
updateOrderStatus(orderId: number, status: string): Observable<Order> {
  return this.http.put<any>(
    `${this.ADMIN_BASE}/orders/${orderId}/status?status=${status}`, {}
  ).pipe(
    map(o => this.mapOrder(o))
    // REMOVED catchError — let real failures reach the component's error handler
  );
}

  // Convenience alias: accepts an Order object, reads its status
  updateOrder(order: Order): Observable<Order> {
    return this.updateOrderStatus(order.orderId, order.orderStatus);
  }

  // PUT /api/orders/{orderId}/cancel
  // FIX: Old deleteOrder(userId, productName) was passing userId as the order ID
  //      to cancel — completely wrong. Now takes orderId directly.
  cancelOrder(orderId: number): Observable<Order> {
    return this.http.put<any>(`${this.ADMIN_BASE}/orders/${orderId}/cancel`, {}).pipe(
      map(o => this.mapOrder(o)),
      catchError(() => of({} as Order))
    );
  }

  // Alias kept so components that call deleteOrder(orderId) still compile
  deleteOrder(orderId: number): Observable<void> {
    return this.cancelOrder(orderId).pipe(map(() => void 0));
  }

  // GET /api/orders/stats
  getOrderStatistics(): Observable<any> {
    return this.http.get<any>(`${this.ADMIN_BASE}/orders/stats`);
  }

//   getOrderLogsByUsers(
//   userName?: string
// ): Observable<OrderLogDTO[]> {

//   let params = new HttpParams();

//   if (userName?.trim()) {
//     params = params.set('userName', userName.trim());
//   }

//   return this.http.get<OrderLogDTO[]>(
//     `${this.ADMIN_BASE}/orders/logs/users`,
//     { params }
//   );
// }

// getOrderLogsByProduct(
//   productName: string
// ): Observable<OrderLogDTO[]> {

//   const params = new HttpParams()
//     .set('productName', productName);

//   return this.http.get<OrderLogDTO[]>(
//     `${this.ADMIN_BASE}/orders/logs/product`,
//     { params }
//   );
// }
  // ===========================================================================
  // USER OPERATIONS  — /api/users  (DS1 via gateway)
  // ===========================================================================

  // GET /api/users (paginated)
  getAllUsers(page = 0, size = 100): Observable<User[]> {
    return this.http.get<PageResponse<any>>(
      `${this.ADMIN_BASE}/users?page=${page}&size=${size}`
    ).pipe(
      map(r => (r.content ?? (r as any) ?? []).map((u: any) => this.mapUser(u))),
      catchError(() => of([...this.mockUsers]))
    );
  }


getOrderLogsByProduct(
  productName: string
): Observable<OrderLogDTO[]> {

  const params = new HttpParams()
    .set('productName', productName.trim());

  return this.http.get<OrderLogDTO[]>(
    `${this.ADMIN_BASE}/orders/logs/product`,
    { params }
  );
}


getOrderLogsByUsers(): Observable<OrderLogDTO[]> {

  return this.http.get<OrderLogDTO[]>(
    `${this.ADMIN_BASE}/orders/logs/users`
  );
}

  updateProduct(
    productId: number,
    product: Partial<UpdateProductDTO>
): Observable<Product> {

    return this.http.put<any>(
        `${this.ADMIN_BASE}/products/${productId}`,
        product
    ).pipe(
        map(p => this.mapProduct(p))
    );
}

  // ===========================================================================
  // ORDER LOGS  (derived — no dedicated backend endpoint)
  // ===========================================================================

  // Search orders where any item's productName matches the keyword
  // FIX: Old version read o.productName (flat field). Items are now in items[].
  // getOrderLogsByProduct(productName: string): Observable<OrderLogDTO[]> {
  //   return this.getAllOrders().pipe(
  //     map(orders => orders
  //       .filter(o => o.items?.some(
  //         i => String(i.productName).toLowerCase().includes(productName.toLowerCase())
  //       ))
  //       .map(o => {
  //         const matched = o.items?.find(
  //           i => String(i.productName).toLowerCase().includes(productName.toLowerCase())
  //         );
  //         return {
  //           orderId:              o.orderId,
  //           productName:          String(matched?.productName ?? productName),
  //           userName:             o.username ?? 'Unknown',
  //           orderQuantity:        matched?.quantity ?? 0,
  //           orderPrice:           o.totalAmount ?? 0,
  //           orderStatus:          o.orderStatus as any,
  //           deliveredOn:          o.deliveryDate,
  //           productInventory:     0,
  //           productOrderQuantity: matched?.quantity ?? 0
  //         } as OrderLogDTO;
  //       })
  //     )
  //   );
  // }

  // All orders as log rows
  // FIX: Old version read o.userName/o.orderQuantity — now derived from items[].
  // getOrderLogsByUsers(): Observable<OrderLogDTO[]> {
  //   return this.getAllOrders().pipe(
  //     map(orders => orders.map(o => {
  //       const totalQty = o.items?.reduce((s, i) => s + (i.quantity ?? 0), 0) ?? 0;
  //       const firstName = o.items?.[0] ? String(o.items[0].productName) : `Order #${o.orderId}`;
  //       return {
  //         orderId:              o.orderId,
  //         productName:          firstName,
  //         userName:             o.username ?? 'Unknown',
  //         orderQuantity:        totalQty,
  //         orderPrice:           o.totalAmount ?? 0,
  //         orderStatus:          o.orderStatus as any,
  //         deliveredOn:          o.deliveryDate,
  //         productInventory:     0,
  //         productOrderQuantity: totalQty
  //       } as OrderLogDTO;
  //     }))
  //   );
  // }

  // ===========================================================================
  // ANALYTICS
  // ===========================================================================

  getDashboardStats(): Observable<any> {
    return forkJoin({
      products: this.getAllProducts().pipe(catchError(() => of(this.mockProducts))),
      orders:   this.getAllOrders().pipe(catchError(() => of(this.mockOrders))),
      users:    this.getAllUsers().pipe(catchError(() => of(this.mockUsers)))
    }).pipe(
      map(({ products, orders, users }) => ({
        totalProducts:    products.length,
        totalOrders:      orders.length,
        totalUsers:       users.length,
        totalRevenue:     orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0),
        lowStockProducts: products.filter(
          p => (p.stockQuantity ?? 0) < 50
        ).length,
        pendingOrders: orders.filter(
          o => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED'
        ).length
      }))
    );
  }

  getRevenueData(): Observable<any[]> {
    return of([
      { month: 'Jan', revenue: 12000 }, { month: 'Feb', revenue: 15000 },
      { month: 'Mar', revenue: 18000 }, { month: 'Apr', revenue: 16000 },
      { month: 'May', revenue: 21000 }, { month: 'Jun', revenue: 25000 }
    ]);
  }
}