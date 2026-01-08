
export interface Assistant {
    id: string;
    name: string;
    role: string;
    description: string;
    avatarBg: string; // Tailwind class
    avatarText: string; // Tailwind class
    locked?: boolean;
    lockReason?: string;
    mode: 'guided' | 'journal' | 'both';
}

export const ASSISTANTS: Assistant[] = [
    {
        id: 'coauthor',
        name: 'Kai',
        role: 'Co-Author',
        description: "A chaotic creative spark to brainstorm ideas and twists. Best for getting unstuck.",
        avatarBg: 'bg-violet-100',
        avatarText: 'text-violet-600',
        mode: 'guided'
    },
    {
        id: 'structural',
        name: 'Nora',
        role: 'Structural Editor',
        description: "A methodical architect to fix plot holes and pacing. Best for refining drafts.",
        avatarBg: 'bg-slate-100',
        avatarText: 'text-slate-600',
        mode: 'guided'
    },
    {
        id: 'narrative',
        name: 'Atlas',
        role: 'Narrative Coach',
        description: "A demanding but benevolent mentor who pushes you to write your best.",
        avatarBg: 'bg-teal-100',
        avatarText: 'text-teal-600',
        locked: true,
        lockReason: 'Available for Storytellers',
        mode: 'guided'
    },
    {
        id: 'therapeutic',
        name: 'Sofia',
        role: 'Empathetic Partner',
        description: "A private, non-judgmental space to explore your feelings and blocks.",
        avatarBg: 'bg-amber-100',
        avatarText: 'text-amber-600',
        mode: 'journal'
    }
];
