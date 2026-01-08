<template>
  <div class="flex flex-col h-full bg-white relative min-h-0">
    <div class="p-3 border-b border-stone-200 shrink-0 transition-colors duration-500" :class="currentTheme.headerGradient">
        <div class="flex items-center justify-between w-full">
                <div class="flex flex-col">
                    <h2 class="font-bold font-serif flex items-center gap-2 text-sm transition-colors duration-500" :class="currentTheme.headerText">
                        <Sparkles class="w-4 h-4" />
                        <span>{{ currentModeLabel }}</span>
                        <span class="text-[10px] font-sans uppercase tracking-wider font-normal opacity-70">{{ currentModeTag }}</span>
                    </h2>
                    <p class="text-[10px] opacity-60 ml-6 leading-tight font-medium" :class="currentTheme.headerText">{{ currentModeDescription }}</p>
                </div>
            
            <div class="flex items-center gap-2">
                <button 
                    v-if="canUndo"
                    @click="$emit('undo')"
                    class="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded transition-colors bg-white/50 hover:bg-white"
                    :class="currentTheme.accentText"
                    title="Undo last AI change"
                >
                    <RotateCcw class="w-3 h-3" />
                    <span>Undo</span>
                </button>
                <div class="h-2 w-2 rounded-full animate-pulse transition-colors duration-500 shrink-0" :class="currentTheme.accentBg" v-if="isAiThinking"></div>
            </div>
        </div>
    </div>
    
    <!-- Chat Area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30" ref="chatContainer">
        <div v-if="localMessages.length === 0" class="h-full flex flex-col items-center justify-center text-center text-stone-400 opacity-60">
            <Bot class="w-12 h-12 mb-3 text-stone-300" />
            <p class="text-sm px-4">Select a mode and ask me anything to help with your story.</p>
        </div>
        
        <TransitionGroup name="message-list">
            <div v-for="(msg, idx) in localMessages" :key="idx" 
                class="flex flex-col gap-1 max-w-[90%]"
                :class="msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'"
            >
                <div 
                    class="p-3 rounded-2xl text-sm shadow-sm prose prose-sm max-w-none transition-colors duration-300"
                    :class="[
                        msg.role === 'user' 
                            ? [currentTheme.primaryBg, 'text-white rounded-tr-sm prose-headings:text-white prose-p:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white'] 
                            : 'bg-white text-stone-800 border border-stone-100 rounded-tl-sm prose-headings:text-stone-900',
                        'prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0'
                    ]"
                >
                    <div v-if="msg.role === 'user'" class="whitespace-pre-wrap">{{ msg.content }}</div>
                    <div v-else>
                         <div v-if="msg.isError" class="flex flex-col gap-2">
                             <div class="text-rose-600 font-medium prose prose-sm max-w-none" v-html="renderMarkdown(msg.content)"></div>
                             <button 
                                @click="retryLastMessage" 
                                class="self-start flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 text-xs rounded-lg hover:bg-rose-100 transition-colors border border-rose-200"
                             >
                                <RefreshCw class="w-3 h-3" />
                                Retry
                             </button>
                         </div>
                         <div v-else v-html="renderMarkdown(msg.content)"></div>
                    </div>
                </div>
            </div>
        </TransitionGroup>

        <div v-if="isAiThinking" class="flex gap-1 ml-2 items-center h-8">
             <div class="flex gap-1">
                <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="currentTheme.accentBg" style="animation-delay: 0ms"></span>
                <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="currentTheme.accentBg" style="animation-delay: 150ms"></span>
                <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="currentTheme.accentBg" style="animation-delay: 300ms"></span>
             </div>
             <span class="text-xs text-stone-400 ml-2 font-medium animate-pulse">{{ aiStatusMessage }}</span>
        </div>
    </div>



    <!-- Input -->
    <div class="p-3 border-t border-stone-200 bg-white shrinking-0">
        <!-- Mode Pill & Menu -->
        <div class="relative mb-2">
            <button 
                @click="showModeMenu = !showModeMenu"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 transition-colors"
            >
                <span class="w-1.5 h-1.5 rounded-full transition-colors duration-300" :class="currentTheme.accentBg"></span>
                {{ currentModeLabel }}
                <ChevronDown class="w-3 h-3 text-stone-400" />
            </button>

            <!-- Popover Menu -->
            <div 
                v-if="showModeMenu"
                class="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-20"
            >
                <button
                    v-for="mode in aiModes"
                    :key="mode.value"
                    @click="selectMode(mode)"
                    class="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center gap-2"
                    :class="[
                        localMode === mode.value ? 'font-medium bg-stone-50' : 'text-stone-600',
                        (mode as any).locked ? 'opacity-70 grayscale' : ''
                    ]"
                >
                    <span class="w-1.5 h-1.5 rounded-full" :class="getThemeForMode(mode.value).accentBg"></span>
                    {{ mode.label }}
                    <Lock v-if="(mode as any).locked" class="w-3 h-3 ml-auto text-stone-400" />
                    <Check v-else-if="localMode === mode.value" class="w-3 h-3 ml-auto text-teal-600" />
                </button>
            </div>
            
            <!-- Click outside overlay -->
            <div v-if="showModeMenu" @click="showModeMenu = false" class="fixed inset-0 z-10"></div>
        </div>

        <div class="relative">
            <input 
                type="text" 
                v-model="aiInput"
                @keydown.enter="triggerSend"
                placeholder="Ask Co-Story..." 
                class="w-full pl-4 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none placeholder:text-stone-400 transition-colors duration-300"
                :class="[currentTheme.focusBorder, currentTheme.focusRing]"
                :disabled="isAiThinking"
            />
            <button 
                @click="triggerSend"
                class="absolute right-2 top-2 p-1 rounded-md transition-colors disabled:opacity-50"
                :class="[currentTheme.accentText, 'hover:bg-stone-100']"
                :disabled="!aiInput.trim() || isAiThinking"
            >
                <Send class="w-4 h-4" />
            </button>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, Bot, Send, ChevronDown, Check, RotateCcw, Lock, RefreshCw } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true
})

