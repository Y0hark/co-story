
import fetch from 'node-fetch';

const GENRES = [
    { name: 'Thriller / Polar', words: 2500 }, // Max
    { name: 'Romance', words: 3000 },
    { name: 'Littérature Générale', words: 4000 }, // Max
    { name: 'Fantasy / Sci-Fi', words: 6000 }, // Max world building
    { name: 'Jeunesse (YA)', words: 3000 } // Max
];

// 1 Word ~ 1.3 Tokens
const TOKENS_PER_WORD = 1.33;
const ESTIMATED_INPUT_CONTEXT_WORDS = 2000; // Previous context, bio, style, instructions
const INPUT_TOKENS = ESTIMATED_INPUT_CONTEXT_WORDS * TOKENS_PER_WORD;

const TARGET_MODELS = [
    'google/gemini-1.5-flash',
    'openai/gpt-4o-mini',
    'anthropic/claude-3-haiku',
    'liquid/lfm-40b' // Liquid is also low cost often
];

async function main() {
    console.log("Fetching current pricing from OpenRouter...");
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        const data = await response.json();
        const allModels = data.data;

        const relevantModels = allModels.filter((m: any) => TARGET_MODELS.includes(m.id) || m.id.includes('flash') || m.id.includes('mini'));

        // Let's filter to just the specific ones we want to compare for clarity, plus maybe 'google/gemini-1.5-pro' for comparison
        const displayModels = allModels.filter((m: any) =>
            ['google/gemini-1.5-flash', 'openai/gpt-4o-mini', 'anthropic/claude-3-haiku', 'google/gemini-2.0-flash-exp:free'].some(t => m.id.includes(t))
        );

        console.log(`\nAssumptions:`);
        console.log(`- 1 Word = ${TOKENS_PER_WORD} Tokens`);
        console.log(`- Input Context Overhead: ~${ESTIMATED_INPUT_CONTEXT_WORDS} words (` + Math.round(INPUT_TOKENS) + ` tokens)`);
        console.log(`- Prices are per 1 Million Tokens`);

        console.log('\n--- ESTIMATED COST PER CHAPTER ---');

        for (const model of displayModels.slice(0, 5)) { // Limit to 5 variations
            const priceIn = parseFloat(model.pricing.prompt) * 1000000;
            const priceOut = parseFloat(model.pricing.completion) * 1000000;

            console.log(`\nMODEL: ${model.name} (${model.id})`);
            console.log(`  Pricing: Input $${priceIn.toFixed(2)}/1M, Output $${priceOut.toFixed(2)}/1M`);

            for (const genre of GENRES) {
                const outputTokens = genre.words * TOKENS_PER_WORD;
                const totalInputCost = (INPUT_TOKENS / 1000000) * priceIn;
                const totalOutputCost = (outputTokens / 1000000) * priceOut;
                const totalCost = totalInputCost + totalOutputCost;

                console.log(`  - ${genre.name.padEnd(25)} (${genre.words} words): $${totalCost.toFixed(5)}`);
            }
        }

    } catch (e) {
        console.error("Error fetching models:", e);
    }
}

main();
