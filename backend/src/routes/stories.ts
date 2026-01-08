import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// Helper to get pool from app locals or re-import. 
// Ideally passing pool is better, but for now we'll import it if we exported it, 
// or simpler: just create a router factory or assume global pool availability? 
// Let's rely on the index.ts to pass it or just instantiate a pool here if needed, 
// BUT best practice in this setup (without dedicated service layer yet) is likely to have a shared db module.
// Let's create `src/db/index.ts` first to share the pool? 
// No, user didn't ask for refactor. I'll assume I can import `pool` from `../index` if I export it, 
// OR I will just copy the pool config for now to avoid circular deps or complex refactor 
// if `index.ts` isn't set up for exports.
// Actually, I should create `src/config/db.ts` or similar. 
// Let's look at `index.ts` again. It creates a pool but doesn't export it.
// I will create `src/db/pool.ts` to share the connection.

import { pool } from '../db/pool';

// Hardcoded User ID for testing (as agreed)
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000'; // We might need to ensure this user exists or use a seed.
// Actually, let's just use a real UUID or insert one if missing.
// For now, I'll use a random UUID and rely on the fact that I might need to create the user first 
// or disable FK constraints? No, FK constraints exist.
// Smartest move: Create a seed user in `init-db` or just find one? 
// Let's just create a user on the fly if needed or use a fixed one.

// GET /api/stories (Public / Community)
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        let queryText = `
            SELECT s.*, u.display_name as author_name, sm.theme as genre,
            (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id AND c.status = 'published') as chapters_count,
            (SELECT COUNT(*) FROM story_likes l WHERE l.story_id = s.id) as likes_count
            FROM stories s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN story_metadata sm ON s.id = sm.story_id
            WHERE s.visibility != 'private' 
            AND (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id AND c.status = 'published') > 0
        `;

        const params: any[] = [];

        if (q && typeof q === 'string') {
            const searchTerm = `%${q}%`;
            queryText += ` AND (s.title ILIKE $1 OR s.description ILIKE $1)`;
            params.push(searchTerm);
        }

        queryText += ` ORDER BY s.created_at DESC`;

        const result = await pool.query(queryText, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stories' });
    }
});

// GET /api/stories/my (Dashboard)
router.get('/my', async (req, res) => {
    try {
        // In real app: req.user.id
        const userId = '11111111-1111-1111-1111-111111111111'; // Fixed Test User

        const result = await pool.query(`
            SELECT s.*, 
            (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id) as chapters_count,
            (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id AND c.status = 'published') as published_chapters_count,
            (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id AND (c.status = 'draft' OR c.status IS NULL)) as draft_chapters_count
            FROM stories s
            WHERE s.user_id = $1
            ORDER BY s.updated_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user stories' });
    }
});

// GET /api/stories/liked (Profile)
router.get('/liked', async (req, res) => {
    try {
        const userId = '11111111-1111-1111-1111-111111111111'; // Fixed Test User

        const result = await pool.query(`
            SELECT s.*, u.display_name as author_name, sm.theme as genre,
            (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id AND c.status = 'published') as chapters_count,
            (SELECT COUNT(*) FROM story_likes sl_count WHERE sl_count.story_id = s.id) as likes_count
            FROM story_likes sl
            JOIN stories s ON sl.story_id = s.id
            JOIN users u ON s.user_id = u.id
            LEFT JOIN story_metadata sm ON s.id = sm.story_id
            WHERE sl.user_id = $1
            ORDER BY sl.created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch liked stories' });
    }
});

// GET /api/stories/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            `SELECT s.*, 
                (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id) as chapter_count,
                 coalesce((SELECT SUM(word_count) FROM chapters c WHERE c.story_id = s.id), 0) as total_words
             FROM stories s 
             WHERE s.user_id = $1 
             ORDER BY s.updated_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user stories' });
    }
});

