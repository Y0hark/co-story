import express from 'express'; // Force restart
import cors from 'cors';
import dotenv from 'dotenv';
// import { Pool } from 'pg'; // Moved to db/pool.ts
import { pool } from './db/pool';

dotenv.config();

import libraryRouter from './routes/library';
import aiRoutes from './routes/ai';
import usageRoutes from './routes/usage';

import authRoutes from './routes/auth';
import storyRoutes from './routes/stories';
import chapterRoutes from './routes/chapters';
import userRoutes from './routes/users';
import readingListRoutes from './routes/reading_lists';
import socialRoutes from './routes/social';

const app = express();
const PORT = process.env.PORT || 3001;

// Database Connection from shared pool
// const pool = new Pool({...}) 

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
import chatRoutes from './routes/chat';

app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes); // This mounts at /api/stories
// We want /api/stories/:id/chat so either we mount inside storyRoutes OR we use a separate mount.
// Since existing storyRoutes handles /:id/..., let's check storyRoutes.
// Actually, easier to mount at /api for flexible paths or modify storyRoutes. 
// BUT, I'll mount it separately matching the pattern if possible or just use a new prefix.
// Wait, my file defines `/:storyId/chat`. So `app.use('/api/stories', chatRoutes)` would result in `/api/stories/:storyId/chat`.
// Let's verify storyRoutes doesn't conflict.

app.use('/api/stories', chatRoutes); // Overlays on top of existing story routes? Express allows multiple routers on same path.
app.use('/api/stories', storyRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reading-lists', readingListRoutes);
app.use('/api', socialRoutes);
app.use('/api/library', libraryRouter);
app.use('/api/ai', aiRoutes);
app.use('/api/usage', usageRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Co-Story Backend is running' });
});

// -- World Items Routes --
// Keeping these inline for now or could move to routes/world.ts (out of scope but cleaner)
// I will quickly refactor them to use the imported `pool` to avoid "pool is not defined" error since I removed the local definition.

// GET /api/stories/:id/world
app.get('/api/stories/:id/world', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM world_items WHERE story_id = $1 ORDER BY created_at DESC',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch world items' });
    }
});

// POST /api/stories/:id/world
app.post('/api/stories/:id/world', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, description, attributes } = req.body;

        const result = await pool.query(
            `INSERT INTO world_items (story_id, name, type, description, attributes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [id, name, type, description, attributes || {}]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create world item' });
    }
});

// PUT /api/stories/:id/world/:itemId
app.put('/api/stories/:id/world/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const { name, type, description, attributes } = req.body;

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(itemId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const result = await pool.query(
            `UPDATE world_items 
             SET name = $1, type = $2, description = $3, attributes = $4 
             WHERE id = $5 
             RETURNING *`,
            [name, type, description, attributes || {}, itemId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update world item' });
    }
});

// DELETE /api/stories/:id/world/:itemId
app.delete('/api/stories/:id/world/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        await pool.query('DELETE FROM world_items WHERE id = $1', [itemId]);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete world item' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
