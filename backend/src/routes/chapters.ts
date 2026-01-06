import express from 'express';
import { pool } from '../db/pool';

const router = express.Router();

// GET /api/stories/:storyId/chapters
router.get('/:storyId/chapters', async (req, res) => {
    try {
        const { storyId } = req.params;
        const result = await pool.query(
            'SELECT id, chapter_index, title, word_count FROM chapters WHERE story_id = $1 ORDER BY chapter_index ASC',
            [storyId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
});

// GET /api/stories/:storyId/chapters/:chapterId
// Note: In typical REST, this might be just /api/chapters/:id, but nesting is fine too.
// Let's stick to flat /api/chapters/:id for specific chapter ops if we want, 
// OR we can mount this router at /api/stories/:storyId/chapters ? 
// The implementation plan said /api/chapters/:storyId... wait.
// Let's make it simple. Global chapters router.

// We'll treat this file as router mounted on /api or /api/chapters?
// Let's define the routes relatively and mount in index.ts
// I'll assume this is mounted at /api/chapters for ID-based lookups, 
// and maybe we need a special route for "all chapters of story".

// Let's redefine: 
// GET /api/stories/:id/chapters -> Handled by generic query? 
// No, let's put listing in `stories.ts` OR keep it here properly.

// Let's do:
// router.get('/story/:storyId', ...)

// GET /api/chapters/story/:storyId
router.get('/story/:storyId', async (req, res) => {
    try {
        const { storyId } = req.params;
        const { userId } = req.query;

        let userReadJoin = '';
        let userLikeJoin = '';
        let selectFields = `
            false as is_read, 
            false as is_liked,
            (SELECT COUNT(*) FROM chapter_likes WHERE chapter_id = c.id) as likes_count
        `;

        if (userId) {
            userReadJoin = `LEFT JOIN read_chapters rc ON c.id = rc.chapter_id AND rc.user_id = '${userId}'`;
            userLikeJoin = `LEFT JOIN chapter_likes cl ON c.id = cl.chapter_id AND cl.user_id = '${userId}'`;
            selectFields = `
                CASE WHEN rc.read_at IS NOT NULL THEN true ELSE false END as is_read,
                CASE WHEN cl.user_id IS NOT NULL THEN true ELSE false END as is_liked,
                (SELECT COUNT(*) FROM chapter_likes WHERE chapter_id = c.id) as likes_count
            `;
        }

        const result = await pool.query(
            `SELECT 
                c.id, c.chapter_index, c.title, c.content, c.word_count, c.status,
                ${selectFields}
             FROM chapters c
             ${userReadJoin}
             ${userLikeJoin}
             WHERE c.story_id = $1 
             ORDER BY c.chapter_index ASC`,
            [storyId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
});

// GET /api/chapters/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM chapters WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Chapter not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch chapter' });
    }
});

// PUT /api/chapters/:id
// PUT /api/chapters/:id (Update)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { title, content, status } = req.body;

        if (title) title = title.trim();
        // content can be empty string

        const result = await pool.query(
            `UPDATE chapters 
             SET title = COALESCE($1, title), 
                 content = COALESCE($2, content),
                 status = COALESCE($3, status),
                 updated_at = now()
             WHERE id = $4
             RETURNING *`,
            [title, content, status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update chapter' });
    }
});

// POST /api/chapters (Create new)
router.post('/', async (req, res) => {
    try {
        const { storyId, title } = req.body;

        // Get max index
        const indexResult = await pool.query('SELECT MAX(chapter_index) as max_idx FROM chapters WHERE story_id = $1', [storyId]);
        const nextIndex = (indexResult.rows[0].max_idx || 0) + 1;

        const result = await pool.query(
            'INSERT INTO chapters (story_id, chapter_index, title, content, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [storyId, nextIndex, title || `Chapter ${nextIndex}`, '', 'draft']
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create chapter' });
    }
});

export default router;
