function getTier(priceId: string): string {
    let tier = 'pro'; // Default fallback
    if (priceId === 'price_1SnKNH7uiRaz63ESwhD0EgQO') tier = 'scribe';
    else if (priceId === 'price_1SnKNn7uiRaz63ESPeIERk7t') tier = 'storyteller';
    else if (priceId === 'price_1SnKOB7uiRaz63ESrUpiLHyh') tier = 'architect';

    return tier;
}

console.log('Testing Tier Logic:');
console.log('Scribe ID:', getTier('price_1SnKNH7uiRaz63ESwhD0EgQO'));
console.log('Storyteller ID:', getTier('price_1SnKNn7uiRaz63ESPeIERk7t'));
console.log('Architect ID:', getTier('price_1SnKOB7uiRaz63ESrUpiLHyh'));
console.log('Unknown ID:', getTier('price_unknown'));
