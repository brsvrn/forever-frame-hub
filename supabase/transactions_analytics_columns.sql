-- ==============================================================================
-- MemoryWedding Transactions Table Analytics & Tracking Columns Migration
-- ==============================================================================

-- 1. Analytics & Order Flags
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS is_test_order BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS analytics_purchase_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS meta_purchase_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS google_ads_purchase_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS analytics_sent_at TIMESTAMPTZ;

-- 2. First-Touch Attribution Columns
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS first_utm_source TEXT,
ADD COLUMN IF NOT EXISTS first_utm_medium TEXT,
ADD COLUMN IF NOT EXISTS first_utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS first_utm_content TEXT,
ADD COLUMN IF NOT EXISTS first_utm_term TEXT;

-- 3. Last-Touch Attribution Columns
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS last_utm_source TEXT,
ADD COLUMN IF NOT EXISTS last_utm_medium TEXT,
ADD COLUMN IF NOT EXISTS last_utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS last_utm_content TEXT,
ADD COLUMN IF NOT EXISTS last_utm_term TEXT;

-- 4. Ad Click IDs & Navigation Referrers
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS gclid TEXT,
ADD COLUMN IF NOT EXISTS fbclid TEXT,
ADD COLUMN IF NOT EXISTS landing_page TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT;

-- 5. Indexes for fast lookup & analytics querying
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_oid ON transactions(merchant_oid);
CREATE INDEX IF NOT EXISTS idx_transactions_analytics_sent ON transactions(analytics_purchase_sent);
CREATE INDEX IF NOT EXISTS idx_transactions_status_created ON transactions(status, created_at);
