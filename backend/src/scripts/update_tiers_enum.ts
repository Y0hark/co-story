import { pool } from '../db/pool';

async function updateEnum() {
    try {
        console.log('Updating subscription_tier enum...');

        const tiers = ['scribe', 'storyteller', 'architect'];

        for (const tier of tiers) {
            try {
                await pool.query(`ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS '${tier}'`);
                console.log(`Added value: ${tier}`);
            } catch (e: any) {
                // Ignore if it already exists (Postgres < 12 doesn't support IF NOT EXISTS for enum values nicely in all versions, 
                // but newer ones do. If it fails due to existing, we catch it).
                if (e.code === '42710') { // duplicate_object
                    console.log(`Value ${tier} already exists.`);
                } else {
                    throw e;
                }
            }
        }

        console.log('Enum update complete.');
    } catch (err) {
        console.error('Error updating enum:', err);
    } finally {
        await pool.end();
    }
}

updateEnum();
