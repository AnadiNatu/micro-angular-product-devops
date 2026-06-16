import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import {
  Product, Order, CreateProductDTO, UpdateProductDTO,
  CreateOrderDTO, OrderLogDTO, BackendProduct, BackendOrder
} from '../../../core/models/product.model';
import { User } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // Demo-Service-1 (products, users)
  private readonly DS1_URL = 'http://localhost:8081/api';
  // Demo-Service-2 (orders)
  private readonly DS2_URL = 'http://localhost:8082/api';

  // ── Fallback mock data used when backend is unreachable ──
  private mockProducts: Product[] = [
    { productId: 1, productName: 'Laptop Pro 15', productDesc: 'High-performance laptop with 16GB RAM and 512GB SSD', productInventory: 45, price: 1299.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' },
    { productId: 2, productName: 'Wireless Mouse', productDesc: 'Ergonomic wireless mouse with precision tracking', productInventory: 150, price: 29.99, category: 'Accessories', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' },
    { productId: 3, productName: 'Mechanical Keyboard', productDesc: 'RGB mechanical keyboard with cherry MX switches', productInventory: 75, price: 89.99, category: 'Accessories', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
    { productId: 4, productName: '4K Monitor 27"', productDesc: 'Ultra HD 4K monitor with HDR support', productInventory: 30, price: 449.99, category: 'Electronics', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400' },
    { productId: 5, productName: 'USB-C Hub', productDesc: 'Multi-port USB-C hub with HDMI and SD card reader', productInventory: 200, price: 39.99, category: 'Accessories', image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400' }
  ];

  private mockOrders: Order[] = [
    { orderId: 1, orderDate: new Date('2024-03-15'), orderQuantity: 2, estimateDeliveryDate: new Date('2024-03-20'), deliveryDate: new Date('2024-03-19'), orderStatus: 'DELIVERED' as any, userName: 'John Doe', userId: 2, productName: 'Laptop Pro 15', productId: 1 },
    { orderId: 2, orderDate: new Date('2024-03-18'), orderQuantity: 5, estimateDeliveryDate: new Date('2024-03-22'), deliveryDate: new Date('2024-03-22'), orderStatus: 'DISPATCHED' as any, userName: 'Jane Smith', userId: 3, productName: 'Wireless Mouse', productId: 2 },
    { orderId: 3, orderDate: new Date('2024-03-20'), orderQuantity: 1, estimateDeliveryDate: new Date('2024-03-25'), deliveryDate: new Date('2024-03-25'), orderStatus: 'ORDERED' as any, userName: 'Bob Johnson', userId: 4, productName: '4K Monitor 27"', productId: 4 }
  ];

  private mockUsers: User[] = [
    { id: 2, fname: 'John', lname: 'Doe', email: 'user@system.com', role: 'USER' as any, phoneNumber: '+1 (555) 987-6543' },
    { id: 3, fname: 'Jane', lname: 'Smith', email: 'jane.smith@example.com', role: 'USER' as any, phoneNumber: '+1 (555) 123-7890' },
    { id: 4, fname: 'Bob', lname: 'Johnson', email: 'bob.j@example.com', role: 'USER' as any, phoneNumber: '+1 (555) 456-7891' }
  ];

  constructor(private http: HttpClient) {}

  // ── Map backend product shape to UI product shape ──
  private mapBackendProduct(p: any): Product {
    return {
      productId: p.productId,
      productName: p.productName,
      productDesc: p.description || p.productDesc || '',
      productInventory: p.stockQuantity ?? p.productInventory ?? 0,
      price: p.price,
      category: p.category,
      image: p.imageUrl || p.image,
      imageUrl: p.imageUrl,
      active: p.active,
      stockQuantity: p.stockQuantity
    };
  }

  // ── Map backend order shape to UI order shape ──
  private mapBackendOrder(o: any): Order {
    return {
      orderId: o.orderId,
      orderDate: new Date(o.orderDate),
      orderQuantity: o.quantities?.[0] ?? 1,
      estimateDeliveryDate: o.deliveryDate ? new Date(o.deliveryDate) : new Date(),
      deliveryDate: o.deliveryDate ? new Date(o.deliveryDate) : new Date(),
      orderStatus: o.orderStatus as any,
      userName: o.username || 'Unknown',
      userId: o.userId,
      productName: o.orderNumber || 'Order ' + o.orderId,
      productId: o.productIds?.[0] ?? 0,
      orderNumber: o.orderNumber,
      totalAmount: o.totalAmount
    };
  }

  // ==================== PRODUCT OPERATIONS ====================

  getAllProducts(): Observable<Product[]> {
    return this.http.get<any>(`${this.DS1_URL}/products`).pipe(
      map(response => {
        const items = response.content || response || [];
        return items.map((p: any) => this.mapBackendProduct(p));
      }),
      catchError(() => of([...this.mockProducts]))
    );
  }

  getActiveProducts(page = 0, size = 50): Observable<Product[]> {
    return this.http.get<any>(`${this.DS1_URL}/products/active?page=${page}&size=${size}`).pipe(
      map(response => {
        const items = response.content || response || [];
        return items.map((p: any) => this.mapBackendProduct(p));
      }),
      catchError(() => of([...this.mockProducts]))
    );
  }

  createProduct(product: CreateProductDTO): Observable<Product> {
    const payload = {
      productName: product.productName,
      description: product.productDesc,
      price: product.price,
      stockQuantity: product.productInventory
    };
    return this.http.post<any>(`${this.DS1_URL}/products`, payload).pipe(
      map(p => this.mapBackendProduct(p)),
      catchError(() => {
        const newProduct: Product = { productId: this.mockProducts.length + 1, ...product, productOrderIds: [] };
        this.mockProducts.push(newProduct);
        return of(newProduct);
      })
    );
  }

  updateProduct(product: UpdateProductDTO): Observable<Product> {
    return this.http.put<any>(`${this.DS1_URL}/products/${product.productName}`, product).pipe(
      map(p => this.mapBackendProduct(p)),
      catchError(() => {
        const index = this.mockProducts.findIndex(p => p.productName === product.productName);
        if (index !== -1) {
          this.mockProducts[index] = { ...this.mockProducts[index], ...product };
          return of(this.mockProducts[index]);
        }
        return of(product as any);
      })
    );
  }

  deleteProduct(productName: string): Observable<void> {
    return this.http.delete<void>(`${this.DS1_URL}/products/${productName}`).pipe(
      catchError(() => {
        const index = this.mockProducts.findIndex(p => p.productName === productName);
        if (index !== -1) this.mockProducts.splice(index, 1);
        return of(void 0);
      })
    );
  }

  getProductsByAscOrder(): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map(products => [...products].sort((a, b) => a.price - b.price))
    );
  }

  getProductsByDescOrder(): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map(products => [...products].sort((a, b) => b.price - a.price))
    );
  }

  getTopOrderedProducts(): Observable<Product[]> {
    return this.getAllProducts().pipe(map(products => products.slice(0, 3)));
  }

  searchProducts(keyword: string): Observable<Product[]> {
    return this.http.get<any>(`${this.DS1_URL}/products/search?keyword=${encodeURIComponent(keyword)}`).pipe(
      map(response => {
        const items = response.content || response || [];
        return items.map((p: any) => this.mapBackendProduct(p));
      }),
      catchError(() => this.getAllProducts().pipe(
        map(products => products.filter(p =>
          p.productName.toLowerCase().includes(keyword.toLowerCase()) ||
          p.productDesc.toLowerCase().includes(keyword.toLowerCase())
        ))
      ))
    );
  }

  // ==================== ORDER OPERATIONS ====================

  getAllOrders(): Observable<Order[]> {
    return this.http.get<any>(`${this.DS2_URL}/orders/status/PENDING?page=0&size=100`).pipe(
      map(response => {
        const items = response.content || response || [];
        return items.map((o: any) => this.mapBackendOrder(o));
      }),
      catchError(() => of([...this.mockOrders]))
    );
  }

  createOrder(order: CreateOrderDTO): Observable<Order> {
    return this.http.post<any>(`${this.DS2_URL}/orders`, order).pipe(
      map(o => this.mapBackendOrder(o)),
      catchError(() => {
        const newOrder: Order = {
          orderId: this.mockOrders.length + 1,
          orderDate: new Date(),
          orderQuantity: order.orderQuantity,
          estimateDeliveryDate: order.estimateDeliveryDate,
          deliveryDate: order.deliveryDate,
          orderStatus: order.orderStatus as any,
          userName: 'Current User',
          userId: 1,
          productName: order.productName,
          productId: 1
        };
        this.mockOrders.push(newOrder);
        return of(newOrder);
      })
    );
  }

  updateOrder(order: Order): Observable<Order> {
    return this.http.put<any>(`${this.DS2_URL}/orders/${order.orderId}/status?status=${order.orderStatus}`, {}).pipe(
      map(o => this.mapBackendOrder(o)),
      catchError(() => {
        const index = this.mockOrders.findIndex(o => o.orderId === order.orderId);
        if (index !== -1) this.mockOrders[index] = order;
        return of(order);
      })
    );
  }

  deleteOrder(userId: number, productName: string): Observable<void> {
    return this.http.put<void>(`${this.DS2_URL}/orders/${userId}/cancel`, {}).pipe(
      catchError(() => {
        const index = this.mockOrders.findIndex(o => o.userId === userId && o.productName === productName);
        if (index !== -1) this.mockOrders.splice(index, 1);
        return of(void 0);
      })
    );
  }

  getOrdersByUserId(userId: number): Observable<Order[]> {
    return this.http.get<any>(`${this.DS2_URL}/orders/user/${userId}?page=0&size=100`).pipe(
      map(response => {
        const items = response.content || response || [];
        return items.map((o: any) => this.mapBackendOrder(o));
      }),
      catchError(() => of(this.mockOrders.filter(o => o.userId === userId)))
    );
  }

  getOrdersByProductName(productName: string): Observable<Order[]> {
    return this.getAllOrders().pipe(
      map(orders => orders.filter(o => o.productName?.toLowerCase().includes(productName.toLowerCase())))
    );
  }

  // ==================== USER OPERATIONS ====================

  getAllUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.DS1_URL}/users`).pipe(
      map(users => users.map(u => ({
        id: u.userId || u.id,
        fname: u.name?.split(' ')[0] || u.fname || 'User',
        lname: u.name?.split(' ').slice(1).join(' ') || u.lname || '',
        email: u.email,
        role: u.userRole?.includes('ADMIN') ? 'ADMIN' as any : 'USER' as any,
        phoneNumber: u.phone || u.phoneNumber
      }))),
      catchError(() => of([...this.mockUsers]))
    );
  }

  // ==================== ORDER LOGS ====================

  getOrderLogsByProduct(productName: string): Observable<OrderLogDTO[]> {
    return this.getOrdersByProductName(productName).pipe(
      map(orders => orders.map(o => ({
        orderId: o.orderId,
        productName: o.productName,
        userName: o.userName,
        orderQuantity: o.orderQuantity,
        orderPrice: o.totalAmount || 0,
        orderStatus: o.orderStatus,
        deliveredOn: o.deliveryDate,
        productInventory: 0,
        productOrderQuantity: o.orderQuantity
      })))
    );
  }

  getOrderLogsByUsers(): Observable<OrderLogDTO[]> {
    return this.getAllOrders().pipe(
      map(orders => orders.map(o => ({
        orderId: o.orderId,
        productName: o.productName,
        userName: o.userName,
        orderQuantity: o.orderQuantity,
        orderPrice: o.totalAmount || 0,
        orderStatus: o.orderStatus,
        deliveredOn: o.deliveryDate,
        productInventory: 0,
        productOrderQuantity: o.orderQuantity
      })))
    );
  }

  // ==================== ANALYTICS ====================

  getDashboardStats(): Observable<any> {
    return forkJoin({
      products: this.getAllProducts().pipe(catchError(() => of(this.mockProducts))),
      orders: this.getAllOrders().pipe(catchError(() => of(this.mockOrders))),
      users: this.getAllUsers().pipe(catchError(() => of(this.mockUsers)))
    }).pipe(
      map(({ products, orders, users }) => ({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || o.orderQuantity * 100), 0),
        lowStockProducts: products.filter(p => (p.productInventory || p.stockQuantity || 0) < 50).length,
        pendingOrders: orders.filter(o => String(o.orderStatus) === 'PENDING' || String(o.orderStatus) === 'ORDERED').length
      }))
    );
  }

  getRevenueData(): Observable<any[]> {
    return of([
      { month: 'Jan', revenue: 12000 },
      { month: 'Feb', revenue: 15000 },
      { month: 'Mar', revenue: 18000 },
      { month: 'Apr', revenue: 16000 },
      { month: 'May', revenue: 21000 },
      { month: 'Jun', revenue: 25000 }
    ]);
  }
}