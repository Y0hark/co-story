# 💻 Architecture Technique – CoStory

## 1. Stack & Principes Généraux

### Stack Tech
- **Frontend:** Vue 3 + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js (Express ou Fastify) + TypeScript
- **Database:** PostgreSQL (Supabase optional)
- **External Services:** OpenRouter (LLM + image generation)
- **Auth:** JWT (self-managed ou Auth0)
- **Deployment:** Docker + Vercel/Railway (frontend + backend)

### Architecture Pattern
- **Monorepo ou monolith simple?** Monolith + séparation frontend/backend clair (Vue SPA + Node API)
- **API Style:** REST (simpler pour cette échelle)
- **Real-time?** Non prioritaire (websockets optionnel M2+)

---

## 2. Base de Données – Schema PostgreSQL

```sql
-- 1. Users & Auth
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- 2. Projects (stories)
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  mode VARCHAR(32) NOT NULL, -- 'fiction', 'journal', 'legacy', 'roleplay'
  is_public BOOLEAN DEFAULT FALSE,
  visibility VARCHAR(32) DEFAULT 'private', -- 'private', 'link', 'public'
  share_token TEXT UNIQUE, -- for link-based sharing
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_stories_user ON stories(user_id);
CREATE INDEX idx_stories_visibility ON stories(visibility);

-- 3. Story Metadata (thèmes, filtres, params)
CREATE TABLE story_metadata (
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  theme VARCHAR(64), -- 'sci-fi', 'fantasy', 'romance', 'slice-of-life', etc.
  is_real BOOLEAN, -- true = vrai / journal, false = fictif
  purpose VARCHAR(64), -- 'therapeutic', 'legacy', 'community-read', 'roleplay'
  era VARCHAR(64), -- 'contemporary', 'future', 'historical', 'timeless'
  writing_style VARCHAR(64), -- 'light', 'serious', 'poetic', 'introspective', 'epic'
  pov VARCHAR(32), -- 'first', 'second', 'third', 'omniscient'
  PRIMARY KEY (story_id)
);

-- 4. Chapters
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_index INT NOT NULL,
  title TEXT,
  content TEXT, -- Markdown or plain text
  word_count INT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_chapters_story ON chapters(story_id, chapter_index);

-- 5. AI Sessions (conversations IA per story)
CREATE TABLE ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  mode VARCHAR(32) NOT NULL, -- 'narrative-coach', 'therapeutic-coach', 'coauthor', 'structural'
  context_window TEXT, -- JSON stringified context (last N messages for continuity)
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_ai_sessions_story ON ai_sessions(story_id);

-- 6. AI Messages (chat history)
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  role VARCHAR(16) NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  input_tokens INT,
  output_tokens INT,
  cost_usd NUMERIC(10, 4),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_ai_messages_session ON ai_messages(session_id, created_at);

-- 7. Tokens Usage (billing)
CREATE TABLE tokens_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type VARCHAR(32), -- 'ai-coach', 'image-gen', etc.
  model VARCHAR(128), -- 'claude-3.5-sonnet', 'gpt-4o', etc.
  input_tokens INT,
  output_tokens INT,
  cost_usd NUMERIC(10, 4),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_tokens_user ON tokens_usage(user_id, created_at);

-- 8. User Credits (balance)
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_usd NUMERIC(10, 4) DEFAULT 0,
  lifetime_spent_usd NUMERIC(10, 4) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now()
);

-- 9. Social: Likes
CREATE TABLE story_likes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (user_id, story_id)
);

-- 10. Social: Comments
CREATE TABLE story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_comments_story ON story_comments(story_id, created_at);

-- 11. Social: Follows
CREATE TABLE user_follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- 12. Reading Lists
CREATE TABLE reading_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE reading_list_items (
  list_id UUID NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (list_id, story_id)
);
```

---

## 3. Frontend Architecture (Vue 3 / Vite)

