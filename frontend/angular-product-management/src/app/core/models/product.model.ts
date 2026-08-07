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

export interface ProductInfoDto {
  productId : number;
  productName : string;
  description : string;
  price : number;
  stockQuanity : number;
  category : string;
  sku : string;
  brand : string;
  imageUrl : string;
  active : boolean;
  creatorUserId : number;
  creatorUsername : string;
}

export interface UpdateProductDTO {
  description: string;
  productDesc: string;
  stockQuantity: number;
  price: number;
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
  ORDERED = 'ORDERED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED'
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
  shippingAdddress : string;
  shippingCity : string;
  shippingState  : string;
  shippingCountry : string;
  postalCode : string;
  notes : string;
  orderDate : Date;
  createdOn : Date;
  updatedOn : Date;
  shippedDate : Date;
  estimatedDelivery : Date;
  deliveryDate : Date;
  cancelledDate : Date;
}

export interface CreateOrderItemDto {
  productId : number;
  quantity : number;
}

export interface OrderItemDto{
  orderItemId : number;
  productId : number;
  productName : number;
  category : string;
  brand : string;
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