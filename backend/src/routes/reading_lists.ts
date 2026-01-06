import express from 'express';
import { pool } from '../db/pool';

const router = express.Router();

// Helper to get or create "Saved" list
const getSavedListId = async (userId: string) => {
    let res = await pool.query(
        "SELECT id FROM reading_lists WHERE user_id = $1 AND name = 'Saved'",
        [userId]
    );
    if (res.rows.length > 0) return res.rows[0].id;

    res = await pool.query(
        "INSERT INTO reading_lists (user_id, name, is_public) VALUES ($1, 'Saved', false) RETURNING id",
        [userId]
    );
    return res.rows[0].id;
};

// GET /api/reading-lists/saved/:userId
router.get('/saved/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const listId = await getSavedListId(userId);

        const result = await pool.query(
            `SELECT s.*, 
                (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id) as chapter_count
             FROM stories s
             JOIN reading_list_items rli ON s.id = rli.story_id
             WHERE rli.list_id = $1
             ORDER BY rli.added_at DESC`,
            [listId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch saved stories' });
    }
});

// POST /api/reading-lists/saved/:userId
// Body: { storyId }
router.post('/saved/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { storyId } = req.body;
        const listId = await getSavedListId(userId);

        await pool.query(
            "INSERT INTO reading_list_items (list_id, story_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [listId, storyId]
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save story' });
    }
});

// DELETE /api/reading-lists/saved/:userId/:storyId
router.delete('/saved/:userId/:storyId', async (req, res) => {
    try {
        const { userId, storyId } = req.params;
        const listId = await getSavedListId(userId);

        await pool.query(
            "DELETE FROM reading_list_items WHERE list_id = $1 AND story_id = $2",
            [listId, storyId]
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove story' });
    }
});

export default router;
