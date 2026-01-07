import express from 'express';
import { aiService, AIMode } from '../services/aiService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// POST /api/ai/chat
// General chat endpoint for all modes
router.post('/chat', authenticateToken, async (req: express.Request, res: express.Response) => {
    try {
        const { mode, message, context, history } = req.body;
        const userId = (req as AuthRequest).user?.id; // user id from token

        if (!mode || !message) {
            return res.status(400).json({ error: 'Mode and message are required' });
        }

        const response = await aiService.generateResponse(mode as AIMode, message, context || {}, history || [], userId);

        if (response.error) {
            return res.status(500).json({ error: response.error });
        }

        res.json({ content: response.content });
    } catch (err: any) {
        console.error(err);
        if (err.name === 'UpgradeRequiredError') {
            return res.status(403).json({ error: err.message, code: 'UPGRADE_REQUIRED' });
        }
        if (err.name === 'InsufficientCreditsError') {
            return res.status(402).json({ error: err.message, code: 'INSUFFICIENT_CREDITS' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/ai/edit
// For quick actions (grammar, tone, verify, etc)
router.post('/edit', authenticateToken, async (req, res) => {
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

// POST /api/ai/summarize
router.post('/summarize', authenticateToken, async (req, res) => {
    try {
        const { text, type } = req.body; // type = 'chapter' | 'story'
        const userId = (req as AuthRequest).user?.id;

        if (!text || !type) {
            return res.status(400).json({ error: 'Text and type are required' });
        }

        const summary = await aiService.generateSummary(text, type as 'chapter' | 'story', userId);
        res.json({ summary });
    } catch (err: any) {
        console.error("Summary error:", err);
        if (err.name === 'InsufficientCreditsError') {
            return res.status(402).json({ error: err.message, code: 'INSUFFICIENT_CREDITS' });
        }
        res.status(500).json({ error: 'Summary generation failed' });
    }
});

export default router;
