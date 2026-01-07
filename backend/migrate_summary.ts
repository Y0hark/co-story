
import { pool } from './src/db/pool';

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if summary column exists in chapters
        const checkChapters = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'chapters' AND column_name = 'summary';
        `);

        if (checkChapters.rowCount === 0) {
            console.log('Adding summary to chapters...');
            await client.query(`ALTER TABLE chapters ADD COLUMN summary TEXT;`);
        } else {
            console.log('summary column already exists in chapters.');
        }

        // Check if summary column exists in stories
        const checkStories = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'stories' AND column_name = 'summary';
        `);

        if (checkStories.rowCount === 0) {
            console.log('Adding summary to stories...');
            await client.query(`ALTER TABLE stories ADD COLUMN summary TEXT;`);
        } else {
            console.log('summary column already exists in stories.');
        }

        await client.query('COMMIT');
        console.log('Migration successful.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}

migrate();
