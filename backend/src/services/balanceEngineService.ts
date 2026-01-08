
import { aiModelService } from './aiModelService';

// --- CONFIGURATION ---
const FREE_MODELS = [
    // --- Le "Poids Lourd" Xiaomi (Nouveau !) ---
    'xiaomi/mimo-v2-flash:free',

    // --- Les Monstres (High IQ) ---
    'openai/gpt-oss-120b:free',
    'qwen/qwen3-coder:free',
    'meta-llama/llama-3.3-70b-instruct:free',

    // --- Les Rapides (Google/Mistral) ---
    'google/gemini-2.0-flash-exp:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',

    // --- Les Backups Légers ---
    'google/gemma-3-27b-it:free',
    'z-ai/glm-4.5-air:free',
    'google/gemini-2.0-flash-lite-preview-02-05:free',
    'google/gemini-2.0-pro-exp-02-05:free'
];

const PAID_LOW_COST = [
    'deepseek/deepseek-chat',
    'google/gemini-2.5-flash-002',
    'mistralai/mistral-small-2501',
    'anthropic/claude-3-5-haiku-20241022',
    'openai/gpt-4o-mini'
];

const PAID_PREMIUM = [
    'anthropic/claude-3.5-sonnet',
    'openai/gpt-4o',
    'google/gemini-pro-1.5'
];

export interface ModelSelectionResult {
    modelId: string;
    source: 'free' | 'paid_low' | 'paid_premium';
    isFallback?: boolean;
}

export type UserTier = 'free' | 'tier1' | 'tier2' | 'tier3';

export class BalanceEngineService {

    /**
     * Decisions logic for selecting the model based on tier and routing rules.
     */
    public selectModel(
        tier: UserTier,
        usage: { premiumCount: number, freeExtraCount: number }, // Note: now reflects WORDS
        userSelectedModel?: string
    ): ModelSelectionResult {

        // --- TIER 3 LOGIC (Premium) ---
        if (tier === 'tier3') {
            // Priority 1: User Selection (Premium Quota)
            // Limit: 600,000 words (200 chapters equivalent)
            const PREMIUM_LIMIT_WORDS = 600000;

            if (usage.premiumCount < PREMIUM_LIMIT_WORDS) {
                // Verify user selection is valid (whitelist check could be here, or assume frontend filters)
                // For now, allow any "Paid Mainstream" models.
                // If no selection, default to a premium one? Or low cost? 
                // Spec says "user chooses".
                if (userSelectedModel) {
                    return { modelId: userSelectedModel, source: 'paid_premium' }; // Or paid_low, depending on what they picked
                }
                // Default if not specified: pick a good default
                return { modelId: PAID_PREMIUM[0], source: 'paid_premium' };
            }

            // Priority 2: Free Extra Quota (Force Free)
            // Limit: 300,000 words (100 chapters equivalent)
            const FREE_EXTRA_LIMIT_WORDS = 300000;
            if (usage.freeExtraCount < FREE_EXTRA_LIMIT_WORDS) {
                return { modelId: this.getRandomFreeModel(), source: 'free' };
            }

            // If we are here, quota is exceeded. Service should have blocked this.
            // But as a fallback return free.
            return { modelId: this.getRandomFreeModel(), source: 'free' };
        }

        // --- TIER 1 & 2 LOGIC (Probabilistic Routing) ---
        if (tier === 'tier1' || tier === 'tier2') {
            const paidRatio = tier === 'tier1' ? 0.20 : 0.40; // 20% vs 40%
            const roll = Math.random();

            if (roll < paidRatio) {
                // Route to Paid Low Cost
                return { modelId: this.getRandomPaidLowCostModel(), source: 'paid_low' };
            } else {
                // Route to Free
                return { modelId: this.getRandomFreeModel(), source: 'free' };
            }
        }

        // --- FREE TIER (Default) ---
        // Always free
        return { modelId: this.getRandomFreeModel(), source: 'free' };
    }

    private getRandomFreeModel(): string {
        const index = Math.floor(Math.random() * FREE_MODELS.length);
        return FREE_MODELS[index];
    }

    private getRandomPaidLowCostModel(): string {
        const index = Math.floor(Math.random() * PAID_LOW_COST.length);
        return PAID_LOW_COST[index];
    }

    public isPremiumModel(modelId: string): boolean {
        // Simple check if it's not free
        return !FREE_MODELS.includes(modelId) && !modelId.endsWith(':free');
    }

    public getFreeModels() {
        return FREE_MODELS;
    }
}

export const balanceEngine = new BalanceEngineService();
