import express from 'express';
import { pool } from '../db/pool';

const router = express.Router();

// --- LIKES ---

// Toggle Like (Story or Chapter)
router.post('/likes', async (req, res) => {
    try {
        const { userId, resourceId, resourceType } = req.body; // resourceType: 'story' | 'chapter'

        const table = resourceType === 'story' ? 'story_likes' : 'chapter_likes';
        const idField = resourceType === 'story' ? 'story_id' : 'chapter_id';

        // Check if exists
        const check = await pool.query(
            `SELECT * FROM ${table} WHERE user_id = $1 AND ${idField} = $2`,
            [userId, resourceId]
        );

        let liked = false;
        if (check.rows.length > 0) {
            // Unlike
            await pool.query(
                `DELETE FROM ${table} WHERE user_id = $1 AND ${idField} = $2`,
                [userId, resourceId]
            );
            liked = false;
        } else {
            // Like
            await pool.query(
                `INSERT INTO ${table} (user_id, ${idField}) VALUES ($1, $2)`,
                [userId, resourceId]
            );
            liked = true;

            // If liking a chapter, ALSO like the story (User Requirement)
            if (resourceType === 'chapter') {
                // 1. Get story_id for this chapter
                const storyRes = await pool.query('SELECT story_id FROM chapters WHERE id = $1', [resourceId]);
                if (storyRes.rows.length > 0) {
                    const storyId = storyRes.rows[0].story_id;
                    // 2. Insert into story_likes (ignore conflict)
                    await pool.query(
                        `INSERT INTO story_likes (user_id, story_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                        [userId, storyId]
                    );
                }
            }
        }

        // Get updated count
        const countRes = await pool.query(
            `SELECT COUNT(*) as count FROM ${table} WHERE ${idField} = $1`,
            [resourceId]
        );

        res.json({ liked, count: parseInt(countRes.rows[0].count) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
});

// Get User Like Status (Batch?)
// For now, simple single check or handle in generic fetch stories/chapters
router.get('/likes/:resourceType/:resourceId', async (req, res) => {
    // ... useful if separate call needed
    res.status(501).json({ error: 'Not implemented, use generic fetch' });
});


// --- PROGRESS ---

// Mark Chapter as Read (and ancestors)
router.post('/progress/chapter', async (req, res) => {
    try {
        const { userId, chapterId, storyId } = req.body;

        // 1. Get current chapter index
        const currentRes = await pool.query('SELECT chapter_index FROM chapters WHERE id = $1', [chapterId]);
        if (currentRes.rows.length === 0) return res.status(404).json({ error: 'Chapter not found' });
        const currentIndex = currentRes.rows[0].chapter_index;

        // 2. Find all previous chapters (including current)
        const previousChapters = await pool.query(
            'SELECT id FROM chapters WHERE story_id = $1 AND chapter_index <= $2',
            [storyId, currentIndex]
        );

        // 3. Mark all as read (ignore duplicates)
        // We can do this in loop or bulk insert. Loop is fine for < 100 chapters.
        for (const row of previousChapters.rows) {
            await pool.query(
                `INSERT INTO read_chapters (user_id, chapter_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [userId, row.id]
            );
        }

        res.json({ success: true, marked: previousChapters.rows.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Toggle Read Status (Manual)
router.post('/progress/toggle', async (req, res) => {
    try {
        const { userId, chapterId } = req.body;

        const check = await pool.query('SELECT * FROM read_chapters WHERE user_id = $1 AND chapter_id = $2', [userId, chapterId]);

        let isRead = false;
        if (check.rows.length > 0) {
            await pool.query('DELETE FROM read_chapters WHERE user_id = $1 AND chapter_id = $2', [userId, chapterId]);
            isRead = false;
        } else {
            await pool.query('INSERT INTO read_chapters (user_id, chapter_id) VALUES ($1, $2)', [userId, chapterId]);
            isRead = true;
        }

        res.json({ isRead });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to toggle read status' });
    }
});

export default router;
