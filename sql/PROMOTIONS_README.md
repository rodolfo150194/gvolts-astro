# GVolts Promotions System

Complete Supabase-powered promotions system for managing marketing campaigns, discount codes, and special offers.

## Overview

The promotions system allows you to:
- Create and manage time-limited promotional campaigns
- Generate unique promo codes
- Target specific services (fire-alarm, security, electricity)
- Track usage and limit redemptions
- Display promotions dynamically on the website
- Offer percentage or fixed-amount discounts

## Setup Instructions

### 1. Database Setup

Run the SQL scripts in your Supabase SQL Editor in this order:

```sql
-- 1. Create the promotions table and functions
-- Copy and paste the entire contents of: promotions-schema.sql

-- 2. Insert sample promotions (optional, for testing)
-- Copy and paste the entire contents of: sample-promotions.sql
```

### 2. Verify Installation

After running the schema, verify the table was created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'promotions';
```

Check that Row Level Security is enabled:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'promotions';
```

### 3. Environment Variables

No additional environment variables needed - the system uses your existing `SUPABASE_URL` and `SUPABASE_KEY`.

## Database Schema

### Table: `promotions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Promotion title |
| `description` | TEXT | Detailed description |
| `discount_type` | TEXT | 'percentage' or 'fixed' |
| `discount_value` | NUMERIC | Discount amount (20 for 20% or fixed value) |
| `promo_code` | TEXT | Optional unique code (e.g., "FUEGO20") |
| `applicable_services` | TEXT[] | Services array: ['fire-alarm', 'security', 'electricity'] |
| `start_date` | TIMESTAMP | When promotion starts |
| `end_date` | TIMESTAMP | When promotion ends |
| `is_active` | BOOLEAN | Active flag |
| `banner_image` | TEXT | Image URL for promotion |
| `terms` | TEXT | Terms and conditions |
| `max_uses` | INTEGER | Maximum redemptions (NULL = unlimited) |
| `current_uses` | INTEGER | Current redemption count |

### Database Functions

**`increment_promo_usage(promo_id UUID)`**
- Increments the `current_uses` counter when a promo code is redeemed
- Used by the service layer to track usage

## Usage Examples

### Display Promotions on Home Page

Add the PromoSection component to any page:

```astro
---
// src/pages/index.astro
import PromoSection from "@/components/PromoSection.astro";
---

<Layout title="GVolts - Inicio">
  <Header />
  <Hero />

  <!-- Show up to 3 active promotions -->
  <PromoSection maxPromotions={3} />

  <Features />
  <Footer />
</Layout>
```

### Show Service-Specific Promotions

Filter promotions by service:

```astro
---
// src/pages/services/fire-alarm.astro
import PromoSection from "@/components/PromoSection.astro";
---

<Layout title="Alarmas Contra Incendio">
  <!-- Only show fire-alarm promotions -->
  <PromoSection
    service="fire-alarm"
    title="Ofertas Especiales en Alarmas"
    maxPromotions={2}
  />
</Layout>
```

### Add Sticky Banner

Show a banner for the top active promotion:

```astro
---
// src/layouts/Layout.astro
import PromoBanner from "@/components/PromoBanner.astro";
import { getActivePromotions } from "@/services/promotions";

const { data: promotions } = await getActivePromotions();
const topPromo = promotions?.[0];
---

<!DOCTYPE html>
<html>
  <head>...</head>
  <body>
    {topPromo && (
      <PromoBanner
        promotion={topPromo}
        position="top"
        dismissible={true}
      />
    )}

    <slot />
  </body>
</html>
```

### Validate Promo Code in Contact Form

Example client-side validation:

```typescript
// In your contact form component
import { actions } from 'astro:actions';

const form = document.getElementById('contact-form');
const promoInput = document.getElementById('promo-code');

promoInput.addEventListener('blur', async () => {
  const code = promoInput.value.trim();
  if (!code) return;

  try {
    const result = await actions.validatePromoCode({
      promoCode: code,
      service: 'fire-alarm' // optional
    });

    if (result.data?.valid) {
      // Show success message
      showPromoDiscount(result.data.promotion);
    }
  } catch (error) {
    // Show error message
    console.error('Invalid promo code:', error);
  }
});
```

