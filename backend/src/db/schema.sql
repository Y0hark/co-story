-- 1. Users & Auth
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Projects (stories)
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  mode VARCHAR(32) NOT NULL, -- 'fiction', 'journal', 'legacy', 'roleplay'
  is_public BOOLEAN DEFAULT FALSE,
  visibility VARCHAR(32) DEFAULT 'private', -- 'private', 'link', 'public'
  share_token TEXT UNIQUE, -- for link-based sharing
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stories_user ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_visibility ON stories(visibility);

-- 3. Story Metadata (thèmes, filtres, params)
CREATE TABLE IF NOT EXISTS story_metadata (
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  theme VARCHAR(64), -- 'sci-fi', 'fantasy', 'romance', 'slice-of-life', etc.
  is_real BOOLEAN, -- true = vrai / journal, false = fictif
  purpose VARCHAR(64), -- 'therapeutic', 'legacy', 'community-read', 'roleplay'
  era VARCHAR(64), -- 'contemporary', 'future', 'historical', 'timeless'
  writing_style VARCHAR(64), -- 'light', 'serious', 'poetic', 'introspective', 'epic'
  pov VARCHAR(32), -- 'first', 'second', 'third', 'omniscient'
  PRIMARY KEY (story_id)
);

-- 4. Chapters
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_index INT NOT NULL,
  title TEXT,
  content TEXT, -- Markdown or plain text
  word_count INT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chapters_story ON chapters(story_id, chapter_index);

-- 5. AI Sessions (conversations IA per story)
CREATE TABLE IF NOT EXISTS ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  mode VARCHAR(32) NOT NULL, -- 'narrative-coach', 'therapeutic-coach', 'coauthor', 'structural'
  context_window TEXT, -- JSON stringified context (last N messages for continuity)
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_story ON ai_sessions(story_id);

-- 6. AI Messages (chat history)
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  role VARCHAR(16) NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  input_tokens INT,
  output_tokens INT,
  cost_usd NUMERIC(10, 4),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_session ON ai_messages(session_id, created_at);

-- 7. Tokens Usage (billing)
CREATE TABLE IF NOT EXISTS tokens_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type VARCHAR(32), -- 'ai-coach', 'image-gen', etc.
  model VARCHAR(128), -- 'claude-3.5-sonnet', 'gpt-4o', etc.
  input_tokens INT,
  output_tokens INT,
  cost_usd NUMERIC(10, 4),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tokens_user ON tokens_usage(user_id, created_at);

-- 8. User Credits (balance)
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_usd NUMERIC(10, 4) DEFAULT 0,
  lifetime_spent_usd NUMERIC(10, 4) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now()
);

-- 9. Social: Likes
CREATE TABLE IF NOT EXISTS story_likes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (user_id, story_id)
);

-- 10. Social: Comments
CREATE TABLE IF NOT EXISTS story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_story ON story_comments(story_id, created_at);

-- 11. Social: Follows
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- 12. Reading Lists
CREATE TABLE IF NOT EXISTS reading_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reading_list_items (
  list_id UUID NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (list_id, story_id)
);
