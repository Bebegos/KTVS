-- Dino-RP Web Game — Supabase SQL Setup
-- Supabase SQL Editor'de bu komutları çalıştır

-- 0. PROFILES tablosu (kullanıcı profilleri)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_access" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- 1. DINOS tablosu (karakter yönetimi)
CREATE TABLE IF NOT EXISTS dinos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_code TEXT,
  name TEXT NOT NULL,
  element TEXT,
  passive TEXT,
  max_hp INT NOT NULL DEFAULT 30,
  atk INT NOT NULL DEFAULT 5,
  def INT NOT NULL DEFAULT 5,
  spd INT NOT NULL DEFAULT 5,
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  abilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_dinos_family_code ON dinos(family_code);

-- Row Level Security
ALTER TABLE dinos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dinos_access" ON dinos FOR ALL USING (true) WITH CHECK (true);

-- 2. MATCHES tablosu (savaş günlüğü)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_code TEXT NOT NULL,
  owner_id UUID,
  winner_dino_id UUID REFERENCES dinos(id),
  loser_dino_id UUID REFERENCES dinos(id),
  xp_awarded INT NOT NULL DEFAULT 0,
  rounds INT,
  log JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_matches_family_code ON matches(family_code);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);

-- Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_access" ON matches FOR ALL USING (true) WITH CHECK (true);

-- 3. BATTLES tablosu (online düello altyapısı — şimdilik boş, gelecek için)
CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  family_code TEXT,
  owner_id UUID,
  player1_dino_id UUID REFERENCES dinos(id),
  player2_dino_id UUID REFERENCES dinos(id),
  state JSONB NOT NULL,
  turn TEXT,
  status TEXT DEFAULT 'waiting',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_battles_room_code ON battles(room_code);

-- Row Level Security
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "battles_access" ON battles FOR ALL USING (true) WITH CHECK (true);

-- Realtime yayını (online mod için)
ALTER PUBLICATION supabase_realtime ADD TABLE battles;

-- Tamamlandı!
-- Şimdi frontend'i .env dosyasına koyup deploy edebilirsin.