## Component Reference

### PromoCard

Displays a single promotion with discount, timing, and usage info.

```astro
<PromoCard
  promotion={promotion}
  showDetails={true}
  className="custom-class"
/>
```

**Props:**
- `promotion` (Promotion) - Required promotion object
- `showDetails` (boolean) - Show terms link (default: true)
- `className` (string) - Additional CSS classes

### PromoBanner

Sticky banner for highlighting a single promotion.

```astro
<PromoBanner
  promotion={promotion}
  position="top"
  dismissible={true}
/>
```

**Props:**
- `promotion` (Promotion) - Required promotion object
- `position` ("top" | "bottom") - Banner position (default: "top")
- `dismissible` (boolean) - Allow users to close (default: true)

### PromoSection

Section component displaying multiple promotions in a grid.

```astro
<PromoSection
  title="Promociones Especiales"
  subtitle="Aprovecha nuestras ofertas"
  service="fire-alarm"
  maxPromotions={3}
  showViewAll={true}
/>
```

**Props:**
- `title` (string) - Section title
- `subtitle` (string) - Section description
- `service` (ServiceSlug) - Filter by service
- `maxPromotions` (number) - Limit displayed promotions
- `showViewAll` (boolean) - Show "view all" link (default: true)

## Actions API

### getActivePromotions

Get all currently active promotions.

```typescript
import { actions } from 'astro:actions';

const result = await actions.getActivePromotions({
  service: 'security' // optional filter
});

// result.data.promotions - array of Promotion objects
```

### validatePromoCode

Validate a promo code and get promotion details.

```typescript
import { actions } from 'astro:actions';

const result = await actions.validatePromoCode({
  promoCode: 'FUEGO20',
  service: 'fire-alarm' // optional
});

// result.data.valid - boolean
// result.data.promotion - Promotion object if valid
```

### getPromotionsForService

Get promotions for a specific service.

```typescript
import { actions } from 'astro:actions';

const result = await actions.getPromotionsForService({
  service: 'electricity'
});

// result.data.promotions - filtered array
```

## Service Functions

Direct access to promotion services (server-side only):

```typescript
import {
  getActivePromotions,
  validatePromoCode,
  incrementPromoUsage,
  formatDiscount,
  getDaysRemaining
} from '@/services/promotions';

// Get active promotions
const { success, data, error } = await getActivePromotions({ service: 'fire-alarm' });

// Validate promo code
const validation = await validatePromoCode('FUEGO20', 'fire-alarm');

// Increment usage (when customer uses code)
await incrementPromoUsage(promotionId);

// Helper functions
const discount = formatDiscount(promotion); // "20%" or "$5,000"
const days = getDaysRemaining(promotion.end_date); // 15
```

## Creating New Promotions

### Via SQL (Recommended for now)

```sql
INSERT INTO promotions (
  title,
  description,
  discount_type,
  discount_value,
  promo_code,
  applicable_services,
  start_date,
  end_date,
  is_active,
  banner_image,
  terms,
  max_uses
) VALUES (
  'Mi Nueva Promoción',
  'Descripción detallada de la oferta',
  'percentage', -- or 'fixed'
  25, -- 25% or $25
  'CODIGO25',
  ARRAY['fire-alarm', 'security'],
  NOW(),
  NOW() + INTERVAL '30 days',
  true,
  '/img/promos/mi-promo.webp',
  'Términos y condiciones aplicables',
  100 -- max uses, or NULL for unlimited
);
```

### Via Supabase Dashboard

1. Go to Table Editor → `promotions` → Insert row
2. Fill in the fields:
   - Choose `percentage` or `fixed` for discount_type
   - Set discount_value (20 for 20%, or fixed amount)
   - Add services array: `{"fire-alarm","security"}`
   - Set dates in ISO format: `2024-12-19T00:00:00Z`
   - Upload banner image to Storage first, then add URL

## Image Guidelines

### Banner Images

Create promotion banners following these specs:

**Dimensions:**
- Recommended: 1200x600px (2:1 ratio)
- Minimum: 800x400px

**Format:**
- WebP preferred (smaller file size)
- PNG/JPG as fallback

