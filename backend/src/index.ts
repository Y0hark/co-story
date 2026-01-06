import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { Pool } from 'pg'; // Moved to db/pool.ts
import { pool } from './db/pool';

dotenv.config();

import libraryRouter from './routes/library';
import aiRoutes from './routes/ai';

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
app.use('/api/stories', storyRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reading-lists', readingListRoutes);
app.use('/api', socialRoutes);
app.use('/api/library', libraryRouter);
app.use('/api/ai', aiRoutes);

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
