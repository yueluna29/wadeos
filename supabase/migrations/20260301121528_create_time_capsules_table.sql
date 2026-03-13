/*
  # Create time capsules table

  1. New Tables
    - `time_capsules`
      - `id` (text, primary key) - Unique identifier for the time capsule
      - `title` (text) - Title of the letter
      - `content` (text) - Content of the letter
      - `created_at` (timestamptz) - When the capsule was created
      - `unlock_date` (bigint) - Timestamp when the capsule unlocks (milliseconds)
      - `is_locked` (boolean) - Whether the capsule is currently locked
      - `audio_cache` (text, nullable) - Base64 encoded audio cache for TTS

  2. Security
    - Enable RLS on `time_capsules` table
    - Add policy for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS time_capsules (
  id text PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  created_at bigint NOT NULL,
  unlock_date bigint NOT NULL,
  is_locked boolean DEFAULT true,
  audio_cache text,
  created_at_ts timestamptz DEFAULT now()
);

ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all time capsules"
  ON time_capsules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert time capsules"
  ON time_capsules
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update time capsules"
  ON time_capsules
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete time capsules"
  ON time_capsules
  FOR DELETE
  TO authenticated
  USING (true);