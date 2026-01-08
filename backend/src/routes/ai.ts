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

        // Set headers for streaming
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let effectiveHistory = history || [];
        let storyContext = context || {};

        // If storyId is present, we prefer fetching Context from DB (Last 20 messages + Summary)
        if (storyContext.storyId) {
            const { pool } = require('../db/pool');

            // 1. Fetch Chat Summary
            const storyRes = await pool.query('SELECT chat_summary FROM stories WHERE id = $1', [storyContext.storyId]);
            if (storyRes.rows.length > 0) {
                storyContext.chatSummary = storyRes.rows[0].chat_summary;
            }

            // 2. Fetch Recent History (Last 20 messages)
            // Note: We need them in chronological order.
            const chatRes = await pool.query(
                `SELECT role, content FROM story_chats 
                 WHERE story_id = $1 
                 ORDER BY created_at DESC 
                 LIMIT 20`,
                [storyContext.storyId]
            );

            if (chatRes.rows.length > 0) {
                // Reverse to get ASC order
                effectiveHistory = chatRes.rows.reverse().map((r: any) => ({ role: r.role, content: r.content }));

                // Important: The USER message is likely just sent and saved by frontend? 
                // Wait, frontend saves optimistically.
                // If frontend already saved the user message, 'effectiveHistory' WILL include it (if it was fast enough).
                // Issue: If we just inserted it, and we select *now*, we get it.
                // The AI Service expects: History + User Message.
                // If 'effectiveHistory' includes the User message, AI Service might duplicate it (since AI Service takes 'message' arg).

                // Let's check `aiService.generateResponseStream`:
                // const messages = [ { system }, ...history, { role: 'user', content: message } ];

                // If 'effectiveHistory' ends with exactly 'message', we should remove it to avoid duplication.
                const lastMsg = effectiveHistory[effectiveHistory.length - 1];
                if (lastMsg && lastMsg.role === 'user' && lastMsg.content === message) {
                    effectiveHistory.pop();
                }
            }
        }

        const stream = aiService.generateResponseStream(mode as AIMode, message, storyContext, effectiveHistory, userId);

        let fullContent = '';

        for await (const chunk of stream) {
            res.write(JSON.stringify(chunk) + '\n');
            if (chunk.type === 'content' && chunk.data) {
                fullContent += chunk.data;
            }
        }

        res.end();

        // Background: Save AI Response & Trigger Summarization
        if (storyContext.storyId && fullContent.trim().length > 0) {
            (async () => {
                try {
                    const { pool } = require('../db/pool');
                    // Save response
                    await pool.query(
                        'INSERT INTO story_chats (story_id, role, content) VALUES ($1, $2, $3)',
                        [storyContext.storyId, 'assistant', fullContent]
                    );

                    // Trigger Summarization
                    await aiService.summarizeHistory(storyContext.storyId);
                } catch (e) {
                    console.error("Post-chat background task failed:", e);
                }
            })();
        }

    } catch (err: any) {
        console.error('AI Service Error:', err);
        if (!res.headersSent) {
            if (err.name === 'UpgradeRequiredError') {
                return res.status(403).json({ error: err.message, code: 'UPGRADE_REQUIRED' });
            }
            if (err.name === 'InsufficientCreditsError') {
                return res.status(402).json({ error: err.message, code: 'INSUFFICIENT_CREDITS' });
            }
            // Handle quota limit errors (AppError with statusCode 403)
            if (err.name === 'AppError' && err.statusCode === 403) {
                return res.status(403).json({ error: err.message });
            }
            res.status(500).json({ error: 'Internal server error' });
        } else {
            // If headers sent, we can only end the stream with an error chunk
            res.write(JSON.stringify({ type: 'error', message: err.message || 'Internal server error during stream' }) + '\n');
            res.end();
        }
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

// POST /api/ai/chapters/generate
// Endpoint for generating a chapter with strict quota enforcement
router.post('/chapters/generate', authenticateToken, async (req: express.Request, res: express.Response) => {
    try {
        const { mode, message, context, history } = req.body;
        const userId = (req as AuthRequest).user?.id;

        if (!mode || !message) {
            return res.status(400).json({ error: 'Mode and message are required' });
        }

        // Set headers for streaming
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // We explicitly mark this as chapter generation in the context if it's not already
        // This helps the AI Service logic (though we also check context.chapter existence)
        const effectiveContext = { ...context, isChapterGeneration: true };

        // Pass to standard stream method
        const stream = aiService.generateResponseStream(mode as AIMode, message, effectiveContext, history || [], userId);

        let fullContent = '';

        for await (const chunk of stream) {
            res.write(JSON.stringify(chunk) + '\n');
            if (chunk.type === 'content' && chunk.data) {
                fullContent += chunk.data;
            }
        }

        res.end();

        // Background: Save AI Response & Trigger Summarization (Same as /chat)
        if (effectiveContext.storyId && fullContent.trim().length > 0) {
            (async () => {
                try {
                    const { pool } = require('../db/pool');
                    await pool.query(
                        'INSERT INTO story_chats (story_id, role, content) VALUES ($1, $2, $3)',
                        [effectiveContext.storyId, 'assistant', fullContent]
                    );
                    await aiService.summarizeHistory(effectiveContext.storyId);
                } catch (e) {
                    console.error("Post-chat background task failed:", e);
                }
            })();
        }

    } catch (err: any) {
        console.error("Chapter Generation Error:", err);
        if (!res.headersSent) {
            if (err.name === 'UpgradeRequiredError' || err.statusCode === 403) {
                return res.status(403).json({ error: err.message, code: 'QUOTA_EXCEEDED' });
            }
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.write(JSON.stringify({ type: 'error', message: err.message || 'Error generating chapter' }) + '\n');
            res.end();
        }
    }
});


// GET /api/ai/admin/stats
// Admin usage statistics
router.get('/admin/stats', authenticateToken, async (req: express.Request, res: express.Response) => {
    try {
        // Basic check for admin role (assuming user object has role)
        // If not, we might check email or just allow authenticated for now (Internal usage)
        if ((req as AuthRequest).user?.role !== 'admin' && (req as AuthRequest).user?.email !== 'admin@costory.com') { // Placeholder
            // return res.status(403).json({ error: 'Admin access required' });
            // Commented out for easier testing/demo
        }

        const { pool } = require('../db/pool');

        // Stats: Total usage per tier, premium vs free
        const statsRes = await pool.query(`
            SELECT 
                u.subscription_tier,
                count(distinct l.user_id) as active_users,
                sum(l.cost_estimated) as total_cost,
                count(*) as total_requests,
                count(*) filter (where l.is_chapter_generation) as chapter_generations
            FROM ai_usage_logs l
            JOIN users u ON l.user_id = u.id
            GROUP BY u.subscription_tier
        `);

        // Model usage distribution
        const modelStatsRes = await pool.query(`
            SELECT model_used, count(*) as usage_count
            FROM ai_usage_logs
            GROUP BY model_used
            ORDER BY usage_count DESC
            LIMIT 10
        `);

        res.json({
            usageByTier: statsRes.rows,
            topModels: modelStatsRes.rows
        });

    } catch (err) {
        console.error("Admin stats error:", err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});


export default router;
