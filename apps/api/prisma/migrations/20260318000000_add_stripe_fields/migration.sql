-- Migration: Add missing SaaS payment fields to tenants table
-- Safe: Both columns are nullable - no data loss risk

ALTER TABLE "tenants"
  ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT,
  ADD COLUMN IF NOT EXISTS "providerCustomerId" TEXT;

-- Add unique constraint only if column didn't already exist
-- (IF NOT EXISTS prevents duplicate constraint error)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tenants_stripeCustomerId_key'
  ) THEN
    ALTER TABLE "tenants" ADD CONSTRAINT "tenants_stripeCustomerId_key" UNIQUE ("stripeCustomerId");
  END IF;
END $$;
