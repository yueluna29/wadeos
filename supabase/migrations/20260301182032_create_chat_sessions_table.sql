/*
  # Create Chat Sessions Table

  ## Purpose
  Store all chat conversation sessions with their metadata including title, mode, timestamps, and user preferences.

  ## Tables Created
    - `chat_sessions`
      - `id` (text, primary key) - Unique session identifier
      - `mode` (text) - Chat mode: 'deep', 'sms', 'roleplay', or 'archive'
      - `title` (text) - Editable conversation title
      - `created_at` (bigint) - Unix timestamp when session was created
      - `updated_at` (bigint) - Unix timestamp of last update
      - `is_pinned` (boolean) - Whether session is pinned to top
      - `custom_llm_id` (text, nullable) - Reference to custom LLM preset
      - `custom_prompt` (text, nullable) - Custom system prompt override

  ## Security
    - Enable RLS on `chat_sessions` table
    - Add policy for public access (single-user app)

  ## Notes
    - Using bigint for timestamps to match frontend usage
    - Title is editable by user for better organization
    - Pinned sessions appear at the top of lists
*/

CREATE TABLE IF NOT EXISTS chat_sessions (
  id text PRIMARY KEY,
  mode text NOT NULL CHECK (mode IN ('deep', 'sms', 'roleplay', 'archive')),
  title text NOT NULL DEFAULT 'New Conversation',
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL,
  is_pinned boolean DEFAULT false,
  custom_llm_id text,
  custom_prompt text
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on chat_sessions"
  ON chat_sessions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);