import { pool } from '../db/pool';

async function simulate() {
    try {
        const customerId = 'cus_TkqEj5KOKHWY3i'; // User sam@gmail.com
        const dbStatus = 'active';
        console.log(`Simulating update for ${customerId} to status ${dbStatus}...`);

        const res = await pool.query(
            'UPDATE users SET subscription_status = $1, subscription_tier = $2 WHERE stripe_customer_id = $3',
            [dbStatus, dbStatus === 'active' ? 'pro' : 'free', customerId]
        );
        console.log(`Rows affected: ${res.rowCount}`);

        // Verify
        const check = await pool.query('SELECT email, subscription_status, subscription_tier FROM users WHERE stripe_customer_id = $1', [customerId]);
        console.log('User record:', check.rows[0]);

    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        await pool.end();
    }
}

simulate();
