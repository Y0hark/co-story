
import { pool } from './db/pool';

const updateSchema = async () => {
    try {
        console.log("Adding banner_url column to users table...");
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS banner_url TEXT;
        `);
        console.log("Schema updated successfully!");
    } catch (err) {
        console.error("Failed to update schema:", err);
    } finally {
        await pool.end();
    }
};

updateSchema();