const props = defineProps<{
    context?: any
    storyMode?: string
    canUndo?: boolean
}>()

const emit = defineEmits<{
    (e: 'ai-action', action: any): void
    (e: 'undo'): void
}>()

const renderMarkdown = (text: string) => {
    // Strip action blocks before rendering to hide them from UI
    const cleanText = text.replace(/\[\[\s*ACTION\s*:([\s\S]*?)\]\]/gi, '').trim();
    return md.render(cleanText)
}

// Track word usage to backend
const trackWordUsage = async (wordCount: number) => {
    try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3001/api/usage/track-words', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ wordCount })
        })
        
        if (!response.ok) {
            throw new Error('Failed to track word usage')
        }
        
        console.log(`[Word Tracking] Successfully tracked ${wordCount} words`)
    } catch (error) {
        console.error('[Word Tracking] Error:', error)
        throw error
    }
}

// Imported constants
import { ASSISTANTS } from '../../config/assistants'

const aiModes = computed(() => {
    // Filter modes based on story context
    // If Journal -> Only Sofia (therapeutic)
    // If Guided -> All Guided modes (Kai, Nora, Atlas)
    
    let modes = ASSISTANTS.map(a => ({
        label: a.name,
        tag: a.role,
        value: a.id,
        description: a.description,
        locked: a.locked,
        lockReason: a.lockReason
    }))

    if (props.storyMode === 'journal') {
        return modes.filter(m => m.value === 'therapeutic')
    } else {
        return modes.filter(m => m.value !== 'therapeutic')
    }
})

const localMode = ref('coauthor')

// Initialize mode from Context (Persisted Role) OR defaults
watch(() => props.context?.aiRole, (newRole) => {
    if (newRole && aiModes.value.find(m => m.value === newRole)) {
        localMode.value = newRole
    } else {
        // Fallback defaults
        if (props.storyMode === 'journal') {
            localMode.value = 'therapeutic'
        } else {
            localMode.value = 'coauthor'
        }
    }
}, { immediate: true })
const localMessages = ref<{ role: 'user' | 'assistant', content: string, isError?: boolean }[]>([])

const personaVoices: Record<string, any> = {
    narrative: { // Atlas
        thinking: "Atlas consults the archives...",
        reading: "Atlas analyzes the Codex...",
        switching: "Atlas seeks a specialized quill...",
        error: "The library is crowded right now. Atlas needs a moment."
    },
    therapeutic: { // Sofia
        thinking: "Sofia is listening...",
        reading: "Sofia reflects on your journey...",
        switching: "Sofia finds a better way to connect...",
        error: "Sofia is processing too many emotions individually. Please try again."
    },
    coauthor: { // Kai
        thinking: "Kai is brainstorming...",
        reading: "Kai reviews the plot points...",
        switching: "Kai looks for a sharper angle...",
        error: "Kai is overwhelmed with ideas from other writers. Give him a minute."
    },
    structural: { // Nora
        thinking: "Nora outlines the possibilities...",
        reading: "Nora checks the structure...",
        switching: "Nora readjusts her framework...",
        error: "Nora's blueprint is currently overloaded. Please wait a moment."
    }
}

