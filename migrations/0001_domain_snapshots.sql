CREATE TABLE IF NOT EXISTS domain_snapshots (
  snapshot_key TEXT PRIMARY KEY,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