### Directory Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── design-system.css
│   │   │   └── typography.css
│   │   └── icons/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.vue
│   │   │   ├── Modal.vue
│   │   │   ├── Input.vue
│   │   │   └── Card.vue
│   │   ├── layout/
│   │   │   ├── Header.vue
│   │   │   ├── Sidebar.vue
│   │   │   └── MainLayout.vue
│   │   ├── studio/
│   │   │   ├── Editor.vue
│   │   │   ├── AIChat.vue
│   │   │   ├── ChapterNav.vue
│   │   │   └── TokenDisplay.vue
│   │   └── social/
│   │       ├── StoryCard.vue
│   │       ├── CommentSection.vue
│   │       └── FollowButton.vue
│   ├── pages/
│   │   ├── Landing.vue
│   │   ├── Auth/
│   │   │   ├── Login.vue
│   │   │   └── Register.vue
│   │   ├── Studio/
│   │   │   ├── StudioView.vue
│   │   │   ├── CreateProjectWizard.vue
│   │   │   └── EditorPage.vue
│   │   ├── Story/
│   │   │   ├── StoryView.vue (public read)
│   │   │   └── StoryLibrary.vue (user library)
│   │   ├── Settings/
│   │   │   ├── Profile.vue
│   │   │   └── Billing.vue
│   │   └── Profile/
│   │       └── AuthorProfile.vue
│   ├── services/
│   │   ├── api.ts (base axios instance)
│   │   ├── auth.ts
│   │   ├── stories.ts
│   │   ├── ai.ts
│   │   ├── billing.ts
│   │   └── social.ts
│   ├── stores/ (Pinia)
│   │   ├── auth.ts
│   │   ├── editor.ts (current story/session state)
│   │   └── ui.ts (modals, notifications)
│   ├── types/
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── domain.ts
│   ├── utils/
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   └── tokens.ts (token cost calculation)
│   └── router/
│       └── index.ts
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

### Key Vue Components

#### 1. StudioView.vue (Main Editor)
```vue
<template>
  <MainLayout>
    <div class="studio-grid">
      <!-- Left: Editor -->
      <Editor 
        :story-id="storyId"
        :current-chapter="currentChapter"
        @save="handleSave"
        @chapter-change="handleChapterChange"
      />
      
      <!-- Right: AI Chat -->
      <AIChat 
        :session-id="aiSessionId"
        :balance="userBalance"
        @message="handleAIMessage"
      />
    </div>
  </MainLayout>
</template>
```

#### 2. Editor.vue
```vue
<template>
  <div class="editor-container">
    <div class="editor-header">
      <input v-model="chapterTitle" placeholder="Titre du chapitre" />
      <span class="word-count">{{ wordCount }} mots</span>
    </div>
    
    <textarea 
      v-model="content"
      class="editor-textarea"
      @input="handleInput"
      placeholder="Commencez à écrire..."
    ></textarea>
    
    <div class="editor-footer">
      <button @click="saveChapter" :disabled="saving">
        {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const content = ref('')
const chapterTitle = ref('')
const wordCount = ref(0)
const saving = ref(false)

const handleInput = () => {
  wordCount.value = content.value.split(/\s+/).filter(w => w).length
}

const saveChapter = async () => {
  saving.value = true
  try {
    // API call to save chapter
    await storiesService.updateChapter(props.storyId, props.currentChapter, {
      title: chapterTitle.value,
      content: content.value
    })
  } finally {
    saving.value = false
  }
}
</script>
```

