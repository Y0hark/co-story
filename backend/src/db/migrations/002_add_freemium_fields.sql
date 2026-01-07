-- Migration: Add Freemium and Credit fields to users table

-- 1. Subscription Status
-- We use TEXT for simplicity, but could be ENUM ('free', 'pro', 'unlimited')
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(32) DEFAULT 'free';

-- 2. Credits Balance
-- Using NUMERIC for precision (matches user_credits tables if we consolidate later)
-- But wait, schema.sql showed `user_credits` table separately.
-- Let's stick to the plan: if `user_credits` exists, we should use it.
-- However, for simplicity and performance in the "check limits" query, it might be easier to have it on user.
-- Getting `user_credits` table from schema.sql:
-- CREATE TABLE IF NOT EXISTS user_credits (user_id ... balance_usd ...);

-- The user request was "Add credits and subscription_status to User schema".
-- So I will add them to `users` for direct access, or use the existing table.
-- Using the existing `user_credits` table is cleaner database design (normalization).
-- But `subscription_status` belongs on `users`.

-- So I will only add `subscription_status` to `users` here.
-- And ensure `user_credits` is initialized for users.

ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_balance NUMERIC(10, 4) DEFAULT 0.0000;
-- While keeping `user_credits` table might be better for history, the user prompt explicitly asked:
-- "Add credits and subscription_status to User schema"
-- So I will add `credits_balance` to `users` as a cached value or primary value.
-- This makes "SELECT * FROM users" give me everything I need for the UI.

-- Update existing users to have 'free' status and 0 credits
UPDATE users SET subscription_status = 'free' WHERE subscription_status IS NULL;
UPDATE users SET credits_balance = 0 WHERE credits_balance IS NULL;
