
import { Router, Request, Response } from 'express';
import { subscriptionService } from '../services/subscriptionService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * POST /api/usage/track-words
 * Frontend calls this when AI actions are executed to track word count
 */
router.post('/track-words', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || (req as any).user?.userId;
        const { wordCount } = req.body;

        if (!userId) {
            console.error('[Word Tracking] No user ID found in token:', (req as any).user);
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (typeof wordCount !== 'number' || wordCount <= 0) {
            return res.status(400).json({ error: 'Invalid word count' });
        }

        console.log(`[Word Tracking] Tracking ${wordCount} words for user ${userId}`);
        await subscriptionService.incrementWordCount(userId, wordCount);

        res.json({ success: true, wordCount });
    } catch (error: any) {
        console.error('Word tracking error:', error);
        res.status(500).json({ error: error.message || 'Failed to track words' });
    }
});

export default router;
