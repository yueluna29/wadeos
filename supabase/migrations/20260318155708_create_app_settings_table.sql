/*
  # Create app_settings table with full Wade & Luna persona fields

  1. New Tables
    - `app_settings`
      - `id` (integer, primary key) - singleton row (id=1)
      - `system_instruction` (text) - core jailbreak / system prompt
      - `wade_personality` (text) - Wade's character card
      - `wade_single_examples` (text) - single sentence examples
      - `wade_avatar` (text) - Wade's avatar URL
      - `example_dialogue` (text) - general dialogue examples
      - `sms_example_dialogue` (text) - SMS mode dialogue examples
      - `sms_instructions` (text) - SMS mode instructions
      - `roleplay_instructions` (text) - roleplay mode instructions
      - `wade_diary_personality` (text) - Wade's diary persona
      - `wade_height` (text) - Wade's height
      - `wade_appearance` (text) - Wade's appearance description
      - `wade_clothing` (text) - Wade's clothing description
      - `wade_likes` (text) - things Wade likes
      - `wade_dislikes` (text) - things Wade dislikes
      - `wade_hobbies` (text) - Wade's hobbies
      - `luna_info` (text) - Luna's general info
      - `luna_avatar` (text) - Luna's avatar URL
      - `luna_birthday` (text) - Luna's birthday
      - `luna_mbti` (text) - Luna's MBTI type
      - `luna_height` (text) - Luna's height
      - `luna_hobbies` (text) - Luna's hobbies
      - `luna_likes` (text) - things Luna likes
      - `luna_dislikes` (text) - things Luna dislikes
      - `luna_clothing` (text) - Luna's clothing style
      - `luna_appearance` (text) - Luna's appearance description
      - `luna_personality` (text) - Luna's personality and bio
      - `active_llm_id` (uuid) - active LLM preset ID
      - `active_tts_id` (uuid) - active TTS preset ID
      - `home_llm_id` (uuid) - home screen LLM preset ID
      - `custom_theme` (jsonb) - custom theme configuration
      - `updated_at` (timestamptz) - last update timestamp

  2. Security
    - Enable RLS on `app_settings` table
    - Add policies for authenticated users to read and update
*/

CREATE TABLE IF NOT EXISTS app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  system_instruction text DEFAULT '',
  wade_personality text DEFAULT '',
  wade_single_examples text DEFAULT '',
  wade_avatar text DEFAULT '',
  example_dialogue text DEFAULT '',
  sms_example_dialogue text DEFAULT '',
  sms_instructions text DEFAULT '',
  roleplay_instructions text DEFAULT '',
  wade_diary_personality text DEFAULT '',
  wade_height text DEFAULT '',
  wade_appearance text DEFAULT '',
  wade_clothing text DEFAULT '',
  wade_likes text DEFAULT '',
  wade_dislikes text DEFAULT '',
  wade_hobbies text DEFAULT '',
  luna_info text DEFAULT '',
  luna_avatar text DEFAULT '',
  luna_birthday text DEFAULT '',
  luna_mbti text DEFAULT '',
  luna_height text DEFAULT '',
  luna_hobbies text DEFAULT '',
  luna_likes text DEFAULT '',
  luna_dislikes text DEFAULT '',
  luna_clothing text DEFAULT '',
  luna_appearance text DEFAULT '',
  luna_personality text DEFAULT '',
  active_llm_id uuid,
  active_tts_id uuid,
  home_llm_id uuid,
  custom_theme jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow anon to read settings"
  ON app_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to update settings"
  ON app_settings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to insert settings"
  ON app_settings FOR INSERT
  TO anon
  WITH CHECK (true);