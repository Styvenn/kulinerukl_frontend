// ─── Types ────────────────────────────────────────────────────────────────────
export type PriceRange = 'budget' | 'mid' | 'premium';
export type Ambiance = 'indoor' | 'outdoor' | 'rooftop' | 'cozy' | 'lively';
export type Category =
  | 'street-food'
  | 'cafe'
  | 'noodle'
  | 'dessert'
  | 'night-hangout'
  | 'indonesian'
  | 'western';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Review {
  id: string;
  userId: string;
  userName?: string;
  user?: { id: string; name: string; }
  userAvatar?: string;
  rating: number;
  comment: string;
  date?: string;
  createdAt?: string;
  photo?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  category: any;
  categoryId?: string;
  categories?: Category[];
  description: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  openHours: string;
  priceRange: PriceRange;
  priceMin: number;
  priceMax: number;
  rating: number;
  reviewCount: number;
  ambiance: Ambiance[];
  coverImage: string;
  thumbnailImage: string;
  mapUrl: string;
  menu: MenuItem[];
  reviews: Review[];
  isActive: boolean;
}

// ─── Helper Constants ─────────────────────────────────────────────────────────
export const PRICE_LABEL: Record<PriceRange, string> = {
  budget: 'Rp 10k – 30k',
  mid: 'Rp 30k – 75k',
  premium: 'Rp 75k+',
};

export const CATEGORY_LABEL: Record<Category, string> = {
  'street-food': 'Street Food',
  cafe: 'Cozy Cafe',
  noodle: 'Noodle Spots',
  dessert: 'Dessert',
  'night-hangout': 'Night Hangout',
  indonesian: 'Indonesian',
  western: 'Western',
};

// Hardcoded districts for Malang (previously derived from mock data)
export const DISTRICTS = [
  'Blimbing',
  'Kedungkandang',
  'Klojen',
  'Lowokwaru',
  'Sukun',
];
