-- Add 'variants_model' column to store the model used for each specific variant
ALTER TABLE messages_deep ADD COLUMN IF NOT EXISTS variants_model JSONB;
ALTER TABLE messages_roleplay ADD COLUMN IF NOT EXISTS variants_model JSONB;
ALTER TABLE messages_sms ADD COLUMN IF NOT EXISTS variants_model JSONB;
