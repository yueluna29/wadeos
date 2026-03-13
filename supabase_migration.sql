-- Add new columns to app_settings table
ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS sms_example_dialogue TEXT,
ADD COLUMN IF NOT EXISTS sms_instructions TEXT,
ADD COLUMN IF NOT EXISTS roleplay_instructions TEXT;

-- Verify the columns exist (Optional, just for checking)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'app_settings';
