
import { AIModelConfig, LISTED_MODELS, MODEL_TIERS } from '../config/ai_models';
import fetch from 'node-fetch';

class AIModelService {
    private models: Record<string, AIModelConfig> = { ...LISTED_MODELS };
    private healthyModels: Set<string> = new Set(Object.keys(LISTED_MODELS));
    private rateLimitBlacklist: Map<string, number> = new Map(); // ModelID -> ExpiryTimestamp

    constructor() {
        // Optimistically fetch latest data from OpenRouter on boot
        this.updateModelData();

        // Refresh every hour
        setInterval(() => this.updateModelData(), 1000 * 60 * 60);
    }

    /**
     * Updates local model registry with latest pricing and context info from OpenRouter.
     */
    private async updateModelData() {
        try {
            console.log("Updating AI Model data from OpenRouter...");
            const response = await fetch('https://openrouter.ai/api/v1/models');
            if (!response.ok) return;

            const data: any = await response.json();
            const remoteModels = data.data || [];

            for (const remote of remoteModels) {
                // If we track this model, update its details
                if (this.models[remote.id]) {
                    this.models[remote.id].pricing = {
                        prompt: parseFloat(remote.pricing.prompt) * 1000000,
                        completion: parseFloat(remote.pricing.completion) * 1000000
                    };
                    this.models[remote.id].contextLength = remote.context_length;
                }
            }
            console.log("AI Model data updated.");
        } catch (e) {
            console.warn("Failed to update AI model data:", e);
        }
    }

    public getModelConfig(modelId: string): AIModelConfig | undefined {
        return this.models[modelId];
    }

    /**
     * Marks a model as rate-limited for 24 hours.
     */
    public markModelAsRateLimited(modelId: string) {
        // 24 hours from now
        const expiry = Date.now() + (24 * 60 * 60 * 1000);
        this.rateLimitBlacklist.set(modelId, expiry);
        console.log(`Model ${modelId} pushed to rate-limit blacklist until ${new Date(expiry).toISOString()}`);
    }

    public isRateLimited(modelId: string): boolean {
        const expiry = this.rateLimitBlacklist.get(modelId);
        if (!expiry) return false;
        if (Date.now() > expiry) {
            this.rateLimitBlacklist.delete(modelId);
            return false;
        }
        return true;
    }

    /**
     * selection logic:
     * 1. Get models for tier.
     * 2. Filter out excluded models (e.g. failed ones OR rate-limited ones).
     * 3. Return the best one (first one).
     */
    public getBestModel(tier: string = 'free', excludedIds: string[] = []): AIModelConfig {
        const candidates = (MODEL_TIERS as any)[tier] || MODEL_TIERS['free'];

        for (const modelId of candidates) {
            // Check session exclusions AND global blacklist
            if (!excludedIds.includes(modelId) && !this.isRateLimited(modelId)) {
                // Return valid config if exists
                if (this.models[modelId]) {
                    return this.models[modelId];
                }
            }
        }

        // Fallback: If all unavailable, specifically find one that is NOT blacklisted if possible
        for (const modelId of candidates) {
            if (this.models[modelId] && !this.isRateLimited(modelId)) {
                return this.models[modelId];
            }
        }

        // If EVERYTHING is blacklisted/excluded, just return the default fallback to try our luck
        const fallbackId = candidates[0] || 'google/gemini-2.0-flash-exp:free';
        return this.models[fallbackId] || LISTED_MODELS['google/gemini-2.0-flash-exp:free'];
    }

    public getCost(modelId: string, inputTokens: number, outputTokens: number): number {
        const model = this.models[modelId];
        if (!model) return 0;

        const inputCost = (inputTokens / 1000000) * model.pricing.prompt;
        const outputCost = (outputTokens / 1000000) * model.pricing.completion;
        return inputCost + outputCost;
    }
}

export const aiModelService = new AIModelService();
