import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Database Connection
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'co_story_db',
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Co-Story Backend is running' });
});

// -- World Items Routes --

// GET /api/stories/:id/world
app.get('/api/stories/:id/world', async (req, res) => {
    try {
        const { id } = req.params;
        // In a real app, validate user access here
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

        // In a real app, validate user access here
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
