import Stripe from 'stripe';
import { pool } from '../db/pool';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover', // Fixed version correctly typed
});

export const StripeService = {
    async createCheckoutSession(userId: number, priceId: string) {
        // Get user email
        const userRes = await pool.query('SELECT email, stripe_customer_id FROM users WHERE id = $1', [userId]);
        const user = userRes.rows[0];

        let customerId = user.stripe_customer_id;

        // If no customer ID, create one (or let Stripe create one during checkout, but creating first is cleaner for tracking)
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: userId.toString() }
            });
            customerId = customer.id;
            await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, userId]);
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing`,
            subscription_data: {
                metadata: { userId: userId.toString() }
            }
        });

        return session;
    },

    async createPortalSession(userId: number) {
        const userRes = await pool.query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId]);
        const user = userRes.rows[0];

        if (!user.stripe_customer_id) {
            throw new Error('No customer ID found');
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/dashboard`,
        });

        return session;
    },

    async handleWebhook(signature: string, payload: Buffer) {
        const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );

        switch (event.type) {
            case 'checkout.session.completed':
                // const session = event.data.object as Stripe.Checkout.Session;
                // Verify logic here if needed, or rely on subscription.updated
                break;
            case 'customer.subscription.updated':
            case 'customer.subscription.created':
            case 'customer.subscription.deleted':
                const subscription = event.data.object as Stripe.Subscription;
                const status = subscription.status;
                const customerId = subscription.customer as string;

                // Map Stripe status to our DB status
                // active, trialing -> active
                // past_due, unpaid -> past_due
                // canceled -> free/canceled

                let dbStatus = 'free';
                if (['active', 'trialing'].includes(status)) dbStatus = 'active';
                else if (['past_due', 'unpaid'].includes(status)) dbStatus = 'past_due';

                // Determine Tier based on Price ID
                let tier = 'free';
                if (dbStatus === 'active') {
                    const items = subscription.items.data;
                    if (items.length > 0) {
                        const priceId = items[0].price.id;

                        if (priceId === 'price_1SnKNH7uiRaz63ESwhD0EgQO') tier = 'scribe';
                        else if (priceId === 'price_1SnKNn7uiRaz63ESPeIERk7t') tier = 'storyteller';
                        else if (priceId === 'price_1SnKOB7uiRaz63ESrUpiLHyh') tier = 'architect';
                        else tier = 'pro';
                    } else {
                        tier = 'pro';
                    }
                }

                console.log(`[Stripe Webhook] Processing ${event.type} for customer ${customerId}. Status: ${status} -> DB: ${dbStatus}, Tier: ${tier}`);

                const updateRes = await pool.query(
                    'UPDATE users SET subscription_status = $1, subscription_tier = $2 WHERE stripe_customer_id = $3',
                    [dbStatus, tier, customerId]
                );
                console.log(`[Stripe Webhook] Update result: ${updateRes.rowCount} rows affected.`);
                break;
        }
    }
};
