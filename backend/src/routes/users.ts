import express from 'express';
import { pool } from '../db/pool';

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

        // Parallel queries for stats
        const storiesCountPromise = pool.query(
            'SELECT COUNT(*) FROM stories WHERE user_id = $1',
            [id]
        );

        const wordsWrittenPromise = pool.query(
            `SELECT SUM(word_count) as total_words 
             FROM chapters c 
             JOIN stories s ON c.story_id = s.id 
             WHERE s.user_id = $1`,
            [id]
        );

        // Mocking reading list for now as we might not have data yet
        const readingListCount = 12;

        const [storiesRes, wordsRes] = await Promise.all([
            storiesCountPromise,
            wordsWrittenPromise
        ]);

        res.json({
            storiesPublished: parseInt(storiesRes.rows[0].count, 10) || 0,
            wordsWritten: parseInt(wordsRes.rows[0].total_words, 10) || 0,
            readingList: readingListCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

export default router;
