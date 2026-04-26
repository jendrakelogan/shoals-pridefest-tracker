-- ============================================================
--  Shoals PrideFest 2026 — Supabase Database Setup
--  Run this entire script in your Supabase SQL Editor
-- ============================================================

-- 1. Categories table
--    Each subcommittee can create as many categories as they need
CREATE TABLE IF NOT EXISTS categories (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subcommittee_id  text NOT NULL,
  name             text NOT NULL,
  created_at       timestamptz DEFAULT now()
);

-- 2. Tasks table
--    Each category can have unlimited tasks
CREATE TABLE IF NOT EXISTS tasks (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id  uuid REFERENCES categories(id) ON DELETE CASCADE,
  description  text DEFAULT '',
  lead         text DEFAULT '',
  status       text DEFAULT 'Not Started' CHECK (status IN ('Not Started','In Progress','Done')),
  progress     text DEFAULT '',
  created_at   timestamptz DEFAULT now()
);

-- 3. Enable Row Level Security (keeps data safe)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks      ENABLE ROW LEVEL SECURITY;

-- 4. Allow full public access (the app handles auth via passcodes)
CREATE POLICY "Public read categories"  ON categories FOR SELECT USING (true);
CREATE POLICY "Public insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Public delete categories" ON categories FOR DELETE USING (true);

CREATE POLICY "Public read tasks"   ON tasks FOR SELECT USING (true);
CREATE POLICY "Public insert tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Public delete tasks" ON tasks FOR DELETE USING (true);

-- Done! Your database is ready.
