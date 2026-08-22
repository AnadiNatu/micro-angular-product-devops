export interface Product {
  productId: number;
  productName: string;
  description: string;
  // productInventory: number;
  price: number;
  sku : string;
  category?: string;
  image?: string;
  imageUrl?: string;
  productOrderIds?: number[];
  active?: boolean;
  brand: string;
  stockQuantity?: number;
  createdByUsername : string;
  createdByUserId : number;
  createdOn : Date;
  updatedOn : Date;
}

export interface CreateProductDTO {
  productName: string;
  description : string;
  price: number;
  stockQuantity : number;
  category : string;
  sku : string;
  brand : string;
  createdByUserId ?: number;
}

export interface PageResponse<T> {
  content         : T[];
  totalElements   : number;
  totalPages      : number;
  size            : number;
  number          : number;
  first           : boolean;
  last            : boolean;
  numberOfElements: number;
}

export interface ProductInfoDto {
  productId : number;
  productName : string;
  description : string;
  price : number;
  stockQuantity : number;
  category : string;
  sku : string;
  brand : string;
  imageUrl : string;
  active : boolean;
  creatorUserId : number;
  creatorUsername : string;
}

export interface UpdateProductDTO {
  description?: string;
  price?: number;
  stockQuantity?: number;
  category?: string;
  brand?: string;
}

export interface CreateDemoEntity1Dto{
  demoData : string;
  userId : number;
}


export interface DemoEntity1Dto{
demoEn1Id : number;
demoData : string;
createdOn : Date;
updatedOn : Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface Order {
  orderId : number;
  orderNumber : string;
  userId : number;
  username : string;
  orderStatus : string;
  totalAmount : number;
  items : OrderItemDto[];
  shippingName : string;
  shippingPhone : string;
  shippingEmail : string;
  shippingAddress : string;
  shippingCity : string;
  shippingState  : string;
  shippingCountry : string;
  postalCode : string;
  notes ?: string;
  orderDate ?: Date | null;
  createdOn ?: Date | null;
  updatedOn ?: Date | null;
  shippedDate : Date | null;
  estimatedDelivery : Date | null;
  deliveryDate : Date | null;
  cancelledDate : Date | null;
}

export interface CreateOrderItemDto {
  productId : number;
  quantity : number;
}

export interface OrderItemDto{
  orderItemId : number;
  orderId : number;
  productId : number;
  productName : string;
  category : string;
  brand : string;
  description: string;
  sku : string;
  creatorUserId : number;
  creatorUsername : string;
  quantity : number;
  unitPrice : number;
  subtotal : number; 
}

export interface CreateOrderDTO {
  productName: string;
  orderQuantity: number;
  estimateDeliveryDate: Date;
  deliveryDate: Date;
  orderStatus: string;
}

export interface CreatedOrderDto {
  userId : number;
  items : CreateOrderItemDto[];
  shippingName : string;
  shippingPhone : string;
  shippingEmail : string;
  shippingAddress : string;
  shippingCity : string;
  shippingState : string;
  shippingCountry : string;
  postalCode : string;
  notes : string; 
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

export interface CreateDemoEntity2Dto{
  demoInfo : string;
  entityStatus : string;
  countField : number;
  priceFeild : number;
}

export interface DemoEntity2Dto {
  demoEn2Id : number;
  demoInfo : string;
  entityStatus : string;
  countField : number;
  priceField : number;
  userName : string[];
  userId : number[];
  de1Id : number;
}

export interface AddUserListAndDE1ToDE2Dto{
  demoEn2Id : string;
  userIds : number[];
  demoEn1Id : number;
}

export interface AddUserToListDE1ForDE2Dto{
  userId : number;
  demoEn2Id : number;
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

export function getOrderStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    PENDING   : 'bg-warning text-dark',
    CONFIRMED : 'bg-info text-dark',
    PROCESSING: 'bg-primary',
    SHIPPED   : 'bg-info',
    DELIVERED : 'bg-success',
    CANCELLED : 'bg-danger',
    REFUNDED  : 'bg-secondary',
  };
  return map[status?.toUpperCase()] ?? 'bg-secondary';
}


export function getStockBadge(qty: number): { label: string; class: string } {
  if (qty <= 0) return { label: 'Out of Stock', class: 'bg-danger'             };
  if (qty < 10) return { label: 'Critical',     class: 'bg-danger'             };
  if (qty < 20) return { label: 'Low Stock',    class: 'bg-warning text-dark'  };
  if (qty < 50) return { label: 'Medium Stock', class: 'bg-info text-dark'     };
  return              { label: 'In Stock',      class: 'bg-success'            };
}