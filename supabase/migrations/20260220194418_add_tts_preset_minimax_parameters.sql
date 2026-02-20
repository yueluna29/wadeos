/*
  # Add Minimax TTS Parameters

  1. Changes
    - Add `vol` column (volume, 0-10)
    - Add `pitch` column (pitch adjustment, -12 to 12)
    - Add `sample_rate` column (8000, 16000, 22050, 24000, 32000, 44100)
    - Add `bitrate` column (32000, 64000, 128000, 256000)
    - Add `format` column (mp3, pcm, flac, wav)
    - Add `channel` column (1 or 2)

  2. Notes
    - All columns nullable with default values
    - Compatible with Minimax T2A API v2
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tts_presets' AND column_name = 'vol'
  ) THEN
    ALTER TABLE tts_presets ADD COLUMN vol numeric(4,2) DEFAULT 1.0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tts_presets' AND column_name = 'pitch'
  ) THEN
    ALTER TABLE tts_presets ADD COLUMN pitch integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tts_presets' AND column_name = 'sample_rate'
  ) THEN
    ALTER TABLE tts_presets ADD COLUMN sample_rate integer DEFAULT 32000;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tts_presets' AND column_name = 'bitrate'
  ) THEN
    ALTER TABLE tts_presets ADD COLUMN bitrate integer DEFAULT 128000;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tts_presets' AND column_name = 'format'
  ) THEN
    ALTER TABLE tts_presets ADD COLUMN format text DEFAULT 'mp3';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tts_presets' AND column_name = 'channel'
  ) THEN
    ALTER TABLE tts_presets ADD COLUMN channel integer DEFAULT 1;
  END IF;
END $$;