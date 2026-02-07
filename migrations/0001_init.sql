CREATE TABLE IF NOT EXISTS vtt (
  id TEXT NOT NULL,
  start_ms INTEGER NOT NULL,
  end_ms INTEGER NOT NULL,
  transcript TEXT NOT NULL,
  PRIMARY KEY (id, start_ms)
);

CREATE TABLE IF NOT EXISTS chapters (
  episode_id TEXT NOT NULL,
  start_ms INTEGER NOT NULL,
  title TEXT NOT NULL,
  PRIMARY KEY (episode_id, start_ms)
);

CREATE TABLE IF NOT EXISTS speaker (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS episode_speaker_map (
  episode_id TEXT NOT NULL,
  speaker_id INTEGER NOT NULL,
  PRIMARY KEY (episode_id, speaker_id),
  FOREIGN KEY (speaker_id) REFERENCES speaker(id)
);

CREATE TABLE IF NOT EXISTS subscription (
  endpoint TEXT PRIMARY KEY,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vtt_id_start ON vtt (id, start_ms);
CREATE INDEX IF NOT EXISTS idx_chapters_episode_start ON chapters (episode_id, start_ms);
CREATE INDEX IF NOT EXISTS idx_episode_speaker_map_speaker ON episode_speaker_map (speaker_id);
