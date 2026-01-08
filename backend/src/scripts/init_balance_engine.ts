
import { pool } from '../config/database';

async function initBalanceEngine() {
    const client = await pool.connect();
    try {
        console.log('Starting Balance Engine Schema Initialization...');
        await client.query('BEGIN');

        // 1. Subscription Tier Type
        // Handle if type already exists
        const typeCheck = await client.query("SELECT 1 FROM pg_type WHERE typname = 'subscription_tier'");
        if (typeCheck.rows.length === 0) {
            await client.query("CREATE TYPE subscription_tier AS ENUM ('free', 'tier1', 'tier2', 'tier3')");
            console.log('Created subscription_tier ENUM');
        }

        // 2. Update Users Table
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free',
            ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(32) DEFAULT 'active'
        `);
        console.log('Updated users table');

        // 3. Monthly Usage Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS monthly_usage (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                month VARCHAR(7) NOT NULL, -- Format 'YYYY-MM'
                chapters_generated_total INT DEFAULT 0,
                chapters_premium INT DEFAULT 0,
                chapters_free_extra INT DEFAULT 0,
                updated_at TIMESTAMP DEFAULT now(),
                UNIQUE(user_id, month)
            )
        `);
        console.log('Created monthly_usage table');

        // 4. AI Usage Logs Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_usage_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id),
                tier subscription_tier,
                model_requested VARCHAR(128),
                model_used VARCHAR(128),
                cost_estimated NUMERIC(10, 6),
                tokens_in INT,
                tokens_out INT,
                success BOOLEAN,
                error_message TEXT,
                timestamp TIMESTAMP DEFAULT now()
            )
        `);
        console.log('Created ai_usage_logs table');

        await client.query('COMMIT');
        console.log('Balance Engine Schema Initialization Completed Successfully.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to initialize Balance Engine schema:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

initBalanceEngine();
