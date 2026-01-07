
import { pool } from './src/db/pool';

async function checkColumns() {
    try {
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('Users columns:', res.rows.map(r => r.column_name));

        const res2 = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'chapters';
        `);
        console.log('Chapters columns:', res2.rows.map(r => r.column_name));

    } catch (e) {
        console.error(e);
    } finally {
        // pool.end() might hang if pool is used elsewhere, but for script it's fine
        process.exit(0);
    }
}

checkColumns();
