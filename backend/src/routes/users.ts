import express from 'express';
import { pool } from '../db/pool';
import { subscriptionService } from '../services/subscriptionService';

const router = express.Router();

// GET /api/users/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, email, display_name, avatar_url, banner_url, bio, is_public, tags, created_at FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { display_name, bio, avatar_url, banner_url, tags } = req.body;

        // Validation / Cleanup
        if (display_name) display_name = display_name.trim();
        if (bio) bio = bio.trim();
        if (avatar_url) avatar_url = avatar_url.trim();
        if (banner_url) banner_url = banner_url.trim();

        const result = await pool.query(
            `UPDATE users 
             SET display_name = COALESCE($1, display_name), 
                 bio = COALESCE($2, bio),
                 avatar_url = COALESCE($3, avatar_url),
                 banner_url = COALESCE($4, banner_url),
                 tags = COALESCE($5, tags),
                 updated_at = now()
             WHERE id = $6
             RETURNING id, email, display_name, avatar_url, banner_url, bio, is_public, tags, created_at`,
            [display_name, bio, avatar_url, banner_url, tags, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// GET /api/users/:id/stats
router.get('/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Written Stats (Total Words, Chapters Written, Stories Published)
        const writtenStatsRes = await pool.query(`
            SELECT 
                COUNT(DISTINCT s.id) filter (where s.visibility = 'public') as stories_published,
                COUNT(c.id) as chapters_written,
                COUNT(c.id) filter (where c.status = 'published') as chapters_published,
                COALESCE(SUM(c.word_count), 0) as words_written,
                COALESCE(SUM(c.word_count) filter (where s.visibility = 'private'), 0) as private_words
            FROM stories s
            LEFT JOIN chapters c ON s.id = c.story_id
            WHERE s.user_id = $1
        `, [id]);

        // 2. Read Stats (Chapters Read, Words Read)
        const readStatsRes = await pool.query(`
            SELECT 
                COUNT(rc.chapter_id) as chapters_read,
                COALESCE(SUM(c.word_count), 0) as words_read
            FROM read_chapters rc
            JOIN chapters c ON rc.chapter_id = c.id
            WHERE rc.user_id = $1
        `, [id]);

        const written = writtenStatsRes.rows[0];
        const read = readStatsRes.rows[0];

        // 3. Get Subscription & Usage
        const { tier, usage } = await subscriptionService.getUsage(id);

        // Calculate limits and days remaining
        const limits = {
            'free': 3000,
            'tier1': 90000,
            'tier2': 300000,
            'tier3': 900000
        };
        const wordLimit = limits[tier as keyof typeof limits] || 3000;

        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // 4. Calculate "Self Healing" Time (Private writing)
        // Heuristic: avg typing speed 20 wpm for creative thought process? 
        // Or maybe strictly "Writing Time". Let's use 20wpm as a slow, thoughtful pace.
        const privateWords = parseInt(written.private_words, 10);
        const healingMinutes = Math.round(privateWords / 20);

        res.json({
            storiesPublished: parseInt(written.stories_published, 10) || 0,

            wordsWritten: parseInt(written.words_written, 10) || 0,
            chaptersWritten: parseInt(written.chapters_written, 10) || 0,
            chaptersPublished: parseInt(written.chapters_published, 10) || 0,

            wordsRead: parseInt(read.words_read, 10) || 0,
            chaptersRead: parseInt(read.chapters_read, 10) || 0,

            timeHealingMinutes: healingMinutes,

            // Subscription Stats
            subscription: {
                tier,
                wordLimit,
                wordsUsed: usage.words_generated,
                daysUntilReset,
                usagePercentage: Math.min(100, Math.round((usage.words_generated / wordLimit) * 100))
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

export default router;
