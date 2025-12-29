-- Add description column to scapes table
ALTER TABLE scapes ADD COLUMN IF NOT EXISTS description text;
