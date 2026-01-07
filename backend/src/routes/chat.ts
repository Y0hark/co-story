
import express from 'express';
import { pool } from '../db/pool';
import { authenticateToken, AuthRequest } from '../middleware/auth'; // Assuming auth middleware exists

const router = express.Router();

// GET /api/stories/:storyId/chat
// Retrieve chat history for a story
router.get('/:storyId/chat', authenticateToken, async (req: express.Request, res: express.Response) => {
    try {
        const { storyId } = req.params;
        const userId = (req as AuthRequest).user?.id;

        // Verify access (omitted for brevity, but should check if user owns story)

        const result = await pool.query(
            'SELECT role, content, created_at FROM story_chats WHERE story_id = $1 ORDER BY created_at ASC',
            [storyId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// POST /api/stories/:storyId/chat
// Manually save a message (mainly for USER messages)
router.post('/:storyId/chat', authenticateToken, async (req: express.Request, res: express.Response) => {
    try {
        const { storyId } = req.params;
        const { role, content } = req.body;

        if (!['user', 'assistant'].includes(role) || !content) {
            return res.status(400).json({ error: 'Invalid message format' });
        }

        const result = await pool.query(
            'INSERT INTO story_chats (story_id, role, content) VALUES ($1, $2, $3) RETURNING *',
            [storyId, role, content]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// DELETE /api/stories/:storyId/chat
// Clear history
router.delete('/:storyId/chat', authenticateToken, async (req: express.Request, res: express.Response) => {
    try {
        const { storyId } = req.params;
        await pool.query('DELETE FROM story_chats WHERE story_id = $1', [storyId]);
        res.json({ message: 'History cleared' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to clear history' });
    }
});

export default router;
