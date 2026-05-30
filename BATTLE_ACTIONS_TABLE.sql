-- Create battle_actions table for multiplayer action synchronization
CREATE TABLE IF NOT EXISTS public.battle_actions (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  ability_index INTEGER NOT NULL,
  dice_result INTEGER NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES duello_sessions(session_id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.battle_actions ENABLE ROW LEVEL SECURITY;

-- Allow all operations (same as duello_sessions)
CREATE POLICY "Allow all operations" ON public.battle_actions
  FOR ALL USING (true);

-- Create index for faster queries
CREATE INDEX idx_battle_actions_session ON public.battle_actions(session_id);
CREATE INDEX idx_battle_actions_timestamp ON public.battle_actions(timestamp);
