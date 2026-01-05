-- 13. World Building Items
CREATE TABLE IF NOT EXISTS world_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type VARCHAR(32) NOT NULL, -- 'character', 'location', 'event', 'item', 'other'
  description TEXT,
  attributes JSONB DEFAULT '{}', -- Flexible key-value pairs
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_world_items_story ON world_items(story_id);
CREATE INDEX IF NOT EXISTS idx_world_items_type ON world_items(type);
