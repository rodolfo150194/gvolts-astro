export type DiscountType = 'percentage' | 'fixed';

export type ServiceSlug = 'fire-alarm' | 'security' | 'electricity';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  promo_code: string | null;
  applicable_services: ServiceSlug[];
  start_date: string; // ISO 8601 timestamp
  end_date: string; // ISO 8601 timestamp
  is_active: boolean;
  banner_image: string | null;
  terms: string | null;
  max_uses: number | null;
  current_uses: number;
  created_at: string;
  updated_at: string;
}

export interface ActivePromotion extends Promotion {
  // Helper computed properties
  isValid: boolean;
  daysRemaining: number;
  usesRemaining: number | null;
}

export interface PromotionFilter {
  service?: ServiceSlug;
  activeOnly?: boolean;
}

export interface PromoValidationResult {
  valid: boolean;
  promotion?: Promotion;
  error?: string;
}