#### 3. AIChat.vue
```vue
<template>
  <div class="ai-chat-container">
    <div class="chat-header">
      <select v-model="selectedMode" class="mode-select">
        <option value="narrative">Coach Narratif</option>
        <option value="therapeutic">Coach Thérapeutique</option>
        <option value="coauthor">Co-auteur</option>
        <option value="structural">Coach Structurel</option>
      </select>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="msg in messages"
        :key="msg.id"
        :class="['message', msg.role]"
      >
        <p>{{ msg.content }}</p>
      </div>
    </div>
    
    <div class="token-indicator">
      💰 {{ balance.toFixed(2) }} EUR | ~{{ tokenEstimate }} tokens
    </div>
    
    <div class="chat-input-area">
      <textarea 
        v-model="userInput"
        placeholder="Pose une question au coach..."
        @keydown.ctrl.enter="sendMessage"
      ></textarea>
      
      <div class="action-buttons">
        <button @click="sendMessage" :disabled="loading">
          {{ loading ? '⏳' : 'Envoyer' }}
        </button>
        <button @click="generateContinuation">✨ Générer suite</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { aiService } from '@/services/ai'

const messages = ref([])
const userInput = ref('')
const loading = ref(false)
const selectedMode = ref('narrative')
const balance = ref(0)

const sendMessage = async () => {
  loading.value = true
  try {
    const response = await aiService.sendMessage(props.sessionId, {
      role: 'user',
      content: userInput.value,
      mode: selectedMode.value
    })
    
    messages.value.push({
      id: Date.now(),
      role: 'user',
      content: userInput.value
    })
    
    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: response.message
    })
    
    balance.value -= response.costUsd
    userInput.value = ''
  } finally {
    loading.value = false
  }
}
</script>
```

### Pinia Stores

#### editor.ts (State Management)
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const currentStoryId = ref<string | null>(null)
  const currentChapter = ref(0)
  const chapters = ref<Chapter[]>([])
  const aiSessionId = ref<string | null>(null)
  const userBalance = ref(0)
  
  const currentChapterContent = computed(() => 
    chapters.value[currentChapter.value]?.content || ''
  )
  
  const loadStory = async (storyId: string) => {
    currentStoryId.value = storyId
    // Fetch story + chapters
    const story = await storiesService.getStory(storyId)
    chapters.value = story.chapters
  }
  
  return {
    currentStoryId,
    currentChapter,
    chapters,
    aiSessionId,
    userBalance,
    currentChapterContent,
    loadStory
  }
})
```

---

## 4. Backend Architecture (Node.js / Express)

### Directory Structure

```
backend/
├── src/
│   ├── index.ts (app entry)
│   ├── middleware/
│   │   ├── auth.ts (JWT verification)
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── stories.ts
│   │   ├── chapters.ts
│   │   ├── ai.ts
│   │   ├── billing.ts
│   │   └── social.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── storiesController.ts
│   │   ├── aiController.ts
│   │   └── billingController.ts
│   ├── services/
│   │   ├── openrouterService.ts (proxy to OpenRouter)
│   │   ├── authService.ts (JWT, passwords)
│   │   ├── storiesService.ts (DB queries)
│   │   ├── tokenService.ts (token usage tracking)
│   │   └── billingService.ts
│   ├── models/
│   │   ├── User.ts (Prisma or typed queries)
│   │   ├── Story.ts
│   │   ├── Chapter.ts
│   │   └── AISession.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── config/
│       ├── database.ts
│       └── env.ts
├── prisma/
│   └── schema.prisma (optional: if using Prisma ORM)
├── package.json
├── tsconfig.json
└── .env.example
```

### Express App Setup

```typescript
// src/index.ts
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Auth middleware
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      req.user = decoded
    } catch (err) {
      // Continue without user
    }
  }
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/stories', storiesRoutes)
app.use('/api/chapters', chaptersRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/social', socialRoutes)

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  })
})

app.listen(3001, () => console.log('Backend running on :3001'))
```

### Key Services

#### 1. OpenRouter Proxy (openrouterService.ts)

```typescript
import axios from 'axios'

