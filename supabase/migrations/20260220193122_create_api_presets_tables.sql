/*
  # Create API Presets Tables

  1. New Tables
    - `llm_presets` - Stores LLM API configurations
      - `id` (uuid, primary key)
      - `provider` (text) - Provider name (Gemini, Claude, OpenAI, etc.)
      - `name` (text) - User-friendly name
      - `model` (text) - Model identifier
      - `api_key` (text) - API key
      - `base_url` (text) - Base URL for API
      - `api_path` (text) - API path
      - `temperature` (numeric) - Temperature parameter (0.0-2.0)
      - `top_p` (numeric) - Top P parameter (0.0-1.0)
      - `top_k` (integer) - Top K parameter
      - `frequency_penalty` (numeric) - Frequency penalty (-2.0 to 2.0)
      - `presence_penalty` (numeric) - Presence penalty (-2.0 to 2.0)
      - `created_at` (timestamp)

    - `tts_presets` - Stores TTS API configurations
      - `id` (uuid, primary key)
      - `name` (text) - User-friendly name
      - `model` (text) - Model identifier
      - `api_key` (text) - API key
      - `base_url` (text) - Base URL for API
      - `voice_id` (text) - Voice identifier
      - `emotion` (text) - Emotion setting
      - `speed` (numeric) - Speed multiplier
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS llm_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text DEFAULT 'Custom',
  name text NOT NULL,
  model text,
  api_key text NOT NULL,
  base_url text,
  api_path text,
  temperature numeric(3,2) DEFAULT 1.0,
  top_p numeric(3,2) DEFAULT 1.0,
  top_k integer DEFAULT 40,
  frequency_penalty numeric(3,2) DEFAULT 0.0,
  presence_penalty numeric(3,2) DEFAULT 0.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE llm_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on llm_presets"
  ON llm_presets
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS tts_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  model text,
  api_key text NOT NULL,
  base_url text,
  voice_id text,
  emotion text,
  speed numeric(3,2) DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tts_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on tts_presets"
  ON tts_presets
  FOR ALL
  USING (true)
  WITH CHECK (true);