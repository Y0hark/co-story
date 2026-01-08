
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
    'google/gemini-2.0-flash-lite-preview-02-05:free': {
        id: 'google/gemini-2.0-flash-lite-preview-02-05:free',
        name: 'Gemini 2.0 Flash Lite (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'google/gemini-2.0-pro-exp-02-05:free': {
        id: 'google/gemini-2.0-pro-exp-02-05:free',
        name: 'Gemini 2.0 Pro Exp (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
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
    'mistralai/mistral-small-24b-instruct-2501:free': {
        id: 'mistralai/mistral-small-24b-instruct-2501:free',
        name: 'Mistral Small 24B (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'google/gemma-3-27b-it:free': {
        id: 'google/gemma-3-27b-it:free',
        name: 'Gemma 3 27B (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'meta-llama/llama-3.3-70b-instruct:free': {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        name: 'Llama 3.3 70B (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'qwen/qwen-2.5-7b-instruct:free': {
        id: 'qwen/qwen-2.5-7b-instruct:free',
        name: 'Qwen 2.5 7B (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'microsoft/phi-4:free': {
        id: 'microsoft/phi-4:free',
        name: 'Phi-4 (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'deepseek/deepseek-r1:free': {
        id: 'deepseek/deepseek-r1:free',
        name: 'DeepSeek R1 (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'huggingfaceh4/zephyr-7b-beta:free': {
        id: 'huggingfaceh4/zephyr-7b-beta:free',
        name: 'Zephyr 7B Beta (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'liquid/lfm-7b:free': {
        id: 'liquid/lfm-7b:free',
        name: 'Liquid LFM 7B (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'xiaomi/mimo-v2-flash:free': {
        id: 'xiaomi/mimo-v2-flash:free',
        name: 'Xiaomi Mimo v2 Flash (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'openai/gpt-oss-120b:free': {
        id: 'openai/gpt-oss-120b:free',
        name: 'GPT-OSS 120B (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'qwen/qwen3-coder:free': {
        id: 'qwen/qwen3-coder:free',
        name: 'Qwen3 Coder (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'mistralai/mistral-small-3.1-24b-instruct:free': {
        id: 'mistralai/mistral-small-3.1-24b-instruct:free',
        name: 'Mistral Small 3.1 (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
    },
    'z-ai/glm-4.5-air:free': {
        id: 'z-ai/glm-4.5-air:free',
        name: 'GLM 4.5 Air (Free)',
        pricing: { prompt: 0, completion: 0 },
        contextLength: 32000
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
        'xiaomi/mimo-v2-flash:free',
        'openai/gpt-oss-120b:free',
        'qwen/qwen3-coder:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'google/gemini-2.0-flash-exp:free',
        'mistralai/mistral-small-3.1-24b-instruct:free',
        'google/gemma-3-27b-it:free',
        'z-ai/glm-4.5-air:free',
        'google/gemini-2.0-flash-lite-preview-02-05:free',
        'google/gemini-2.0-pro-exp-02-05:free',
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