export class OpenRouterService {
  private client = axios.create({
    baseURL: 'https://openrouter.ai/api/v1',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.APP_URL
    }
  })

  async sendMessage(
    model: string,
    messages: Array<{ role: string; content: string }>,
    systemPrompt?: string
  ) {
    const response = await this.client.post('/chat/completions', {
      model,
      messages: systemPrompt 
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages,
      temperature: 0.7,
      max_tokens: 2000
    })

    const { usage } = response.data
    return {
      message: response.data.choices[0].message.content,
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      costUsd: this.calculateCost(model, usage)
    }
  }

  private calculateCost(model: string, usage: any): number {
    const rates = {
      'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
      'gpt-4o': { input: 0.005, output: 0.015 },
      'mistral-large': { input: 0.002, output: 0.006 }
    }
    
    const rate = rates[model] || rates['mistral-large']
    return (usage.prompt_tokens * rate.input + usage.completion_tokens * rate.output) / 1000
  }
}
```

#### 2. AI Controller (aiController.ts)

```typescript
import { OpenRouterService } from '@/services/openrouterService'
import { TokenService } from '@/services/tokenService'
import { db } from '@/config/database'

export class AIController {
  static async createSession(req, res) {
    const { storyId, mode } = req.body
    const userId = req.user.id

    const session = await db.query(
      `INSERT INTO ai_sessions (story_id, user_id, mode) 
       VALUES ($1, $2, $3) RETURNING *`,
      [storyId, userId, mode]
    )

    res.json(session.rows[0])
  }

  static async sendMessage(req, res) {
    const { sessionId } = req.params
    const { content, mode } = req.body
    const userId = req.user.id

    // Get session
    const sessionResult = await db.query(
      'SELECT * FROM ai_sessions WHERE id = $1',
      [sessionId]
    )
    const session = sessionResult.rows[0]

    // Get system prompt based on mode
    const systemPrompt = this.getSystemPrompt(mode)

    // Get conversation history (last 5 messages for context)
    const historyResult = await db.query(
      `SELECT role, content FROM ai_messages 
       WHERE session_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [sessionId]
    )
    const history = historyResult.rows.reverse()

    // Build messages array
    const messages = [
      ...history,
      { role: 'user', content }
    ]

    // Call OpenRouter
    const orService = new OpenRouterService()
    const response = await orService.sendMessage(
      'claude-3.5-sonnet',
      messages,
      systemPrompt
    )

    // Check user balance
    const creditsResult = await db.query(
      'SELECT balance_usd FROM user_credits WHERE user_id = $1',
      [userId]
    )
    const credits = creditsResult.rows[0]?.balance_usd || 0

    if (credits < response.costUsd) {
      return res.status(402).json({ error: 'Insufficient credits' })
    }

    // Save messages to DB
    const userMsgResult = await db.query(
      `INSERT INTO ai_messages (session_id, role, content, input_tokens, output_tokens, cost_usd)
       VALUES ($1, 'user', $2, 0, 0, 0) RETURNING id`,
      [sessionId, content]
    )

    const assistantMsgResult = await db.query(
      `INSERT INTO ai_messages (session_id, role, content, input_tokens, output_tokens, cost_usd)
       VALUES ($1, 'assistant', $2, $3, $4, $5) RETURNING id`,
      [sessionId, response.message, response.inputTokens, response.outputTokens, response.costUsd]
    )

    // Deduct from user balance
    await db.query(
      `UPDATE user_credits SET balance_usd = balance_usd - $1 WHERE user_id = $2`,
      [response.costUsd, userId]
    )

    // Log token usage
    await db.query(
      `INSERT INTO tokens_usage (user_id, session_type, model, input_tokens, output_tokens, cost_usd)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, 'ai-coach', 'claude-3.5-sonnet', response.inputTokens, response.outputTokens, response.costUsd]
    )

