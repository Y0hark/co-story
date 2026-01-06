
import { pool } from './db/pool';

const updateSchema = async () => {
    try {
        console.log("Adding status column to chapters table...");
        await pool.query(`
            ALTER TABLE chapters 
            ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'draft';
        `);

        // rigorous update for existing records to ensure they have a status if null (though default handles new ones)
        await pool.query(`
            UPDATE chapters SET status = 'draft' WHERE status IS NULL;
        `);

        console.log("Schema updated successfully!");
    } catch (err) {
        console.error("Failed to update schema:", err);
    } finally {
        await pool.end();
    }
};

updateSchema();
