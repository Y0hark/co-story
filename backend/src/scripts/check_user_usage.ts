
import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../db/pool';

async function checkUsage(email: string) {
    try {
        console.log(`Checking usage for ${email}...`);

        // 1. Get User ID
        const userRes = await pool.query('SELECT id, subscription_tier FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            console.error('User not found');
            return;
        }
        const user = userRes.rows[0];
        console.log(`User Found: ID=${user.id}, Tier=${user.subscription_tier}`);

        // 2. Get Monthly Usage
        const currentMonth = new Date().toISOString().slice(0, 7);
        const usageRes = await pool.query(
            'SELECT * FROM monthly_usage WHERE user_id = $1 AND month = $2',
            [user.id, currentMonth]
        );

        if (usageRes.rows.length === 0) {
            console.log('No usage found for this month.');
        } else {
            console.log('Monthly Usage:', usageRes.rows[0]);
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

checkUsage('sam1@gmail.com');
