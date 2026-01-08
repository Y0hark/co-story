import express from 'express';
import { StripeService } from '../services/stripeService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Webhook needs raw body. We handle this by NOT parsing it here if it's the webhook, 
// or by applying a raw parser specifically for this route.
// Ideally, this router is mounted BEFORE global body parsing in index.ts.

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        if (!signature) {
            return res.status(400).send('Missing stripe signature');
        }

        await StripeService.handleWebhook(signature as string, req.body);
        res.json({ received: true });
    } catch (err: any) {
        console.error('Webhook Error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

// All other routes expect JSON. If global parser isn't used, we need it here.
const jsonParser = express.json();

router.post('/create-checkout-session', authenticateToken, jsonParser, async (req: any, res) => {
    try {
        const { priceId } = req.body;
        if (!priceId) return res.status(400).json({ error: 'Price ID required' });

        const session = await StripeService.createCheckoutSession(req.user.id, priceId);
        res.json({ url: session.url });
    } catch (err: any) {
        console.error('Checkout Error:', err);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

router.post('/create-portal-session', authenticateToken, jsonParser, async (req: any, res) => {
    try {
        const session = await StripeService.createPortalSession(req.user.id);
        res.json({ url: session.url });
    } catch (err: any) {
        console.error('Portal Error:', err);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
});

export default router;
