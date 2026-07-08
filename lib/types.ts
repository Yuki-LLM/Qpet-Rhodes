export type UserRole = "customer" | "admin";

export type StockStatus = "In Stock" | "Out of Stock";

export type OrderStatus =
  | "New Order"
  | "Preparing"
  | "Ready for Pickup"
  | "Completed"
  | "Cancelled";

export type ProductVariant = {
  id: string;
  product_id: string;
  variant_name: string;
  price: number;
  sale_price: number | null;
  stock_status: StockStatus;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  pet_type: string | null;
  description: string | null;
  image_url: string | null;
  source_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  product_variants?: ProductVariant[];
};

export type CartLine = {
  id: string;
  quantity: number;
  products: Product;
  product_variants: ProductVariant;
};

export type OrderLine = {
  id: string;
  product_name: string;
  variant_name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  status: OrderStatus;
  full_name: string;
  phone: string;
  email: string;
  pickup_date: string;
  pickup_time: string;
  notes: string | null;
  total_amount: number;
  created_at: string;
  order_items?: OrderLine[];
};