**Optimization:**
- Keep under 150KB
- Use online tools: [Squoosh](https://squoosh.app)

**Upload to:**
```
public/img/promos/
├── fire-alarm-promo.webp
├── security-package.webp
├── electrical-promo.webp
└── mega-deal.webp
```

**Reference in database:**
```sql
banner_image = '/img/promos/fire-alarm-promo.webp'
```

## Querying Promotions

### Active Promotions Only

```sql
SELECT * FROM promotions
WHERE is_active = true
  AND NOW() BETWEEN start_date AND end_date
ORDER BY end_date ASC;
```

### Promotions by Service

```sql
SELECT * FROM promotions
WHERE is_active = true
  AND NOW() BETWEEN start_date AND end_date
  AND 'fire-alarm' = ANY(applicable_services);
```

### Usage Statistics

```sql
SELECT
  title,
  promo_code,
  current_uses,
  max_uses,
  CASE
    WHEN max_uses IS NULL THEN 'Unlimited'
    ELSE CONCAT(ROUND(current_uses::numeric / max_uses * 100, 1), '%')
  END as usage_percentage
FROM promotions
WHERE promo_code IS NOT NULL
ORDER BY current_uses DESC;
```

### Expiring Soon

```sql
SELECT
  title,
  promo_code,
  end_date,
  end_date - NOW() as time_remaining
FROM promotions
WHERE is_active = true
  AND NOW() BETWEEN start_date AND end_date
  AND end_date < NOW() + INTERVAL '7 days'
ORDER BY end_date ASC;
```

## Best Practices

### Promotion Strategy

1. **Limited Time** - Use urgency (15-30 day windows)
2. **Clear Value** - Make discount obvious (20% OFF, $5,000 OFF)
3. **Targeted** - Service-specific promos convert better
4. **Exclusive Codes** - Make customers feel special
5. **Track Usage** - Set max_uses to create scarcity

### Discount Types

**Use percentage when:**
- Discount applies to variable pricing
- You want flexibility
- Common in your industry (10%, 20%, 25%)

**Use fixed when:**
- You have package deals
- Want to control exact discount
- Large projects ($5,000 OFF, $10,000 OFF)

### Promo Code Naming

Good promo code patterns:
- `FUEGO20` - Service + discount
- `GVOLTS25` - Brand + discount
- `VERANO2024` - Season + year
- `COMBO8K` - Type + value
- `VIP30` - Exclusivity + discount

Avoid:
- Codes longer than 12 characters
- Confusing characters (0 vs O, 1 vs l)
- Profanity or offensive terms

### Banner Placement

**Top Banner** (PromoBanner)
- Highest visibility
- Best for time-sensitive offers
- Can be dismissed
- Auto-hides after dismissal

**Section** (PromoSection)
- Multiple promotions
- Better for browsing
- Less intrusive
- Good for homepage

**In-Context**
- Service pages show relevant promos
- Contact form shows applicable codes
- Increases conversion

## Troubleshooting

### Promotions Not Showing

1. Check dates:
```sql
SELECT title, start_date, end_date, NOW()
FROM promotions
WHERE id = 'your-promo-id';
```

2. Verify is_active flag:
```sql
UPDATE promotions SET is_active = true WHERE id = 'your-promo-id';
```

3. Check RLS policies (should allow public SELECT for active promos)

### Promo Code Not Validating

1. Check code spelling (case-insensitive)
2. Verify service match
3. Check max_uses vs current_uses
4. Confirm dates are valid

### Banner Not Appearing

1. Clear localStorage: `localStorage.clear()`
2. Check component is imported in layout
3. Verify promotion exists and is active

## Future Enhancements

Potential additions to the system:

1. **Admin Dashboard** - UI for managing promotions
2. **Email Integration** - Send promo codes via Resend
3. **Analytics** - Track conversion rates
4. **A/B Testing** - Test different discount amounts
5. **Subscriber-Only Promos** - Link to newsletter table
6. **Tiered Discounts** - Different levels based on order value
7. **Referral Codes** - Track customer referrals

## Support

For issues or questions:
- Check Supabase logs for database errors
- Review browser console for client-side errors
- Verify RLS policies allow public access to active promotions

## License

Part of the GVolts Astro project.
