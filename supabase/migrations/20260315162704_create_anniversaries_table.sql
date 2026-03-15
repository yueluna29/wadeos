/*
  # Create anniversaries table

  1. New Tables
    - `anniversaries`
      - `id` (text, primary key)
      - `date` (text) - Anniversary date in YYYY-MM-DD format
      - `title` (text) - Name of the anniversary
      - `icon` (text) - Emoji icon for the anniversary
      - `is_initial` (boolean) - Whether this is the initial anniversary for counting
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `anniversaries` table
    - Add policy for authenticated users to read anniversaries
    - Add policy for authenticated users to insert anniversaries
    - Add policy for authenticated users to update anniversaries
    - Add policy for authenticated users to delete anniversaries

  3. Initial Data
    - Insert the two existing anniversaries
    - Mark 2024-08-21 as the initial anniversary
*/

CREATE TABLE IF NOT EXISTS anniversaries (
  id text PRIMARY KEY,
  date text NOT NULL,
  title text NOT NULL,
  icon text NOT NULL,
  is_initial boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE anniversaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read anniversaries"
  ON anniversaries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert anniversaries"
  ON anniversaries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update anniversaries"
  ON anniversaries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete anniversaries"
  ON anniversaries
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert initial anniversaries
INSERT INTO anniversaries (id, date, title, icon, is_initial)
VALUES 
  ('initial-2024-08-21', '2024-08-21', '初始纪念日', '🖤', true),
  ('proposal-2025-08-23', '2025-08-23', '求婚纪念日', '💍', false)
ON CONFLICT (id) DO NOTHING;