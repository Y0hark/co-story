
import { pool } from '../db/pool';

const createTableQuery = `
CREATE TABLE IF NOT EXISTS story_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_story_chats_story ON story_chats(story_id, created_at);
`;

async function run() {
    try {
        console.log("Creating story_chats table...");
        await pool.query(createTableQuery);
        console.log("Table created successfully found.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating table:", err);
        process.exit(1);
    }
}

run();
