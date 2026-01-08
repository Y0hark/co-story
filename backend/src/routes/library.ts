import express from 'express';
import { pool } from '../db/pool';
import { subscriptionService } from '../services/subscriptionService';

const router = express.Router();

// Helper: Ensure "Saved" list exists
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

// GET /api/library/:userId
// Fetch all lists and their stories
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Fetch Lists
        const listsRes = await pool.query(
            `SELECT * FROM reading_lists WHERE user_id = $1 ORDER BY name = 'Saved' DESC, created_at ASC`,
            [userId]
        );
        const lists = listsRes.rows;

        // 2. Fetch Items for all lists
        // We get story details + read progress
        const itemsRes = await pool.query(
            `SELECT 
                rli.list_id,
                s.*,
                (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id AND c.status = 'published') as total_chapters,
                (SELECT COUNT(*) FROM read_chapters rc 
                 JOIN chapters c ON rc.chapter_id = c.id 
                 WHERE c.story_id = s.id AND rc.user_id = $1) as read_chapters_count,
                 u.display_name as author_name
             FROM reading_list_items rli
             JOIN stories s ON rli.story_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE rli.list_id IN (SELECT id FROM reading_lists WHERE user_id = $1)
             ORDER BY rli.added_at DESC`,
            [userId]
        );

        const items = itemsRes.rows;

        // 3. Map items to lists
        const library = lists.map(list => ({
            ...list,
            stories: items.filter(item => item.list_id === list.id).map(item => ({
                ...item,
                is_new: item.total_chapters > item.read_chapters_count
            }))
        }));

        res.json(library);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch library' });
    }
});

// POST /api/library/lists
// Create new list
router.post('/lists', async (req, res) => {
    try {
        const { userId, name } = req.body;

        // Check Quota
        await subscriptionService.checkListQuota(userId);

        const result = await pool.query(
            "INSERT INTO reading_lists (user_id, name) VALUES ($1, $2) RETURNING *",
            [userId, name]
        );
        res.json(result.rows[0]);
    } catch (err: any) {
        console.error(err);
        if (err.statusCode === 403) {
            return res.status(403).json({ error: err.message, code: 'QUOTA_EXCEEDED' });
        }
        res.status(500).json({ error: 'Failed to create list' });
    }
});

// PUT /api/library/lists/:id
// Rename list
router.put('/lists/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Check if list is "Saved" (protected)
        const check = await pool.query("SELECT name FROM reading_lists WHERE id = $1", [id]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'List not found' });
        if (check.rows[0].name === 'Saved') return res.status(403).json({ error: 'Cannot rename default list' });

        const result = await pool.query(
            "UPDATE reading_lists SET name = $1 WHERE id = $2 RETURNING *",
            [name, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update list' });
    }
});

// DELETE /api/library/lists/:id
// Delete list
router.delete('/lists/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if list is "Saved" (protected)
        const check = await pool.query("SELECT name FROM reading_lists WHERE id = $1", [id]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'List not found' });
        if (check.rows[0].name === 'Saved') return res.status(403).json({ error: 'Cannot delete default list' });

        await pool.query("DELETE FROM reading_lists WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete list' });
    }
});

// POST /api/library/items
// Add story to list
router.post('/items', async (req, res) => {
    try {
        const { listId, storyId } = req.body;
        await pool.query(
            "INSERT INTO reading_list_items (list_id, story_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [listId, storyId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add story' });
    }
});

// DELETE /api/library/items/:listId/:storyId
// Remove story from list
router.delete('/items/:listId/:storyId', async (req, res) => {
    try {
        const { listId, storyId } = req.params;
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

// POST /api/library/read
// Mark chapter as read
router.post('/read', async (req, res) => {
    try {
        const { userId, chapterId } = req.body;
        await pool.query(
            "INSERT INTO read_chapters (user_id, chapter_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [userId, chapterId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to mark chapter as read' });
    }
});

export default router;
