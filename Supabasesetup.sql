--  SUPABASE DATABASE SETUP

-- 1. Sensor readings table
CREATE TABLE sensor_readings (
  id         BIGSERIAL PRIMARY KEY,
  temp       FLOAT     NOT NULL,
  hum        FLOAT     NOT NULL,
  air        INTEGER   NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast time-range queries
CREATE INDEX idx_sensor_created ON sensor_readings(created_at DESC);

-- 2. Thresholds table (single row)
CREATE TABLE thresholds (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  temp_limit FLOAT   DEFAULT 30.0,
  hum_limit  FLOAT   DEFAULT 75.0,
  air_limit  INTEGER DEFAULT 500,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default threshold row insert karo
INSERT INTO thresholds (id, temp_limit, hum_limit, air_limit)
VALUES (1, 30.0, 75.0, 500)
ON CONFLICT (id) DO NOTHING;

-- 3. Alerts table
CREATE TABLE alerts (
  id         BIGSERIAL PRIMARY KEY,
  type       TEXT    NOT NULL,  -- 'temp', 'hum', 'air'
  value      FLOAT   NOT NULL,
  alert_limit FLOAT   NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast fetch
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);


--  RLS (Row Level Security) — Public read allow karo

ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE thresholds      ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts          ENABLE ROW LEVEL SECURITY;

-- Service key se sab kuch access hoga (backend)
-- Anonymous read allow karo (dashboard)
CREATE POLICY "Allow public read" ON sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON thresholds      FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON alerts          FOR SELECT USING (true);
