export interface Product {
  productId: number;
  productName: string;
  productDesc: string;
  productInventory: number;
  price: number;
  category?: string;
  image?: string;
  imageUrl?: string;
  productOrderIds?: number[];
  active?: boolean;
  stockQuantity?: number;
}

export interface CreateProductDTO {
  productName: string;
  productDesc: string;
  productInventory: number;
  price: number;
}

export interface UpdateProductDTO {
  productName: string;
  productDesc: string;
  productInventory: number;
  price: number;
}

export enum OrderStatus {
  ORDERED = 'ORDERED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED'
}

export interface Order {
  orderId: number;
  orderDate: Date;
  orderQuantity: number;
  estimateDeliveryDate: Date;
  deliveryDate: Date;
  orderStatus: OrderStatus;
  userName: string;
  userId: number;
  productName: string;
  productId: number;
  orderNumber?: string;
  totalAmount?: number;
  orderStatus2?: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDTO {
  productName: string;
  orderQuantity: number;
  estimateDeliveryDate: Date;
  deliveryDate: Date;
  orderStatus: string;
}

export interface OrderLogDTO {
  orderId: number;
  productName: string;
  userName: string;
  orderQuantity: number;
  orderPrice: number;
  orderStatus: OrderStatus;
  deliveredOn: Date;
  productInventory: number;
  productOrderQuantity: number;
}

// Backend DS1 product shape
export interface BackendProduct {
  productId: number;
  productName: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category?: string;
  imageUrl?: string;
  active?: boolean;
}

// Backend DS2 order shape
export interface BackendOrder {
  orderId: number;
  orderNumber: string;
  userId: number;
  username?: string;
  productIds: number[];
  quantities: number[];
  totalAmount: number;
  orderStatus: string;
  shippingAddress?: string;
  notes?: string;
  orderDate: string;
  deliveryDate?: string;
}

export interface ImageUploadResponse {
  message: string;
  imageUrl: string;
}