import { pool } from '../db/pool';

async function checkUsers() {
    try {
        const res = await pool.query('SELECT id, email, stripe_customer_id, subscription_status, subscription_tier FROM users');
        console.log('Users found:', res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkUsers();
