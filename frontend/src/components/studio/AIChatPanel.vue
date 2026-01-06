<template>
  <div class="flex flex-col h-full bg-white relative">
    <div class="p-3 border-b border-stone-200 shrink-0 transition-colors duration-500" :class="currentTheme.headerGradient">
        <div class="flex items-center justify-between">
            <h2 class="font-bold font-serif flex items-center gap-2 text-sm transition-colors duration-500" :class="currentTheme.headerText">
                <Sparkles class="w-4 h-4" />
                <span>{{ currentModeLabel }}</span>
                <span class="text-[10px] font-sans uppercase tracking-wider font-normal opacity-70">{{ currentModeTag }}</span>
            </h2>
            <div class="h-2 w-2 rounded-full animate-pulse transition-colors duration-500" :class="currentTheme.accentBg" v-if="isAiThinking"></div>
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
                    <div v-else v-html="renderMarkdown(msg.content)"></div>
                </div>
            </div>
        </TransitionGroup>

        <div v-if="isAiThinking" class="flex gap-1 ml-2 items-center h-8">
             <div class="flex gap-1">
                <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="currentTheme.accentBg" style="animation-delay: 0ms"></span>
                <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="currentTheme.accentBg" style="animation-delay: 150ms"></span>
                <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="currentTheme.accentBg" style="animation-delay: 300ms"></span>
             </div>
             <span class="text-xs text-stone-400 ml-2 font-medium animate-pulse">Thinking...</span>
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
                    @click="setMode(mode.value)"
                    class="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center gap-2"
                    :class="localMode === mode.value ? 'font-medium bg-stone-50' : 'text-stone-600'"
                >
                    <span class="w-1.5 h-1.5 rounded-full" :class="getThemeForMode(mode.value).accentBg"></span>
                    {{ mode.label }}
                    <Check v-if="localMode === mode.value" class="w-3 h-3 ml-auto text-teal-600" />
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
import { Sparkles, Bot, Send, ChevronDown, Check } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true
})

const emit = defineEmits<{
    (e: 'ai-action', action: any): void
}>()

const renderMarkdown = (text: string) => {
    return md.render(text)
}

const props = defineProps<{
    context?: any

    storyMode?: string
}>()

const allAiModes = [
    { label: 'Atlas', tag: 'Narrative Coach', value: 'narrative' },
    { label: 'Sofia', tag: 'Empathetic Partner', value: 'therapeutic' },
    { label: 'Kai', tag: 'Co-Author', value: 'coauthor' },
    { label: 'Nora', tag: 'Structural Editor', value: 'structural' }
]

const aiModes = computed(() => {
    // If story mode is journal, only show therapeutic or allow it.
    // Spec: "Therapeutic" NOT accessible UNLESS created via Journal.
    
    // If it's a journal, maybe we limit to ONLY therapeutic or prioritize it?
    // Let's assume:
    // 1. If storyMode === 'journal', show 'Therapeutic' (and maybe others or just that?)
    // 2. If storyMode !== 'journal', FILTER OUT 'Therapeutic'
    
    if (props.storyMode === 'journal') {
        // Just show all? Or usually journals imply therapeutic focus. 
        // User said: "only way to arrive [at Therapeutic] is by passing through creation of a journal"
        // So Journal -> Therapeutic available.
        // Others -> Therapeutic HIDDEN.
        
        // Spec update: "remove the other assistants in the Private mode as well leaving just the epathetic partner"
        return [{ label: 'Sofia', tag: 'Empathetic Partner', value: 'therapeutic' }]
    } else {
        return allAiModes.filter(m => m.value !== 'therapeutic')
    }
})

const localMode = ref('narrative')

// Watch story mode to auto-switch if needed
watch(() => props.storyMode, (newMode) => {
    if (newMode === 'journal') {
        localMode.value = 'therapeutic'
    } else if (localMode.value === 'therapeutic') {
        localMode.value = 'narrative'
    }
}, { immediate: true })
const localMessages = ref<{ role: 'user' | 'assistant', content: string }[]>([])
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

const setMode = (mode: string) => {
    localMode.value = mode
    showModeMenu.value = false
}



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
    await processMessage(msg)
}



const processMessage = async (msg: string) => {
    localMessages.value.push({ role: 'user', content: msg })
    isAiThinking.value = true
    scrollToBottom()
    
    try {
        const res = await fetch('http://localhost:3001/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: localMode.value,
                message: msg,
                context: props.context,
                history: localMessages.value.slice(-10)
            })
        })
        
        if (res.ok) {
            const data = await res.json()
            let content = data.content
            
            // Check for ACTION tag
            const actionRegex = /\[\[ACTION:\s*(\{.*\})\s*\]\]/s
            const match = content.match(actionRegex)
            
            if (match && match[1]) {
                try {
                    const actionData = JSON.parse(match[1])
                    emit('ai-action', actionData)
                    // Remove the action block from displayed text
                    content = content.replace(match[0], '').trim()
                } catch (e) {
                    console.error("Failed to parse AI action", e)
                }
            }
            
            // Typewriter Effect
            const assistantMsgIndex = localMessages.value.length
            localMessages.value.push({ role: 'assistant', content: '' })
            
            // Split content into chunks/chars for speed
            // Fast speed: 5ms per char? 
            let i = 0
            const typeWriter = async () => {
                if (i < content.length) {
                    // Type a few chars at once for speed if needed, or 1 by 1 very fast
                    // Let's do 2 chars per 10ms for a "flow" feel
                    const chunk = content.slice(i, i + 3)
                    if (localMessages.value[assistantMsgIndex]) {
                        localMessages.value[assistantMsgIndex].content += chunk
                    }
                    i += 3
                    await nextTick()
                    scrollToBottom()
                    
                    if (content.length > 500) {
                         // Ultra fast for long texts
                         setTimeout(typeWriter, 1) 
                    } else {
                         setTimeout(typeWriter, 10)
                    }
                }
            }
            typeWriter()
        }
    } catch (e) {
        localMessages.value.push({ role: 'assistant', content: "Sorry, I encountered an error." })
    } finally {
        isAiThinking.value = false
        scrollToBottom()
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
