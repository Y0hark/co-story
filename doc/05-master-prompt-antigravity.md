# 🎯 Master Prompt pour Antigravity IDE – CoStory

## Contexte du Projet

**CoStory** est une plateforme web de **co-création d'histoires par IA**. 

**Vision:** Permettre aux utilisateurs d'écrire AVEC une IA (pas remplacée par), dans un espace bienveillant et sécurisé, pour fiction, journaling thérapeutique, et légacies personnels.

**Stack attendue:** Vue 3 + Vite (frontend) + Node.js/Express (backend) + PostgreSQL

---

## 📋 Briefing Complet pour Antigravity

### 1. Objectifs du MVP (M1–M4)

✅ **Frontend:**
- Landing page attrayante ("co-création, pas génération")
- Auth (register/login) simple
- Wizard de création de projet (type, filtres, paramètres)
- Studio d'écriture (éditeur texte + chat IA côté droit)
- Publication basique (privé, lien, public)
- Affichage & gestion des crédits

✅ **Backend:**
- API REST pour stories, chapters, AI sessions
- Proxy sécurisé vers OpenRouter (LLM + image gen futur)
- Gestion des tokens/credits (déduction par appel IA)
- Auth (JWT)
- Logs de consommation (pour billing)

✅ **Database:**
- Schema PostgreSQL fourni (users, stories, chapters, ai_sessions, ai_messages, tokens_usage)
- Indexes sur user_id, story_id, created_at
- Relationships + cascade deletes

✅ **UX/Design:**
- Thème sombre doux (charcoal + teal accent)
- Minimalisme, focus sur texte (typographie lecture)
- Affichage transparent des coûts tokens

---

### 2. User Flows Clés

#### Flow 1: Arrivée → Création Projet

```
Landing → [CTA "Commencer"] → Auth (Register/Login)
  ↓
Wizard 4 steps:
  Step 1: Type projet (fiction, journal, legacy, roleplay)
  Step 2: Vrai ou fictif?
  Step 3: But (thérapeutique, trace, communauté, jeu)
  Step 4: Thème, époque, ton, POV
  ↓
Studio d'écriture (première session créée)
```

#### Flow 2: Écriture avec Coach IA

```
Dans Studio:
  Gauche: Éditeur texte (autosave, word count)
  Droite: Chat IA (sélectable: Coach Narratif, Coach Thérapeutique, Co-auteur, Coach Structurel)
  
User peut:
  - Poser des questions au coach
  - Demander "Générer suite" / "Reformuler passage"
  - Voir coût estimé AVANT génération
  - Accepter ou itérer sur réponse IA
  
Chaque appel IA = déduction de crédits
```

#### Flow 3: Publication

```
Story → [Publish Button] → Choose visibility:
  - Privé (default, juste user voit)
  - Link (partageable via URL)
  - Public (listed, commentable, likeable)
```

---

### 3. Spécifications Techniques Détaillées

#### 3.1 Frontend Structure (Vue 3 + Vite)

**Pages principales:**
- `/` – Landing
- `/auth/register` – Register
- `/auth/login` – Login
- `/studio/new` – Create project wizard
- `/studio/:id` – Editor + AI chat (main experience)
- `/library` – User's stories
- `/story/:id` – Public story reader
- `/settings` – Profile + billing
- `/author/:userId` – Author profile

**Composants critiques:**
```
├── components/
│   ├── Editor.vue (éditeur texte avec autosave)
│   ├── AIChat.vue (chat avec sélecteur de mode)
│   ├── CreateWizard.vue (4 steps)
│   ├── TokenDisplay.vue (balance + coût estimé)
│   └── StoryCard.vue (card pour listing)
├── services/
│   ├── api.ts (axios base)
│   ├── ai.ts (appels IA via backend)
│   ├── stories.ts (CRUD stories)
│   └── auth.ts (JWT logic)
└── stores/ (Pinia)
    ├── auth.ts
    ├── editor.ts (currentStory, currentChapter, aiSession)
    └── ui.ts (notifications, modals)
```

**Styling:**
- Tailwind CSS
- Design system colors: charcoal-700/800 bg, teal-300/400 accent
- Typography: Geist (sans-serif UI), Lora (serif body text)
- Theme sombre par défaut, toggle light mode option

#### 3.2 Backend Structure (Node.js + Express)

**Routes:**
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

