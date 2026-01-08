import { pool } from '../db/pool';

async function migrate() {
    try {
        console.log('Starting migration for Stripe...');

        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='stripe_customer_id') THEN 
                    ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255); 
                END IF; 
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='subscription_status') THEN 
                    ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'free'; 
                END IF;

                -- If subscription_tier doesn't exist, it might have been created by previous logic, but let's ensure it exists
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='subscription_tier') THEN 
                    ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free'; 
                END IF;
            END $$;
        `);
        console.log('Added stripe columns.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
