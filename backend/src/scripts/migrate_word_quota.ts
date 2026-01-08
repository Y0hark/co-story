
import { pool } from '../db/pool';

async function migrate() {
    console.log("Starting Word Quota Schema Migration...");
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Add columns if they don't exist
        await client.query(`
            ALTER TABLE monthly_usage 
            ADD COLUMN IF NOT EXISTS words_generated INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS words_premium INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS words_free_extra INT DEFAULT 0;
        `);

        console.log("Added columns to monthly_usage.");

        await client.query('COMMIT');
        console.log("Migration successful.");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Migration failed:", e);
    } finally {
        client.release();
        process.exit(0);
    }
}

migrate();
