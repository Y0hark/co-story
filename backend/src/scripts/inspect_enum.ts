import { pool } from '../db/pool';

async function inspect() {
    try {
        // Check column type
        const colRes = await pool.query(`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'subscription_tier'
        `);
        console.log('Column Schema:', colRes.rows[0]);

        if (colRes.rows[0]?.udt_name) {
            const enumRes = await pool.query(`
                SELECT e.enumlabel
                FROM pg_enum e
                JOIN pg_type t ON e.enumtypid = t.oid
                WHERE t.typname = $1
            `, [colRes.rows[0].udt_name]);
            console.log('Enum Values:', enumRes.rows.map(r => r.enumlabel));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

inspect();
