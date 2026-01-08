import { pool } from '../db/pool';

async function migrate() {
    try {
        console.log('Starting migration...');

        // Add google_id column if it doesn't exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='google_id') THEN 
                    ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE; 
                END IF; 
            END $$;
        `);
        console.log('Added google_id column.');

        // Make password_hash nullable
        await pool.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`);
        console.log('Made password_hash nullable.');

        console.log('Migration successful.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
