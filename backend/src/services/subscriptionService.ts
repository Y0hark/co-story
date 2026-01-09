
import { pool } from '../db/pool';
import { AppError } from './aiService';

export interface MonthlyUsage {
    chapters_generated_total: number;
    words_generated: number;
    words_premium: number;
    words_free_extra: number;
    chapters_premium: number;     // Legacy
    chapters_free_extra: number;  // Legacy
}

export type UserTier = 'free' | 'scribe' | 'storyteller' | 'architect' | 'pro' | 'tier1' | 'tier2' | 'tier3';

export class SubscriptionService {

    private limits: Record<string, { wordLimit: number, listLimit: number }> = {
        'free': { wordLimit: 3000, listLimit: 1 },
        'scribe': { wordLimit: 90000, listLimit: 3 },
        'storyteller': { wordLimit: 300000, listLimit: 9999 },
        'architect': { wordLimit: 900000, listLimit: 9999 },
        // Legacy Tiers
        'pro': { wordLimit: 300000, listLimit: 9999 },
        'tier1': { wordLimit: 90000, listLimit: 5 },
        'tier2': { wordLimit: 300000, listLimit: 20 },
        'tier3': { wordLimit: 900000, listLimit: 9999 }
    };

    /**
     * Checks if a user has sufficient quota for generating a chapter.
     */
    public async checkQuota(userId: string): Promise<UserTier> {
        const client = await pool.connect();
        try {
            // 1. Get User Tier
            const userRes = await client.query('SELECT subscription_tier FROM users WHERE id = $1', [userId]);
            if (userRes.rows.length === 0) throw new AppError('User not found', 404);
            const tier: UserTier = userRes.rows[0].subscription_tier || 'free';

            // 2. Get Usage for current month
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const usageRes = await client.query(
                'SELECT * FROM monthly_usage WHERE user_id = $1 AND month = $2',
                [userId, currentMonth]
            );

            let usage: MonthlyUsage = {
                chapters_generated_total: 0,
                words_generated: 0,
                words_premium: 0,
                words_free_extra: 0,
                chapters_premium: 0,
                chapters_free_extra: 0
            };

            if (usageRes.rows.length > 0) {
                usage = usageRes.rows[0];
            }

            // 3. Check Limits
            const limit = this.limits[tier];

            // Calculate days until reset (1st of next month)
            const now = new Date();
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            // Tier 3 Special Logic: 
            // - Premium Quota: 600,000 words (200 chapters)
            // - Free Extra Quota: 300,000 words (100 chapters from free models)
            // Total = 900,000.
            if (tier === 'tier3') {
                const totalAllowed = 900000;
                if (usage.words_generated >= totalAllowed) {
                    throw new AppError(`Monthly word generation limit reached (900k words). Resets in ${daysUntilReset} day(s).`, 403);
                }
            } else {
                if (usage.words_generated >= limit.wordLimit) {
                    throw new AppError(`Monthly word generation limit reached for ${tier} tier (${usage.words_generated}/${limit.wordLimit}). Resets in ${daysUntilReset} day(s). Upgrade to create more.`, 403);
                }
            }

            return tier;
        } finally {
            client.release();
        }
    }

    /**
     * Checks if a user can create more reading lists (categories).
     */
    public async checkListQuota(userId: string): Promise<void> {
        const client = await pool.connect();
        try {
            // 1. Get User Tier
            const userRes = await client.query('SELECT subscription_tier FROM users WHERE id = $1', [userId]);
            if (userRes.rows.length === 0) throw new AppError('User not found', 404);
            const tier: UserTier = userRes.rows[0].subscription_tier || 'free';

            // 2. Count existing custom lists
            const countRes = await client.query(
                "SELECT COUNT(*) FROM reading_lists WHERE user_id = $1 AND name != 'Saved'",
                [userId]
            );
            const count = parseInt(countRes.rows[0].count);

            // 3. Check Limit
            const limit = this.limits[tier].listLimit;
            if (count >= limit) {
                throw new AppError(`Custom category limit reached for ${tier} tier (${count}/${limit}). Upgrade to create more.`, 403);
            }
        } finally {
            client.release();
        }
    }

    /**
     * Records usage after a successful generation.
     */
    /**
     * Records usage after a successful generation.
     */
    public async incrementUsage(userId: string, wordCount: number, isPremiumModel: boolean) {
        const client = await pool.connect();
        try {
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

            // Upsert usage
            await client.query(`
                INSERT INTO monthly_usage (
                    user_id, month, 
                    chapters_generated_total, words_generated, 
                    words_premium, words_free_extra
                )
                VALUES ($1, $2, 1, $3, $4, $5)
                ON CONFLICT (user_id, month) DO UPDATE SET
                    chapters_generated_total = monthly_usage.chapters_generated_total + 1,
                    words_generated = monthly_usage.words_generated + $3,
                    words_premium = monthly_usage.words_premium + $4,
                    words_free_extra = monthly_usage.words_free_extra + $5,
                    updated_at = now()
            `, [
                userId,
                currentMonth,
                wordCount,
                isPremiumModel ? wordCount : 0,
                !isPremiumModel ? wordCount : 0 // If not premium, it counts towards free extra
            ]);

        } finally {
            client.release();
        }
    }

    public async getUsage(userId: string): Promise<{ tier: UserTier, usage: MonthlyUsage }> {
        const client = await pool.connect();
        try {
            // Get User Tier
            const userRes = await client.query('SELECT subscription_tier FROM users WHERE id = $1', [userId]);
            if (userRes.rows.length === 0) throw new AppError('User not found', 404);
            const tier: UserTier = userRes.rows[0].subscription_tier || 'free';

            // Get Usage
            const currentMonth = new Date().toISOString().slice(0, 7);
            const usageRes = await client.query(
                'SELECT * FROM monthly_usage WHERE user_id = $1 AND month = $2',
                [userId, currentMonth]
            );

            const usage = usageRes.rows.length > 0 ? usageRes.rows[0] : {
                chapters_generated_total: 0,
                words_generated: 0,
                words_premium: 0,
                words_free_extra: 0,
                chapters_premium: 0,
                chapters_free_extra: 0
            };

            return { tier, usage };
        } finally {
            client.release();
        }
    }

    /**
     * Increments word count directly (called from frontend when actions are executed)
     */
    public async incrementWordCount(userId: string, wordCount: number) {
        const client = await pool.connect();
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);

            // Upsert usage - we count all words as "free_extra" since we don't know the model at this point
            await client.query(`
                INSERT INTO monthly_usage (
                    user_id, month, 
                    chapters_generated_total, words_generated, 
                    words_premium, words_free_extra
                )
                VALUES ($1, $2, 0, $3, 0, $3)
                ON CONFLICT (user_id, month) DO UPDATE SET
                    words_generated = monthly_usage.words_generated + $3,
                    words_free_extra = monthly_usage.words_free_extra + $3,
                    updated_at = now()
            `, [userId, currentMonth, wordCount]);

            console.log(`[Word Tracking] Added ${wordCount} words for user ${userId}`);
        } finally {
            client.release();
        }
    }
}

export const subscriptionService = new SubscriptionService();