const getPersonaStatus = (mode: string, rawStatus: string) => {
    const voice = personaVoices[mode] || personaVoices['coauthor']
    
    // Check for "Switching" or model names
    if (rawStatus.toLowerCase().includes('switching') || rawStatus.toLowerCase().includes('model')) {
        return voice.switching
    }
    if (rawStatus.toLowerCase().includes('reading') || rawStatus.toLowerCase().includes('codex')) {
        return voice.reading
    }
    return voice.thinking // Default fallback
}


// Load History
const loadHistory = async () => {
    if (!props.context?.storyId) return
    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`http://localhost:3001/api/stories/${props.context.storyId}/chat`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            const history = await res.json()
            if (history.length > 0) {
                // Map DB history to local format
                localMessages.value = history.map((h: any) => ({
                    role: h.role,
                    content: h.content
                }))
            } else {
                 localMessages.value = [{ role: 'assistant', content: 'Hello! I am your co-author. How can I help you today?' }]
            }
        }
    } catch (e) {
        console.error("Failed to load history", e)
    }
}

// Watch for storyId changes to reload history
watch(() => props.context?.storyId, (newId) => {
    if (newId) {
        loadHistory()
    }
}, { immediate: true })

const aiInput = ref('')
const isAiThinking = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

const showModeMenu = ref(false)

const getThemeForMode = (mode: string) => {
    switch(mode) {
        case 'narrative': // Atlas (Teal)
            return {
                headerGradient: 'bg-gradient-to-r from-teal-50 to-emerald-50',
                headerText: 'text-teal-900',
                accentBg: 'bg-teal-500',
                accentText: 'text-teal-600',
                primaryBg: 'bg-teal-600',
                focusBorder: 'focus:border-teal-500',
                focusRing: 'focus:ring-teal-500 focus:ring-1'
            }
        case 'therapeutic': // Sofia (Amber/Rose)
            return {
                headerGradient: 'bg-gradient-to-r from-amber-50 to-rose-50',
                headerText: 'text-amber-900',
                accentBg: 'bg-amber-500',
                accentText: 'text-amber-600',
                primaryBg: 'bg-amber-600',
                focusBorder: 'focus:border-amber-500',
                focusRing: 'focus:ring-amber-500 focus:ring-1'
            }
        case 'coauthor': // Kai (Violet/Fuchsia)
            return {
                headerGradient: 'bg-gradient-to-r from-violet-50 to-fuchsia-50',
                headerText: 'text-violet-900',
                accentBg: 'bg-violet-500',
                accentText: 'text-violet-600',
                primaryBg: 'bg-violet-600',
                focusBorder: 'focus:border-violet-500',
                focusRing: 'focus:ring-violet-500 focus:ring-1'
            }
        case 'structural': // Nora (Slate/Indigo)
            return {
                headerGradient: 'bg-gradient-to-r from-slate-100 to-indigo-50',
                headerText: 'text-slate-900',
                accentBg: 'bg-slate-600',
                accentText: 'text-slate-700',
                primaryBg: 'bg-slate-700',
                focusBorder: 'focus:border-slate-500',
                focusRing: 'focus:ring-slate-500 focus:ring-1'
            }
        default:
            return {
                headerGradient: 'bg-stone-50',
                headerText: 'text-stone-900',
                accentBg: 'bg-stone-500',
                accentText: 'text-stone-600',
                primaryBg: 'bg-stone-600',
                focusBorder: 'focus:border-stone-500',
                focusRing: 'focus:ring-stone-500 focus:ring-1'
            }
    }
}

const currentTheme = computed(() => getThemeForMode(localMode.value))

// const currentModeColor = computed(() => getModeColor(localMode.value)) // DEPRECATED
const currentModeLabel = computed(() => aiModes.value.find(m => m.value === localMode.value)?.label || 'Atlas')
const currentModeTag = computed(() => aiModes.value.find(m => m.value === localMode.value)?.tag || 'Assistant')
const currentModeDescription = computed(() => aiModes.value.find(m => m.value === localMode.value)?.description || '')

const setMode = (mode: string) => {
    localMode.value = mode
    showModeMenu.value = false
}

const selectMode = (mode: any) => {
    if (mode.locked) {
        if (confirm(`Atlas is reserved for Storyteller and Architect tiers. Upgrade to unlock?`)) {
            router.push('/app/subscription')
        }
        return
    }
    setMode(mode.value)
}

