import { pool } from './db/pool';

async function runMigration() {
    try {
        console.log('Starting Social & Progress migration...');

        // 1. Story Likes (Ensure exists)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS story_likes (
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT now(),
                PRIMARY KEY (user_id, story_id)
            );
        `);
        console.log('Checked story_likes table.');

        // 2. Chapter Likes
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chapter_likes (
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT now(),
                PRIMARY KEY (user_id, chapter_id)
            );
        `);
        console.log('Created chapter_likes table.');

        // 3. Read Chapters (Individual chapter progress)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS read_chapters (
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
                read_at TIMESTAMP DEFAULT now(),
                PRIMARY KEY (user_id, chapter_id)
            );
        `);
        console.log('Created read_chapters table.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
