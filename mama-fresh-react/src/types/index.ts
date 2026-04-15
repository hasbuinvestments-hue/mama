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
}
