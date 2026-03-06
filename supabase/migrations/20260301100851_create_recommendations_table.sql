/*
  # Create Recommendations Table

  1. New Tables
    - `recommendations`
      - `id` (text, primary key) - Unique identifier for each recommendation
      - `type` (text) - Type of recommendation: 'book', 'movie', or 'music'
      - `title` (text) - Title of the recommended item
      - `creator` (text, nullable) - Author, director, or artist name
      - `release_date` (text, nullable) - Release date or year
      - `synopsis` (text, nullable) - Brief description or synopsis
      - `comment` (text) - Wade's comment about the recommendation
      - `cover_url` (text, nullable) - URL to cover image
      - `luna_review` (text, nullable) - Luna's review text
      - `luna_rating` (integer, nullable) - Luna's rating (1-5)
      - `wade_reply` (text, nullable) - Wade's reply to Luna's review
      - `created_at` (timestamptz) - Timestamp when recommendation was created

  2. Security
    - Enable RLS on `recommendations` table
    - Add policy for authenticated users to read all recommendations
    - Add policy for authenticated users to create recommendations
    - Add policy for authenticated users to update recommendations
    - Add policy for authenticated users to delete recommendations
*/

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('book', 'movie', 'music')),
  title text NOT NULL,
  creator text,
  release_date text,
  synopsis text,
  comment text NOT NULL DEFAULT '',
  cover_url text,
  luna_review text,
  luna_rating integer CHECK (luna_rating >= 1 AND luna_rating <= 5),
  wade_reply text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Policies for recommendations table
CREATE POLICY "Anyone can view recommendations"
  ON recommendations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete recommendations"
  ON recommendations FOR DELETE
  TO authenticated
  USING (true);