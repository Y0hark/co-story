
console.log('Script started...');
import { pool } from '../db/pool';

const USER_ID = 'f67aa6fe-f49c-4f81-ae9e-0df4461e3385'; // sam1@gmail.com

async function checkUsage() {
    const client = await pool.connect();
    try {
        console.log('--- START DEBUG ---');
        console.log('Checking usage for user:', USER_ID);

        const now = new Date();
        console.log('Server Time:', now.toISOString());
        const currentMonth = now.toISOString().slice(0, 7);
        console.log('Calculated Current Month:', currentMonth);

        // Check Monthly Usage for ALL months
        const usageRes = await client.query('SELECT * FROM monthly_usage WHERE user_id = $1', [USER_ID]);
        console.log('--------------------------------------------------');
        console.log('ALL Monthly Usage Records:', JSON.stringify(usageRes.rows, null, 2));
        console.log('--------------------------------------------------');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        console.log('--- END DEBUG ---');
        process.exit(0);
    }
}

checkUsage();
