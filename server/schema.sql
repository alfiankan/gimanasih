-- D1 Database Schema for Gimanasih / bitbrain

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Google User ID
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT PRIMARY KEY,
  xp INTEGER DEFAULT 0,
  unlocked_badges TEXT, -- JSON array of badge IDs (e.g. '["bloom_master", "raft_master"]')
  completed_lessons TEXT, -- JSON array of lesson IDs
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
