-- ============================================================
-- Pocket Fund - Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Single key-value table that stores all app data
-- This mirrors the app's existing storage pattern for zero-refactor migration
CREATE TABLE IF NOT EXISTS app_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow full access via anon key (internal tool, custom auth)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on app_data"
  ON app_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_data_updated ON app_data(updated_at DESC);

-- Done! The app will auto-seed employee data on first load.
