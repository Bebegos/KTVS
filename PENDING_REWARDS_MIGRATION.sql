-- Migration: Add pending_rewards column to dinos table
-- Adds support for tracking level-up rewards (stat points and abilities) not yet spent

-- Add pending_rewards JSONB column
ALTER TABLE dinos
ADD COLUMN IF NOT EXISTS pending_rewards JSONB DEFAULT NULL;

-- Update ability_ids column to use the new abilityIds format
-- This migration assumes ability_ids was previously stored as a simple array
-- The mapDinoData() function handles transformation to camelCase

-- Create index for faster queries on dinos with pending rewards
CREATE INDEX IF NOT EXISTS idx_dinos_pending_rewards ON dinos (pending_rewards) WHERE pending_rewards IS NOT NULL;

-- Comment for clarity
COMMENT ON COLUMN dinos.pending_rewards IS 'JSONB object tracking unspent level-up rewards: {unspent_stat_points: number, pending_ability_ids: string[]}';