POST   /api/stories (create)
GET    /api/stories (user's list)
GET    /api/stories?visibility=public (browse)
GET    /api/stories/:id (detail)
PUT    /api/stories/:id (update metadata)
PATCH  /api/stories/:id/publish (change visibility)

POST   /api/stories/:id/chapters (create chapter)
PUT    /api/chapters/:id (update content)

POST   /api/ai/sessions (create session)
POST   /api/ai/sessions/:id/messages (send message to coach)
GET    /api/ai/sessions/:id (history)

GET    /api/billing/credits (balance)
POST   /api/billing/purchase (purchase credits – Stripe later)

POST   /api/stories/:id/like
POST   /api/stories/:id/comments
POST   /api/users/:id/follow
```

**Key Services:**
```typescript
// openrouterService.ts
- sendMessage(model, messages, systemPrompt)
- calculateCost(model, tokens)
- getModels() // list available

// storiesService.ts
- createStory(userId, metadata)
- updateChapter(storyId, chapterIndex, content)
- getStory(storyId)

// tokenService.ts
- trackUsage(userId, model, input_tokens, output_tokens)
- getBalance(userId)
- deductBalance(userId, amountUsd)
```

#### 3.3 Database

**Use attached schema** (voir 03-technical-architecture.md)

**Key tables:**
- `users` – Basic user data
- `stories` – Projects/stories
- `chapters` – Story content
- `ai_sessions` – IA conversation contexts
- `ai_messages` – Chat history
- `user_credits` – Balance tracking
- `tokens_usage` – Billing audit log

---

### 4. AI Modes & Prompts (4 modes)

**Mode 1: Coach Narratif**
- Aide fiction: structure, personnages, rythme, dialogue
- Génère ~800 mots MAX
- Termine par question invitant itération
- Tone: Encourageant, expert

**Mode 2: Coach Thérapeutique**
- Aide journaling/introspection
- Valide émotions, pose questions ouvertes
- Jamais diagnostic
- Alert si self-harm / suicide → urgence

**Mode 3: Co-auteur**
- Génère texte narratif selon specs
- Respecte strict: POV, tone, longueur
- Ouvert à itération
- "Tu veux que je change quelque chose?"

**Mode 4: Coach Structurel**
- À partir idée loose, génère:
  - Synopsis 5-10 phrases
  - Structure actes (3-6 parties)
  - Persos principaux + arcs
  - Questions pour raffiner

**Voir 04-ai-prompts.md pour prompts complets.**

---

### 5. Priorités Implémentation (Sprint-based)

#### Sprint 1: Foundation (Weeks 1-2)
- [ ] Monorepo/project setup (Vite + Express)
- [ ] PostgreSQL schema + migrations
- [ ] Basic auth (register, login, JWT)
- [ ] Landing page
- [ ] Create project wizard (4 steps)

#### Sprint 2: Core Editor (Weeks 2-3)
- [ ] Editor component (Vue + autosave)
- [ ] Story/chapter CRUD API
- [ ] Basic UI layout (split editor/sidebar)
- [ ] Token display component
- [ ] Styling (design system)

#### Sprint 3: AI Integration (Weeks 3-4)
- [ ] OpenRouter API key setup
- [ ] AI session creation
- [ ] AI chat component
- [ ] Mode selector
- [ ] Token cost calculation + display
- [ ] Integrate 4 prompts

#### Sprint 4: Social + Polish (Weeks 4-5)
- [ ] Publication (private/link/public)
- [ ] Story reader page
- [ ] Comments, likes, follow
- [ ] User library
- [ ] Settings page
- [ ] Error handling + edge cases

#### Sprint 5: Polish + Testing (Weeks 5+)
- [ ] E2E testing
- [ ] Performance optimization
- [ ] Accessibility review
- [ ] Closed beta with 100 users
- [ ] Feedback iteration

---

### 6. Mockups Textuels (Wireframes)

#### Landing Page
```
┌────────────────────────────────────────────┐
│  Logo "CoStory"  [Login] [Register]      │
├────────────────────────────────────────────┤
│                                            │
│  Écrivez votre histoire avec l'IA          │
│  Pas générée. Co-créée.                    │
│                                            │
│  [Commencer à écrire →]                    │
│                                            │
│  3 features highlights:                    │
│  🤝 Co-création  🔒 Privé  📚 Partage      │
│                                            │
│  [Footer: About / Pricing / Contact]       │
└────────────────────────────────────────────┘
```

#### Studio Editor
```
┌─── ← Lib | Project Title | [Saved] | ⚙️ ────┐
├────────────────────────────────────────────┤
│                                            │
│  EDITOR (60%)      │   AI CHAT (40%)       │
│                    │                      │
│  [Ch. 1 Title]     │  [Mode: Coach Narr.] │
│                    │                      │
│  My story text     │  Coach: Quelques q's │
│  [editable]        │                      │
│  ...               │  [Chat history]      │
│                    │                      │
│  WC: 1,245         │  💬 Your message     │
│  [+ Chapter]       │  [Send] [✨ Gen.]    │
│                    │                      │
│                    │  💰 45.20 EUR / ~... │
└────────────────────────────────────────────┘
```

#### Create Wizard (Step 3 Example)
```
┌──────────────────────────────────────────┐
│  CoStory — Step 3/4: But principal     │
├──────────────────────────────────────────┤
│                                          │
│  Quel est le but principal de cette      │
│  histoire?                               │
│                                          │
│  ☐ Thérapeutique / Exploration émot.    │
│  ☐ Laisser une trace pour famille       │
│  ☐ Être lu par une communauté           │
│  ☐ Jeu de rôle / Collaborative          │
│                                          │
│          [← Retour] [Suivant →]          │
└──────────────────────────────────────────┘
```

---

### 7. OpenRouter Integration Details

**Models à supporter initialement:**
- `claude-3.5-sonnet` (best all-around)
- `gpt-4o` (faster, good cost)
- `mistral-large` (cheapest)
- `gpt-4o-mini` (image description, cheap)

**Pricing (Jan 2026):**
- Claude 3.5 Sonnet: $0.003/1k input, $0.015/1k output
- GPT-4o: $0.005/1k input, $0.015/1k output
- Mistral: $0.002/1k input, $0.006/1k output

**Cost Display Logic:**
```typescript
estimateCost(model, estimatedOutputTokens) {
  const rates = { /* ... */ }
  return (estimatedOutputTokens / 1000) * rates[model].output
}

// Before generation:
console.log(`Coût estimé: ${estimateCost(...).toFixed(2)} EUR`)
```

---

### 8. Error Handling & Edge Cases

**Network errors:**
- OpenRouter down → "Serveur IA indisponible. Réessaie dans 30s."
- User offline → Cache chapter draft locally

**Credit errors:**
- Insufficient credits → "Crédits insuffisants. [Acheter →]"
- Card declined → "Paiement échoué. [Réessayer →]"

**Content safety:**
- Mentions self-harm → Stop, show emergency numbers
- Hate/abuse content → Flag + moderate
- Spam/ads → Auto-remove, user banned

**Concurrency:**
- User edits same chapter from 2 tabs → Last-write-wins + conflict notification

---

### 9. Testing Strategy

**Unit tests:**
- Auth (JWT generation, validation)
- Token calculations
- Date formatting
- Validation functions

**Integration tests:**
- Create story → create session → send message → deduct credits
- Register → login → publish story
- OpenRouter API calls (mock)

**E2E tests:**
- New user flow (register → wizard → editor → publish)
- Chat flow (send message → see response → cost deducted)
- Error handling (insufficient credits, network error)

---

### 10. Monitoring & Debugging

**Logs to track:**
- API requests (method, route, status, latency)
- OpenRouter calls (model, tokens in/out, cost)
- Token usage per user (daily)
- Errors (stacktraces)

**Dashboards useful:**
- User signups/DAU/retention
- Average tokens/user/day
- OpenRouter cost/day
- Error rates

---

### 11. Deployment & DevOps

**Docker:**
- Monolith: Node + Vite build in one container
- DB: Supabase (managed PostgreSQL)

**CI/CD:**
- GitHub Actions: Test → Build → Deploy to Railway/Vercel
- Env vars: OPENROUTER_API_KEY, DATABASE_URL, JWT_SECRET

**Monitoring:**
- Sentry for error tracking
- DataDog / LogRocket for performance
- Stripe webhooks for billing

---

### 12. Post-MVP Features (M6+)

- 📷 Image generation (FLUX.2 via OpenRouter)
- 🔄 Collaborative editing
- 📊 Analytics for authors
- 🎵 Audio narration (TTS)
- 📱 Mobile app (React Native or Flutter)
- 🤝 Partnership integrations (psychologists, coaches)

---

### 13. Key Success Metrics

- **Acquisition:** 100 DAU by M3 beta
- **Engagement:** 20%+ weekly retention
- **Monetization:** 10%+ of active users buying credits
- **Token burn:** <$10k/month on OpenRouter (at 1k DAU)
- **Support:** <5% support tickets (good UX)

---

### 14. Communication & Handoff

**Deliverables from Antigravity:**
1. Clean git repo (monorepo or separate frontend/backend)
2. README with:
   - Setup instructions
   - Env var config
   - Database migrations
   - API docs (OpenAPI/Swagger)
   - Component library (Storybook optional)
3. Deployed MVP (staging URL)
4. Test coverage report
5. Performance metrics (bundle size, API response times)

**Your role (après Antigravity):**
- Launch closed beta
- Gather feedback
- Iterate on UX/pricing
- Scale infrastructure

---

## 🚀 Ton Directeur pour Antigravity

> "Tu construis une webapp de co-création d'histoires par IA. L'utilisateur arrive, crée une histoire (fiction, journal, legacy), puis écrit avec une IA comme coach/partenaire (pas générateur full).
>
> L'IA répond via OpenRouter. L'user pay-as-you-go en tokens. 
>
> Core features: Éditeur + chat IA (4 modes selectable), publication privé/public, social (like/comment/follow), transparent token costs.
>
> Stack: Vue 3 + Node + PostgreSQL. Simple, clean, minimaliste. Thème sombre, focus sur texte.
>
> Livrable: Clean MVP ready for closed beta. Well-documented. Performant."

---

## 📚 Fichiers de Référence (à adapter)

Voir les fichiers markdown fournis:
- `01-market-analysis.md` – Contexte marché
- `02-product-spec.md` – Spec produit détaillée
- `03-technical-architecture.md` – Architecture tech complète
- `04-ai-prompts.md` – Tous les prompts IA

---

*Master Prompt v1.0 – Janvier 2026*

**Ready to hand to Antigravity. Bon courage! 🚀**
