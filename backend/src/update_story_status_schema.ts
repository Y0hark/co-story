import { pool } from './db/pool';

async function updateSchema() {
    const client = await pool.connect();
    try {
        console.log('Starting schema update for Story Status...');
        await client.query('BEGIN');

        // Add status column if it doesn't exist
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stories' AND column_name='status') THEN 
                    ALTER TABLE stories ADD COLUMN status VARCHAR(32) DEFAULT 'in_progress';
                    CREATE INDEX idx_stories_status ON stories(status);
                END IF;
            END $$;
        `);

        await client.query('COMMIT');
        console.log('Schema update successful!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Schema update failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

updateSchema();
