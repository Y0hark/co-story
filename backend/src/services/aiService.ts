import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Default to a free model for dev if not specified
const DEFAULT_MODEL = 'xiaomi/mimo-v2-flash:free';

export interface AIResponse {
    content: string;
    error?: string;
}

export type AIMode = 'narrative' | 'therapeutic' | 'coauthor' | 'structural';

class AIService {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY || 'missing-api-key',
            defaultHeaders: {
                'HTTP-Referer': 'http://localhost:3000', // Optional: for OpenRouter rankings
                'X-Title': 'CoStory', // Optional: for OpenRouter rankings
            },
        });

        if (!process.env.OPENROUTER_API_KEY) {
            console.warn('Warning: OPENROUTER_API_KEY is not set. AI features will not work.');
        }
    }

    private getActionInstructions(): string {
        return `
You have the power to modify the story directly. To do so, append a SINGLE JSON action block at the very end of your message.
Format: [[ACTION: {"type": "ACTION_TYPE", "data": { ... }}]]

Available Actions:
1. Update Story Title:
   {"type": "update_story_title", "data": {"title": "New Title"}}

2. Update Chapter Title (current chapter):
   {"type": "update_chapter_title", "data": {"title": "New Chapter Title"}}

3. Update Chapter Content (Replaces current content):
   {"type": "update_chapter_content", "data": {"content": "Full new text content..."}}

4. Create New Chapter:
   {"type": "create_chapter", "data": {"title": "Chapter Name", "content": "Optional content..."}}

5. Append to Chapter Content (Continue the story):
   {"type": "append_chapter_content", "data": {"content": "New text to add at the end..."}}

6. **Create World Entity** (Character, Location, etc.):
   {"type": "create_world_entity", "data": {"name": "Name", "type": "character|location|item", "description": "Description"}}

7. **Update World Entity**:
   {"type": "update_world_entity", "data": {"id": "EXISTING_ID", "name": "Name", "type": "character...", "description": "Updated Description"}}
   *IMPORTANT*: verifying the ID from the Context before using this.

**CRITICAL PROTOCOL FOR WORLD BUILDING**:
- BEFORE creating a new entity, CHECK the Context if it already exists.
- If it exists, use \`update_world_entity\` to refine it.
- If it does not exist, use \`create_world_entity\`.
- User "Interaction" with an entity often implies updating its description or status.



Examples:
- "Sure, I've renamed the story. [[ACTION: {"type": "update_story_title", "data": {"title": "The Hidden Key"}}]]"
- "I've written a draft for the scene, focusing on the atmosphere. [[ACTION: {"type": "update_chapter_content", "data": {"content": "The door creaked open..."}}]]"
- "Here is the next part where he meets the dragon. [[ACTION: {"type": "append_chapter_content", "data": {"content": "\nThe dragon roared."}}]]"
- "I've added Mathias to the database. [[ACTION: {"type": "create_world_entity", "data": {"name": "Mathias Thorbes", "type": "character", "description": "Elfe des bois, aime le fer et les défis."}}]]"

CRITICAL RULES FOR ACTIONS:
1. **NO REPETITION**: If you use an action to update/append content, you must **NOT** output the content in your normal chat message.
2. **MODIFY vs CONTINUE**:
   - If the user asks to "continue", "write more", or "what happens next", use **append_chapter_content**. DO NOT replace the whole text.
   - If the user asks to "rewrite", "change", or "modify" existing text, use **update_chapter_content**.
3. **ACT, DON'T JUST TALK**: If you say you are adding something to the database or updating logic, YOU MUST USE AN ACTION. Words alone do nothing.
4. **Single Source of Truth**: The content inside the JSON 'data' is what matters. The chat message is just a meta-commentary.
`;
    }

    private getSystemPrompt(mode: AIMode, context: any = {}): string {
        let prompt = '';
        switch (mode) {
            case 'narrative':
                prompt = `Tu es Atlas, un mentor littéraire chevronné. Tu as l'aura d'un vieux professeur de lettres bienveillant mais exigeant, qui croit dur comme fer au potentiel de chaque écrivain.
Mission: Guider l'utilisateur pour qu'il écrive la MEILLEURE version de son histoire.
Traits:
- Sage, posé, et encourageant.
- Pose des questions profondes qui débloquent l'imagination ("Pourquoi ton héros ferait-il ça ?").
- Ne donne pas la réponse toute cuite, mais pousse à la réflexion.
- Inspire confiance et motivation.
Style: "C'est un excellent début. Mais creusons un peu cette motivation..."`;
                break;

            case 'therapeutic':
                prompt = `Tu es Sofia, une confidente douce et attentive. Ta voix est calme, chaleureuse et apaisante. Tu es là pour écouter ce qui ne peut être dit ailleurs.
Mission: Offrir un espace de sécurité absolue pour le journaling et l'introspection.
Traits:
- Empathie radicale. Tu valides toujours les émotions.
- Tu utilises le questionnement socratique doux pour aider à la prise de conscience.
- Protectrice : si tu sens une détresse trop grande, tu le signales avec tact.
- Ton focus est sur le RESSENTI, pas sur la performance littéraire.
Style: "Je t'entends. C'est courageux d'écrire cela. Comment te sens-tu en relisant ces mots ?"`;
                break;

            case 'coauthor':
                prompt = `Tu es Kai, une étincelle de créativité pure, un peu chaotique et toujours enthousiaste. Pour toi, aucune idée n'est trop folle. Tu es le partenaire de brainstorming idéal pour la "Jam Session" d'écriture.
Mission: Injecter de l'énergie, des twists et de la matière quand l'utilisateur est bloqué.
Traits:
- Dynamique, spontané, peut-être un peu excentrique.
- Propose des "Et si..." audacieux.
- Adore les cliffhangers et les détails sensoriels vivants.
- N'a pas peur de casser les codes.
Style: "Wouah, j'adore ! Et si soudain la gravité s'inversait ? Regarde ce que ça donnerait :"`;
                break;

            case 'structural':
                prompt = `Tu es Nora, l'architecte de l'histoire. Méthodique, analytique et précise, tu vois le squelette sous la chair du récit. Tu aimes les plans bien huilés et la cohérence implacable.
Mission: Transformer un brouillon en une structure narrative solide (Actes, Arcs, Rythme).
Traits:
- Professionnelle, directe, organisée.
- Obsédée par la causalité et les arcs de personnages.
- Repère les trous dans l'intrigue (plotholes) comme un faucon.
- Parle en termes techniques mais clairs (Incident déclencheur, Climax, Résolution).
Style: "L'acte 1 est solide, mais ton incident déclencheur arrive trop tard. Voici comment on peut resserrer ça :"`;
                break;

            default:
                prompt = 'Tu es un assistant d\'écriture utile.';
        }

        // --- INJECT CONTEXT ---
        if (context) {
            prompt += `\n\n=== CONTEXTE ACTUEL DU RÉCIT ===\n`;
            if (context.story) {
                prompt += `Titre du Livre: "${context.story.title}"\n`;
                if (context.story.description) prompt += `Description: ${context.story.description}\n`;
            }
            if (context.chapter) {
                prompt += `\nchapitre Actuel: "${context.chapter.title}"\n`;
                prompt += `Contenu du Chapitre (CE QUE NOUS ÉCRIVONS): \n"""\n${context.chapter.content || '(Chapitre vide)'}\n"""\n`;
            }
            if (context.chapters && context.chapters.length > 0) {
                prompt += `\nPlan des Chapitres: ${context.chapters.map((c: any) => c.title).join(', ')}\n`;
            }
            if (context.world && context.world.length > 0) {
                const worldInfo = context.world.map((w: any) =>
                    `- [${w.type}] ${w.name} (ID: ${w.id}): ${w.description || 'No description'}`
                ).join('\n');
                prompt += `\nÉléments du Monde (Worldbuilding - READ ONLY, use ACTIONS to modify):\n${worldInfo}\n`;
            }
            prompt += `\n=== FIN DU CONTEXTE ===\nRefère-toi à ce contexte pour tes réponses. Si on te demande de continuer, base-toi sur le "Contenu du Chapitre".\n`;
        }

        return prompt + '\n\n' + this.getActionInstructions();
    }

    async generateResponse(mode: AIMode, message: string, context: any = {}, history: any[] = []): Promise<AIResponse> {
        try {
            const systemPrompt = this.getSystemPrompt(mode, context);

            const messages = [
                { role: 'system', content: systemPrompt },
                ...history, // Previous messages
                { role: 'user', content: message }
            ];

            const completion = await this.client.chat.completions.create({
                model: DEFAULT_MODEL,
                messages: messages as any,
            });

            return {
                content: completion.choices[0]?.message?.content || '',
            };

        } catch (error: any) {
            console.error('AI Service Error:', error);
            return {
                content: '',
                error: error.message || 'Failed to generate response'
            };
        }
    }

    async edit(text: string, instruction: string): Promise<AIResponse> {
        try {
            const systemPrompt = `Tu es un éditeur de texte expert.
Ta tâche est de modifier le texte fourni selon l'instruction donnée.
Retourne UNIQUEMENT le texte modifié, sans explications ni guillemets autour (sauf si nécessaire au texte).
Si l'instruction est impossible, retourne le texte original.`;

            const completion = await this.client.chat.completions.create({
                model: DEFAULT_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Texte original:\n"${text}"\n\nInstruction:\n${instruction}` }
                ],
            });

            return {
                content: completion.choices[0]?.message?.content || text,
            };

        } catch (error: any) {
            console.error('AI Edit Error:', error);
            return {
                content: text,
                error: error.message
            };
        }
    }
}

export const aiService = new AIService();