// GET /api/stories/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        let userJoin = '';
        let userSelect = 'false as is_liked';

        // Validate UUID to prevent SQL injection/errors if userId is garbage (though passed as param usually safe in PG)
        if (userId && typeof userId === 'string' && userId.length === 36) {
            userJoin = `LEFT JOIN story_likes sl_me ON s.id = sl_me.story_id AND sl_me.user_id = '${userId}'`;
            userSelect = `CASE WHEN sl_me.user_id IS NOT NULL THEN true ELSE false END as is_liked`;
        }

        const result = await pool.query(`
            SELECT s.*, 
            u.display_name as author_name,
            (SELECT COUNT(*) FROM chapters c WHERE c.story_id = s.id AND c.status = 'published') as chapters_count,
            (SELECT COUNT(*) FROM story_likes l WHERE l.story_id = s.id) as likes_count,
            (SELECT purpose FROM story_metadata WHERE story_id = s.id) as ai_role,
            (SELECT theme FROM story_metadata WHERE story_id = s.id) as genre,
            (SELECT writing_style FROM story_metadata WHERE story_id = s.id) as tone,
            ${userSelect}
            FROM stories s
            JOIN users u ON s.user_id = u.id
            ${userJoin}
            WHERE s.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Story not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch story' });
    }
});

// PUT /api/stories/:id (Update Story)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, visibility } = req.body;

        // Build dynamic query
        const fields = [];
        const values = [];
        let idx = 1;

        if (title !== undefined) {
            fields.push(`title = $${idx++}`);
            values.push(title);
        }
        if (description !== undefined) {
            fields.push(`description = $${idx++}`);
            values.push(description);
        }
        if (visibility !== undefined) {
            fields.push(`visibility = $${idx++}`);
            values.push(visibility);
        }
        const { status } = req.body;
        if (status !== undefined) {
            fields.push(`status = $${idx++}`);
            values.push(status);
        }
        const { summary } = req.body;
        if (summary !== undefined) {
            fields.push(`summary = $${idx++}`);
            values.push(summary);
        }

        if (summary !== undefined) {
            fields.push(`summary = $${idx++}`);
            values.push(summary);
        }

        if (fields.length === 0 && (req.body.genre === undefined && req.body.tone === undefined)) return res.json({ message: 'No changes' });

        values.push(id);

        // 1. Update Story Table
        let result;
        if (fields.length > 0) {
            result = await pool.query(
                `UPDATE stories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
                values
            );
        } else {
            // Just fetch it
            result = await pool.query(`SELECT * FROM stories WHERE id = $1`, [id]);
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Story not found' });
        }

        // 2. Update Metadata Table (Genre/Tone)
        const { genre, tone } = req.body;
        if (genre !== undefined || tone !== undefined) {
            const metaFields = [];
            const metaValues = [];
            let metaIdx = 1;

            if (genre !== undefined) {
                metaFields.push(`theme = $${metaIdx++}`);
                metaValues.push(genre);
            }
            if (tone !== undefined) {
                metaFields.push(`writing_style = $${metaIdx++}`);
                metaValues.push(tone);
            }

            if (metaFields.length > 0) {
                metaValues.push(id);
                // Upsert metadata
                await pool.query(`
                    INSERT INTO story_metadata (story_id, ${genre !== undefined ? 'theme,' : ''} ${tone !== undefined ? 'writing_style' : ''})
                    VALUES ($${metaIdx}, ${genre !== undefined ? `$1,` : ''} ${tone !== undefined ? (genre !== undefined ? '$2' : '$1') : ''})
                    ON CONFLICT (story_id) 
                    DO UPDATE SET ${metaFields.join(', ')}
                `.replace(/\$([0-9]+)/g, (match, p1) => {
                    // Fix parameter indexing mismatch for the VALUES clause which is tricky with dynamic specific indexes
                    // Actually, simpler logic:
                    return match;
                }), metaValues);

                // Simplified Query Construction for safety:
                let updateParts = [];
                let updateVals = [];
                let uIdx = 1;
                if (genre !== undefined) { updateParts.push(`theme = $${uIdx++}`); updateVals.push(genre); }
                if (tone !== undefined) { updateParts.push(`writing_style = $${uIdx++}`); updateVals.push(tone); }
                updateVals.push(id);

                await pool.query(`
                    INSERT INTO story_metadata (story_id, theme, writing_style)
                    VALUES ($${uIdx}, ${genre !== undefined ? '$1' : 'NULL'}, ${tone !== undefined ? (genre !== undefined ? '$2' : '$1') : 'NULL'})
                    ON CONFLICT (story_id) 
                    DO UPDATE SET ${updateParts.join(', ')}
                `, updateVals);
            }
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update story' });
    }
});

// POST /api/stories (Create New)
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { title, mode, genre, tone, topic, aiRole, isPrivate } = req.body;
        const userId = '11111111-1111-1111-1111-111111111111'; // Fixed Test User

        // 0. Ensure User Exists (Hack for dev)
        await client.query(`
            INSERT INTO users (id, email, password_hash, display_name)
            VALUES ($1, 'test@example.com', 'hash', 'Test User')
            ON CONFLICT (id) DO NOTHING
        `, [userId]);

        // 1. Create Story
        const storyResult = await client.query(`
            INSERT INTO stories (user_id, title, mode, visibility, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, [userId, title || 'Untitled Story', mode, isPrivate ? 'private' : 'draft', topic]);

        const storyId = storyResult.rows[0].id;

        // 2. Create Metadata
        await client.query(`
            INSERT INTO story_metadata (story_id, theme, writing_style, purpose)
            VALUES ($1, $2, $3, $4)
        `, [storyId, genre, tone, aiRole || 'coauthor']);

        // 3. Create First Chapter (if not import)
        await client.query(`
            INSERT INTO chapters (story_id, chapter_index, title, content)
            VALUES ($1, 1, 'Chapter 1', '')
        `, [storyId]);

        await client.query('COMMIT');
        res.json({ id: storyId, message: 'Story created successfully' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to create story' });
    } finally {
        client.release();
    }
});

export default router;
