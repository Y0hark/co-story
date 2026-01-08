
import { pool } from '../db/pool';
import { subscriptionService } from '../services/subscriptionService';
import { balanceEngine } from '../services/balanceEngineService';
import { AppError } from '../services/aiService';

async function runVerification() {
    console.log("Starting Balance Engine Verification...");
    // We don't need a single client for everything if we want services to work normally.
    // Services use pool.

    let userId: string | null = null;
    let t3UserId: string | null = null;

    // We use a client for setup/teardown
    const client = await pool.connect();

    try {
        // 1. Create Test User (Free Tier)
        console.log("1. Creating Test User (Free)...");
        const userRes = await client.query(`
            INSERT INTO users (email, password_hash, display_name, subscription_status, subscription_tier)
            VALUES ('test_free_verif@example.com', 'hash', 'Test Free', 'free', 'free')
            RETURNING id
        `);
        userId = userRes.rows[0].id;

        // 2. Test Quota (Empty)
        console.log("2. Checking Usage (Should be 0)...");
        let usage = await subscriptionService.getUsage(userId!!);
        if (usage.usage.chapters_generated_total !== 0) throw new Error("Usage should be 0");

        console.log("2b. Checking Quota (Should pass)...");
        await subscriptionService.checkQuota(userId!!);


        // --- TEST 1: FREE TIER LIMITS ---
        console.log("1. Testing Free Tier Limits...");
        // Reset usage
        await client.query("DELETE FROM monthly_usage WHERE user_id = $1", [userId!]);

        // 1. Check Initial Quota (Should be free)
        let tier = await subscriptionService.checkQuota(userId!);
        if (tier !== 'free') throw new Error(`Expected free tier, got ${tier}`);

        // 2. Consume 1 Chapter equivalent (3000 words)
        // Free limit is 3000 words.
        await subscriptionService.incrementUsage(userId!, 3000, false);

        // 3. Check Quota again (Should fail if > 3000)
        // Actually limit is >= 3000? 
        // Code says: if (usage >= limit) error.
        // So 3000 usage should TRIGGER error on next check.
        try {
            await subscriptionService.checkQuota(userId!);
            throw new Error("Should have failed quota check for Free tier after 3000 words");
        } catch (e: any) {
            if (!e.message.includes("Monthly word generation limit reached")) throw e;
            console.log("-> Caught Expected Error:", e.message);
        }

        // --- TEST 2: TIER 3 LOGIC (Routing & Limits) ---
        console.log("2. Testing Tier 3 Routing & Limits...");
        await client.query("UPDATE users SET subscription_tier = 'tier3' WHERE id = $1", [userId!]);
        await client.query("DELETE FROM monthly_usage WHERE user_id = $1", [userId!]);

        // Scenario A: Premium Routing (Usage < 600,000 words)
        // Usage = 0
        let routing = balanceEngine.selectModel('tier3', { premiumCount: 0, freeExtraCount: 0 }, 'paid-model');
        if (routing.source !== 'paid_premium') throw new Error("Tier 3 should route to premium when under quota");

        // Scenario B: Premium Quota Exceeded (Usage = 600,000 words)
        // Fallback to Free
        routing = balanceEngine.selectModel('tier3', { premiumCount: 600000, freeExtraCount: 0 });
        if (routing.source !== 'free') throw new Error("Tier 3 should fallback to free when premium quota exceeded");

        // Scenario C: Total Limit Exceeded (900,000 words)
        // 600k premium + 300k free
        await subscriptionService.incrementUsage(userId!, 600000, true); // Max Premium
        await subscriptionService.incrementUsage(userId!, 300000, false); // Max Free

        try {
            await subscriptionService.checkQuota(userId!);
            throw new Error("Should have failed quota check for Tier 3 after 900k words");
        } catch (e: any) {
            if (!e.message.includes("Monthly word generation limit reached")) throw e;
            console.log("-> Caught Expected Error:", e.message);
        }

        // --- TEST 3: LIST LIMITS ---
        console.log("3. Testing List Limits (Free = 1)...");
        await client.query("UPDATE users SET subscription_tier = 'free' WHERE id = $1", [userId!]);
        // Create 1 list (mock)
        // Clean lists first
        await client.query("DELETE FROM reading_lists WHERE user_id = $1", [userId!]);
        await client.query("INSERT INTO reading_lists (user_id, name) VALUES ($1, 'List 1')", [userId!]);

        // Try check (Should be 1/1, limit reached?)
        // Limit is 1. Usage is 1.
        // checkListQuota checks BEFORE creation usually? 
        // Logic: if (count >= limit) throw.
        // So 1 >= 1 is TRUE. Throw.
        try {
            await subscriptionService.checkListQuota(userId!);
            throw new Error("Should have blocked creating 2nd list");
        } catch (e: any) {
            if (!e.message.includes("Custom category limit reached")) throw e;
            console.log("-> Caught Expected Error:", e.message);
        }

        console.log("Verification Passed!");

    } catch (e) {
        console.error("Verification Failed:", e);
        process.exit(1);
    } finally {
        console.log("Cleaning up...");
        if (userId) await client.query("DELETE FROM users WHERE id = $1", [userId]);
        if (t3UserId) await client.query("DELETE FROM users WHERE id = $1", [t3UserId]);
        client.release();
        // pool.end(); // Don't end pool as it might hang things if script continues? 
        // usage process.exit is better.
        process.exit(0);
    }
}

runVerification();