    res.json({
      message: response.message,
      costUsd: response.costUsd,
      newBalance: credits - response.costUsd
    })
  }

  private static getSystemPrompt(mode: string): string {
    const prompts = {
      'narrative': `Tu es un coach d'écriture de fiction bienveillant...`,
      'therapeutic': `Tu es un accompagnant d'écriture introspective...`,
      'coauthor': `Tu es un co-auteur écrivant à quatre mains...`,
      'structural': `À partir des informations de l'utilisateur...`
    }
    return prompts[mode] || prompts['narrative']
  }
}
```

#### 3. Billing Service

```typescript
export class BillingService {
  static async purchaseCredits(userId: string, amountUsd: number) {
    // Call Stripe to create payment intent
    // Then update user_credits on success
    
    await db.query(
      `UPDATE user_credits 
       SET balance_usd = balance_usd + $1, updated_at = now()
       WHERE user_id = $2`,
      [amountUsd, userId]
    )
  }

  static async checkBalance(userId: string): Promise<number> {
    const result = await db.query(
      'SELECT balance_usd FROM user_credits WHERE user_id = $1',
      [userId]
    )
    return result.rows[0]?.balance_usd || 0
  }
}
```

---

## 5. API Endpoints (REST)

### Auth
- `POST /api/auth/register` – Register user
- `POST /api/auth/login` – Login, return JWT
- `POST /api/auth/logout` – Clear session
- `GET /api/auth/me` – Get current user

### Stories
- `GET /api/stories` – List user's stories
- `GET /api/stories?visibility=public` – Browse public stories
- `POST /api/stories` – Create new story
- `GET /api/stories/:id` – Get story details
- `PUT /api/stories/:id` – Update story metadata
- `DELETE /api/stories/:id` – Delete story
- `PATCH /api/stories/:id/publish` – Change visibility

### Chapters
- `POST /api/stories/:id/chapters` – Create chapter
- `PUT /api/chapters/:id` – Update chapter content
- `DELETE /api/chapters/:id` – Delete chapter
- `GET /api/stories/:id/chapters` – List chapters

### AI
- `POST /api/ai/sessions` – Create AI session
- `POST /api/ai/sessions/:id/messages` – Send message to coach
- `GET /api/ai/sessions/:id` – Get session history
- `POST /api/ai/generate-synopsis` – Generate synopsis from prompt
- `POST /api/ai/generate-continuation` – Generate next chapter

### Billing
- `GET /api/billing/credits` – Get user's credit balance
- `POST /api/billing/purchase` – Purchase credit pack (Stripe webhook)
- `GET /api/billing/usage` – Get token usage stats

### Social
- `POST /api/stories/:id/like` – Like story
- `DELETE /api/stories/:id/like` – Unlike
- `POST /api/stories/:id/comments` – Add comment
- `GET /api/stories/:id/comments` – Get comments
- `POST /api/users/:id/follow` – Follow author
- `DELETE /api/users/:id/follow` – Unfollow

---

## 6. Deployment & DevOps

### Docker Setup

```dockerfile
# Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Backend
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .

# Copy built frontend
COPY --from=frontend-build /frontend/dist ./public

EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables

```env
# Frontend (.env.example)
VITE_API_URL=https://api.co-story.app

# Backend (.env.example)
DATABASE_URL=postgresql://user:password@localhost:5432/co-story
JWT_SECRET=your_jwt_secret_here
OPENROUTER_API_KEY=your_openrouter_key
STRIPE_SECRET_KEY=your_stripe_key
NODE_ENV=production
PORT=3001
APP_URL=https://co-story.app
```

### CI/CD (GitHub Actions example)

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ghcr.io/your-org/co-story:latest
```

---

## 7. Performance & Scaling Notes

- **Frontend:** Vite + Vue 3 = Fast, tree-shakeable bundles
- **Backend:** Node.js clusters for CPU cores
- **DB:** Indexes on `user_id`, `story_id`, `created_at` for pagination
- **Caching:** Redis (optional M2+) for session/user data
- **CDN:** Vercel / Cloudflare for static assets
- **OpenRouter:** Respects rate limits; queue requests if needed

---

*Architecture v1.0 – Janvier 2026*
