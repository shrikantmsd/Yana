import type { ID, TimelineEvent } from './common';

export const PRODUCT_CATEGORIES = [
  'Wash & Shampoo',
  'Tyre & Trim',
  'Interior Care',
  'Glass Care',
  'Exterior Care',
  'Professional Detailing',
  'Accessories',
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type ProductStatus = 'Active' | 'Draft' | 'Discontinued';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Critical' | 'Out of Stock';

export interface Product {
  id: ID; // same as sku
  sku: string;
  name: string;
  category: ProductCategory;
  description: string;
  application: string;
  packSize: number;
  unit: 'ml' | 'L' | 'g' | 'pc';
  mrp: number;
  dealerPrice: number;
  distributorPrice: number;
  gstRate: number;
  stock: number;
  reorderLevel: number;
  status: ProductStatus;
  usageInstructions: string[];
  compatibility: string[];
  precautions: string[];
  faq: { q: string; a: string }[];
  imageColor: string;
  trainingVideo: { title: string; minutes: number } | null;
  monthlyVelocity: number;
  lastMovement: { at: string; type: 'Inbound' | 'Dispatch' | 'Adjustment'; qty: number };
  expectedReplenishmentAt: string | null;
}

export const ORDER_STATUSES = [
  'New',
  'Confirmed',
  'Payment Pending',
  'Processing',
  'Packed',
  'Dispatched',
  'Out for Delivery',
  'Delivered',
  'Completed',
  'Cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['Paid', 'Pending', 'Partially Paid', 'Overdue', 'Refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type DispatchStatus = 'Not Dispatched' | 'Ready to Dispatch' | 'Dispatched' | 'Cancelled';
export type DeliveryStatus = 'Pending' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  id: ID;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  taxRate: number;
  /** quantity x unitPrice, before discount and tax */
  gross: number;
  discount: number;
  tax: number;
  /** what the customer pays for this line */
  lineTotal: number;
}

export interface Order {
  id: ID;
  customerId: ID;
  companyId: ID;
  orderedAt: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  dispatchStatus: DispatchStatus;
  deliveryStatus: DeliveryStatus;
  salespersonId: ID;
  expectedDeliveryAt: string | null;
  deliveredAt: string | null;
  trackingId: string | null;
  notes: string;
  timeline: TimelineEvent[];
}
