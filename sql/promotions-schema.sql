-- Promotions table for GVolts marketing campaigns
-- Run this in your Supabase SQL editor to create the promotions system

CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  promo_code TEXT UNIQUE,
  applicable_services TEXT[] DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  banner_image TEXT,
  terms TEXT,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Validations
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_uses CHECK (max_uses IS NULL OR current_uses <= max_uses)
);

-- Index for querying active promotions
CREATE INDEX idx_promotions_active ON promotions (is_active, start_date, end_date)
WHERE is_active = true;

-- Index for promo code lookups
CREATE INDEX idx_promotions_code ON promotions (promo_code)
WHERE promo_code IS NOT NULL;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_promotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER promotions_updated_at_trigger
BEFORE UPDATE ON promotions
FOR EACH ROW
EXECUTE FUNCTION update_promotions_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to active promotions
CREATE POLICY "Public read access to active promotions"
ON promotions
FOR SELECT
USING (is_active = true AND NOW() BETWEEN start_date AND end_date);

-- Policy: Allow authenticated users to read all promotions (for admin panel)
CREATE POLICY "Authenticated read all promotions"
ON promotions
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert/update/delete (for admin)
CREATE POLICY "Authenticated full access"
ON promotions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Function to increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE promotions
  SET current_uses = current_uses + 1
  WHERE id = promo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE promotions IS 'Marketing promotions and discount campaigns';
COMMENT ON COLUMN promotions.discount_type IS 'Type of discount: percentage or fixed amount';
COMMENT ON COLUMN promotions.discount_value IS 'Discount value (20 for 20% or fixed amount in currency)';
COMMENT ON COLUMN promotions.promo_code IS 'Optional promo code for customers to enter';
COMMENT ON COLUMN promotions.applicable_services IS 'Array of service slugs: fire-alarm, security, electricity';
COMMENT ON COLUMN promotions.max_uses IS 'Maximum number of times promo can be used (NULL for unlimited)';
COMMENT ON COLUMN promotions.current_uses IS 'Current number of times promo has been used';
