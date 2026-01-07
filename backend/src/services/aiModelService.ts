
import { AIModelConfig, LISTED_MODELS, MODEL_TIERS } from '../config/ai_models';
import fetch from 'node-fetch';

class AIModelService {
    private models: Record<string, AIModelConfig> = { ...LISTED_MODELS };
    private healthyModels: Set<string> = new Set(Object.keys(LISTED_MODELS));

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

                    // Also partial name update if we want? nah, keep friendly name.
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
     * selection logic:
     * 1. Get models for tier.
     * 2. Filter out excluded models (e.g. failed ones).
     * 3. Return the best one (first one).
     */
    public getBestModel(tier: string = 'free', excludedIds: string[] = []): AIModelConfig {
        const candidates = (MODEL_TIERS as any)[tier] || MODEL_TIERS['free'];

        for (const modelId of candidates) {
            if (!excludedIds.includes(modelId)) {
                // Return valid config if exists
                if (this.models[modelId]) {
                    return this.models[modelId];
                }
            }
        }

        // Fallback: If all unavailable, return the first one anyway to try, or default to free
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
