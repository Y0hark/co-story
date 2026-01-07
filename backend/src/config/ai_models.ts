
export interface AIModelConfig {
    id: string;
    name: string;
    description?: string;
    pricing: {
        prompt: number; // Cost per 1M tokens (standardize) or per token? OpenRouter gives per token.
        completion: number;
    };
    contextLength: number;
}

export interface ModelTierConfig {
    free: string[];
    standard: string[];
    premium: string[];
}

export const LISTED_MODELS: Record<string, AIModelConfig> = {
    // FREE TIER
    'google/gemini-2.0-flash-exp:free': {
        id: 'google/gemini-2.0-flash-exp:free',
        name: 'Gemini 2.0 Flash (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'meta-llama/llama-3.2-3b-instruct:free': {
        id: 'meta-llama/llama-3.2-3b-instruct:free',
        name: 'Llama 3.2 3B (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 4096
    },

    // STANDARD / PREMIUM TIER (Paid)
    'anthropic/claude-3.5-sonnet': {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        pricing: { prompt: 3, completion: 15 }, // Per 1M tokens (approx)
        contextLength: 200000
    },
    'openai/gpt-4o': {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        pricing: { prompt: 2.5, completion: 10 }, // Per 1M tokens (approx)
        contextLength: 128000
    },
    'google/gemini-pro-1.5': {
        id: 'google/gemini-pro-1.5',
        name: 'Gemini 1.5 Pro',
        pricing: { prompt: 1.25, completion: 3.75 },
        contextLength: 1000000
    }
};

export const MODEL_TIERS: ModelTierConfig = {
    free: [
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3.2-3b-instruct:free'
    ],
    standard: [
        'google/gemini-pro-1.5',
        'anthropic/claude-3.5-sonnet'
    ],
    premium: [
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4o'
    ]
};
