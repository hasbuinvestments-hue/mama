export interface TierItem {
  category: string;
  name: string;
}

export interface PricingTier {
  label: string;
  price: number;
  summary: string;
  items?: TierItem[];
}

export interface Package {
  id: string;
  name: string;
  badge: string;
  description: string;
  speed: string;
  highlights: string[];
  contents: string[];
  useCases: string[];
  pricing: PricingTier[];
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  detail: string;
  unit: string;
  price: number;
  salePrice?: number;
  topSeller?: boolean;
  villageSourced?: boolean;
  imageUrl?: string;
  imageLabel?: string;
  isAvailable?: boolean;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  productIds: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
}

export interface Mix {
  id: string;
  title: string;
  description: string;
}

export interface CartItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  quantity: number;
  subscription?: {
    frequency: string;
    tier: string;
    packageId: string;
  };
}

export interface TownCoordinator {
  id: number;
  town: string;
  coordinator_name: string;
  whatsapp_number: string;
  pin: string;
  delivery_fee: string;
  is_active: boolean;
}

export interface OrderBatch {
  id: number;
  batch_date: string;
  status: 'OPEN' | 'DISPATCHED' | 'DELIVERED';
  is_express: boolean;
  created_at: string;
  dispatched_at?: string;
  notes?: string;
  pickup_confirmed_at?: string;
  arrived_nairobi_at?: string;
  dispatched_to_customers_at?: string;
}

export interface BatchVendorAssignment {
  id: number;
  batch: number;
  town: string;
  vendor_name: string;
  vendor_whatsapp: string;
  product_name: string;
  unit: string;
  quantity: number;
  source_town: string;
  is_absent: boolean;
  reassigned_product?: string;
  whatsapp_sent: boolean;
}
