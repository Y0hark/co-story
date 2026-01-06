import express from 'express';
import { aiService, AIMode } from '../services/aiService';

const router = express.Router();

// POST /api/ai/chat
// General chat endpoint for all modes
router.post('/chat', async (req, res) => {
    try {
        const { mode, message, context, history } = req.body;

        if (!mode || !message) {
            return res.status(400).json({ error: 'Mode and message are required' });
        }

        const response = await aiService.generateResponse(mode as AIMode, message, context || {}, history || []);

        if (response.error) {
            return res.status(500).json({ error: response.error });
        }

        res.json({ content: response.content });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/ai/edit
// For quick actions (grammar, tone, verify, etc)
router.post('/edit', async (req, res) => {
    try {
        const { text, instruction } = req.body;

        if (!text || !instruction) {
            return res.status(400).json({ error: 'Text and instruction are required' });
        }

        const response = await aiService.edit(text, instruction);

        if (response.error) {
            return res.status(500).json({ error: response.error });
        }

        res.json({ content: response.content });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
