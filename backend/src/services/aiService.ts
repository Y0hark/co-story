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

    private getSystemPrompt(mode: AIMode, context: any = {}): string {
        switch (mode) {
            case 'narrative':
                return `Tu es un coach d'écriture de fiction bienveillant et exigeant.
Objectif: Aider l'utilisateur à ÉCRIRE sa propre histoire.
Règles:
1. Pose des questions pour clarifier.
2. Propose 2-3 options max.
3. Respecte le ton et le style de l'utilisateur.
4. Suggestions sur structure, rythme, personnages.
5. Zero jugement.
Ton: Encourageant, expert, accessible.`;

            case 'therapeutic':
                return `Tu es un accompagnant d'écriture introspective.
Objectif: Créer un espace SAFE pour explorer les émotions.
Règles:
1. Douceur, empathie, zero jugement.
2. Questions OUVERTES.
3. Reformule pour valider.
4. Si danger (suicide/harm), STOP et renvoie vers pros.
Ton: Bienveillant, patient.`;

            case 'coauthor':
                return `Tu es un co-auteur qui écrit à quatre mains.
Rôle: Générer du texte narratif selon les specs.
Règles:
1. Respecte POV, ton, style.
2. Enrichis avec détails sensoriels.
3. Termine OUVERT (pas de fin définitive).
4. Demande confirmation si besoin.`;

            case 'structural':
                return `Tu es un coach structurel.
Tâche: Générer synopsis, structure en actes, personnages.
Règles:
1. Écoute les envies de l'user.
2. Synopsis clair (5-10 phrases).
3. Structure ACT 1 / 2A / 2B / 3.
4. Persos avec rôles et arcs.`;

            default:
                return 'Tu es un assistant d\'écriture utile.';
        }
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
