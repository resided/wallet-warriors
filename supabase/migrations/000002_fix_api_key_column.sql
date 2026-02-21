-- Fix api_key_encrypted column to allow nulls or set default
-- The column exists from previous schema but needs to be nullable for web UI registrations

-- Make api_key_encrypted nullable if it exists
ALTER TABLE fighters ALTER COLUMN api_key_encrypted DROP NOT NULL;

-- Add default empty string for api_provider
ALTER TABLE fighters ALTER COLUMN api_provider SET DEFAULT '';

-- Add default empty string for api_key_encrypted
ALTER TABLE fighters ALTER COLUMN api_key_encrypted SET DEFAULT '';
