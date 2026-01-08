
import { pool } from '../db/pool';

async function listUsers() {
    const client = await pool.connect();
    try {
        console.log('Listing all users:');
        const res = await client.query('SELECT id, email, subscription_tier FROM users');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        process.exit(0);
    }
}

listUsers();
