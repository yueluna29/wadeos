-- Add 'model' column to messages tables to track which model generated the response
ALTER TABLE messages_deep ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE messages_roleplay ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE messages_sms ADD COLUMN IF NOT EXISTS model TEXT;