// Ensure default mode is safe (if Atlas is locked, default to CoAction or similar)
// We need a watchEffect or onMounted to check initial validity?
// But localMode is ref('coauthor') now.

watch(() => (authStore.user as any)?.subscription_tier, () => {
    // If current mode is locked, switch to safe mode
    const currentModeObj = aiModes.value.find(m => m.value === localMode.value) as any
    if (currentModeObj && currentModeObj.locked) {
        localMode.value = 'coauthor' 
    }
}, { immediate: true })



const scrollToBottom = async () => {
    await nextTick()
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
}

const triggerSend = async () => {
    if (!aiInput.value.trim() || isAiThinking.value) return
    const msg = aiInput.value.trim()
    aiInput.value = ''
    
    // Save User Msg
    if (props.context?.storyId) {
        const token = localStorage.getItem('token')
        fetch(`http://localhost:3001/api/stories/${props.context.storyId}/chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: 'user', content: msg })
        }).catch(err => console.error("Failed to save user message", err))
    }

    await processMessage(msg)
}



const aiStatusMessage = ref('')

const processMessage = async (msg: string) => {
    localMessages.value.push({ role: 'user', content: msg })
    isAiThinking.value = true
    aiStatusMessage.value = getPersonaStatus(localMode.value, 'thinking')
    scrollToBottom()
    
    try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3001/api/ai/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                mode: localMode.value,
                message: msg,
                context: props.context,
                history: localMessages.value.slice(-10)
            })
        })
        
        if (!res.ok) {
            // Error Handling
             const errData = await res.json().catch(() => ({}))
             console.log('[Error Debug] Status:', res.status, 'Data:', errData)
             
             if (res.status === 401) {
                 localStorage.removeItem('token')
                 router.push('/auth/login')
                 return
             }
             if (res.status === 403 && errData.code === 'UPGRADE_REQUIRED') {
                 console.log('[Error Debug] Upgrade required path')
                 localMessages.value.push({ role: 'assistant', content: "🔒 **Upgrade Required**\n\n" + (errData.error || "Feature limited.") })
             } else if (res.status === 403 && errData.error && errData.error.includes('limit reached')) {
                 // Quota limit error with CTA
                 console.log('[Error Debug] Quota limit path')
                 const upgradeButton = '\n\n[🚀 Upgrade Now](/subscription)'
                 localMessages.value.push({ 
                     role: 'assistant', 
                     content: "📊 **Limite Mensuelle Atteinte**\n\n" + errData.error + upgradeButton
                 })
             } else if (res.status === 402) {
                 console.log('[Error Debug] Insufficient credits path')
                 localMessages.value.push({ role: 'assistant', content: "🪙 **Insufficient Credits**\n\n" + (errData.error || "Please purchase more credits.") })
             } else {
                 console.log('[Error Debug] Generic error path')
                 localMessages.value.push({ role: 'assistant', content: "Error: " + (errData.error || res.statusText) })
             }
             return;
        }

        // Streaming Logic
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        
        // Character Buffer for smooth animation
        let assistantMsgIndex = -1
        let fullContent = '' // For action parsing

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter(line => line.trim() !== '')

            for (const line of lines) {
                try {
                    const data = JSON.parse(line)
                    if (data.type === 'status') {
                        aiStatusMessage.value = getPersonaStatus(localMode.value, data.message || '')
                    } else if (data.type === 'content') {
                        const textChunk = data.data || ''
                        fullContent += textChunk
                        // charBuffer += textChunk 
                        // processBuffer() // Trigger typewriter
                        
                        // DIRECT APPEND (Typewriter Disabled for debugging/correctness)
                        if (assistantMsgIndex === -1) {
                            localMessages.value.push({ role: 'assistant', content: '' })
                            assistantMsgIndex = localMessages.value.length - 1
                        }
                        if (assistantMsgIndex !== -1 && localMessages.value[assistantMsgIndex]) {
                            localMessages.value[assistantMsgIndex]!.content += textChunk
                        }
                        scrollToBottom()
                    } else if (data.type === 'error') {
                         if (assistantMsgIndex === -1) {
                             let errorMsg = '';
                             
                             // Check for quota limit errors
                             if (data.message && data.message.includes('limit reached')) {
                                 errorMsg = `📊 **Limite Mensuelle Atteinte**

${data.message}

[🚀 Upgrade Now](/app/subscription)`;
                             } 
                             // Check for daily free limit
                             else if (data.message && data.message.includes('Daily Free Limit')) {
                                 errorMsg = "🛑 **Daily Limit Reached**\n\nOpenRouter free tier limit exceeded for today. Please wait or add credits.";
                             }
                             // Fallback to persona voice
                             else {
                                 const voice = personaVoices[localMode.value] || personaVoices['coauthor']
                                 errorMsg = voice.error;
                             }
                             
                             localMessages.value.push({ role: 'assistant', content: errorMsg, isError: true })
                             assistantMsgIndex = localMessages.value.length - 1
                        }
                        // We might still want to log the raw error for debugging but hide it from user
                        console.warn("Backend Error Stream:", data.message)
                        // Don't append raw error to content if we want to be friendly
                    }
                } catch (e) {
                    console.warn("Stream parse error", e)
                }
            }
        }
        
        // Buffer/Typewriter removed, proceed immediately

        // Post-processing: Parse Actions from accumulated content
        // We look at the actual displayed message to ensure we clean what the user sees
        let currentText = fullContent
        if (assistantMsgIndex !== -1 && localMessages.value[assistantMsgIndex]) {
            currentText = localMessages.value[assistantMsgIndex]!.content
        }

        // Use a broader regex to capture the whole block first for robust removal
        const actionBlockRegex = /\[\[\s*ACTION\s*:([\s\S]*?)\]\]/gi
        let match;
        
        while ((match = actionBlockRegex.exec(currentText)) !== null) {
             const fullMatch = match[0];
             const rawContent = match[1] || "";

             // Remove from text immediately
             currentText = currentText.replace(fullMatch, '').trim();
             
             // Update UI immediately
             if (assistantMsgIndex !== -1 && localMessages.value[assistantMsgIndex]) {
                 localMessages.value[assistantMsgIndex]!.content = currentText;
             }

             if (!rawContent.trim()) continue;

             // Parse and Emit
             try {
                // Try to find the JSON object 'check' inside the raw content
                // We look for the first '{' and the last '}'
                const firstBrace = rawContent.indexOf('{');
                const lastBrace = rawContent.lastIndexOf('}');
                
                let jsonString = rawContent;
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    jsonString = rawContent.substring(firstBrace, lastBrace + 1);
                }

                let actionData;
                try {
                    actionData = JSON.parse(jsonString);
                } catch (e) {
                     console.warn("First JSON parse failed, attempting repairs...", e);
                     
                     // 1. Fix newlines 
                     let fixedJson = jsonString.replace(/\n/g, '\\n');
                     
                     try {
                        actionData = JSON.parse(fixedJson);
                     } catch (e2) {
                        // 2. Fix unquoted keys (e.g. { type: "..." } -> { "type": "..." })
                        // Regex looks for "word:" that isn't preceded by a quote
                        fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":');
                        actionData = JSON.parse(fixedJson);
                     }
                }
                
                // Track word count for chapter-related actions
                if (actionData && (actionData.type === 'update_chapter_content' || 
                    actionData.type === 'append_chapter_content' || 
                    actionData.type === 'create_chapter')) {
                    const content = actionData.data?.content || "";
                    const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length;
                    
                    if (wordCount > 0) {
                        // Track usage asynchronously (don't block UI)
                        trackWordUsage(wordCount).catch(err => {
                            console.warn('Failed to track word usage:', err);
                        });
                    }
                }
                
                emit('ai-action', actionData);
             } catch (e) {
                console.error("Failed to parse AI action content", e);
             }
             actionBlockRegex.lastIndex = 0; 
        }

    } catch (e: any) {
        console.error("AI Request Failed", e)
        // Try to extract actual error message, fallback to persona voice
        let errorMessage = e.message || e.toString()
        
        // If it's a generic error, use persona voice
        if (!errorMessage || errorMessage === '[object Object]') {
            const voice = personaVoices[localMode.value] || personaVoices['coauthor']
            errorMessage = voice.error
        }
        
        localMessages.value.push({ 
            role: 'assistant', 
            content: errorMessage, 
            isError: true 
        })
    } finally {
        isAiThinking.value = false
        aiStatusMessage.value = ''
        scrollToBottom()
    }
}

const retryLastMessage = () => {
    // Find last user message
    const lastUserMsg = [...localMessages.value].reverse().find(m => m.role === 'user')
    if (lastUserMsg) {
        // Remove the error message (last one)
        if (localMessages.value[localMessages.value.length - 1]?.isError) {
             localMessages.value.pop()
        }
        processMessage(lastUserMsg.content)
    }
}
</script>

<style scoped>
.message-list-enter-active,
.message-list-leave-active {
  transition: all 0.4s ease;
}
.message-list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.message-list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
