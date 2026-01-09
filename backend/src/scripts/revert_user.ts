import { pool } from '../db/pool';

async function revert() {
    try {
        const customerId = 'cus_TkqEj5KOKHWY3i';
        await pool.query(
            "UPDATE users SET subscription_status = 'free', subscription_tier = 'free' WHERE stripe_customer_id = $1",
            [customerId]
        );
        console.log('Reverted user to free.');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

revert();
