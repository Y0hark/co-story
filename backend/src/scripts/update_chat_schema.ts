
import { pool } from '../db/pool';

const updateSchemaQuery = `
DO $$
BEGIN
    -- Add chat_summary to stories if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'stories' AND column_name = 'chat_summary'
    ) THEN
        ALTER TABLE stories ADD COLUMN chat_summary TEXT;
    END IF;

    -- Add is_summarized to story_chats if it doesn't exist
    -- Note: We created story_chats separately, so we modify it here.
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'story_chats'
    ) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'story_chats' AND column_name = 'is_summarized'
        ) THEN
            ALTER TABLE story_chats ADD COLUMN is_summarized BOOLEAN DEFAULT FALSE;
        END IF;
    END IF;
END $$;
`;

async function run() {
    try {
        console.log("Updating schema for chat summarization...");
        await pool.query(updateSchemaQuery);
        console.log("Schema updated successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error updating schema:", err);
        process.exit(1);
    }
}

run();
