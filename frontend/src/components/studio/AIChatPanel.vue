<template>
  <div class="flex flex-col h-full bg-white relative">
    <div class="p-3 border-b border-stone-200 bg-gradient-to-r from-teal-50 to-amber-50 shrink-0">
        <div class="flex items-center justify-between">
            <h2 class="font-bold font-serif text-teal-900 flex items-center gap-2 text-sm">
                <Sparkles class="w-4 h-4 text-teal-600" />
                AI Assistant
            </h2>
            <div class="h-2 w-2 rounded-full bg-teal-500 animate-pulse" v-if="isAiThinking"></div>
        </div>
    </div>
    
    <!-- Chat Area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/30" ref="chatContainer">
        <div v-if="localMessages.length === 0" class="h-full flex flex-col items-center justify-center text-center text-stone-400 opacity-60">
            <Bot class="w-12 h-12 mb-3 text-stone-300" />
            <p class="text-sm px-4">Select a mode and ask me anything to help with your story.</p>
        </div>
        
        <div v-for="(msg, idx) in localMessages" :key="idx" 
            class="flex flex-col gap-1 max-w-[90%]"
            :class="msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'"
        >
            <div 
                class="p-3 rounded-2xl text-sm shadow-sm prose prose-sm max-w-none"
                :class="[
                    msg.role === 'user' 
                        ? 'bg-teal-600 text-white rounded-tr-sm prose-headings:text-white prose-p:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white' 
                        : 'bg-white text-stone-800 border border-stone-100 rounded-tl-sm prose-headings:text-stone-900',
                    'prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0'
                ]"
            >
                <div v-if="msg.role === 'user'" class="whitespace-pre-wrap">{{ msg.content }}</div>
                <div v-else v-html="renderMarkdown(msg.content)"></div>
            </div>
        </div>
            <div v-if="isAiThinking" class="flex gap-1 ml-2">
            <div class="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-75"></div>
            <div class="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-150"></div>
        </div>
    </div>

    <!-- Quick Actions (Selection) -->
    <div v-if="hasSelection" class="px-3 pt-2 bg-white flex gap-2 overflow-x-auto pb-2 border-t border-stone-100 scrollbar-hide">
        <button @click="quickEdit('Fix grammar and spelling')" class="whitespace-nowrap px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-100 hover:bg-teal-100">
            Fix Grammar
        </button>
        <button @click="quickEdit('Make it more descriptive')" class="whitespace-nowrap px-3 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-100 hover:bg-amber-100">
            Describe More
        </button>
        <button @click="quickEdit('Rewrite in a more dramatic tone')" class="whitespace-nowrap px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100 hover:bg-purple-100">
            Dramatic
        </button>
    </div>

    <!-- Input -->
    <div class="p-3 border-t border-stone-200 bg-white shrinking-0">
        <!-- Mode Pill & Menu -->
        <div class="relative mb-2">
            <button 
                @click="showModeMenu = !showModeMenu"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 transition-colors"
            >
                <span class="w-1.5 h-1.5 rounded-full" :class="currentModeColor"></span>
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
                    :class="localMode === mode.value ? 'font-medium text-teal-700 bg-teal-50/50' : 'text-stone-600'"
                >
                    <span class="w-1.5 h-1.5 rounded-full" :class="getModeColor(mode.value)"></span>
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
                class="w-full pl-4 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none placeholder:text-stone-400"
                :disabled="isAiThinking"
            />
            <button 
                @click="triggerSend"
                class="absolute right-2 top-2 p-1 rounded-md text-teal-600 hover:bg-teal-50 transition-colors disabled:opacity-50"
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

const renderMarkdown = (text: string) => {
    return md.render(text)
}

const props = defineProps<{
    context?: any
    selection?: string
}>()

const aiModes = [
    { label: 'Narrative Coach', value: 'narrative' },
    { label: 'Therapist', value: 'therapeutic' },
    { label: 'Co-Author', value: 'coauthor' },
    { label: 'Structural', value: 'structural' }
]

const localMode = ref('narrative')
const localMessages = ref<{ role: 'user' | 'assistant', content: string }[]>([])
const aiInput = ref('')
const isAiThinking = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

const showModeMenu = ref(false)

const getModeColor = (mode: string) => {
    switch(mode) {
        case 'narrative': return 'bg-teal-500'
        case 'therapeutic': return 'bg-amber-500'
        case 'coauthor': return 'bg-purple-500'
        case 'structural': return 'bg-blue-500'
        default: return 'bg-stone-500'
    }
}

const currentModeColor = computed(() => getModeColor(localMode.value))
const currentModeLabel = computed(() => aiModes.find(m => m.value === localMode.value)?.label)

const setMode = (mode: string) => {
    localMode.value = mode
    showModeMenu.value = false
}

const hasSelection = computed(() => !!props.selection && props.selection.length > 0)

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

const quickEdit = async (instruction: string) => {
    if (!props.selection) return
    
    // Add user message to chat to show action
    localMessages.value.push({ role: 'user', content: `📝 Edit: "${instruction}"` })
    isAiThinking.value = true
    scrollToBottom()

    try {
        const res = await fetch('http://localhost:3001/api/ai/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: props.selection,
                instruction
            })
        })
        
        if (res.ok) {
            const data = await res.json()
            localMessages.value.push({ 
                role: 'assistant', 
                content: `Here is the edited text:\n\n${data.content}\n\n(Copy/Paste to apply)` 
            })
            // Ideally we emit an event to replace text in editor, but copy/paste is safer v1
        }
    } catch (e) {
        localMessages.value.push({ role: 'assistant', content: "Failed to edit text." })
    } finally {
        isAiThinking.value = false
        scrollToBottom()
    }
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
            localMessages.value.push({ role: 'assistant', content: data.content })
        }
    } catch (e) {
        localMessages.value.push({ role: 'assistant', content: "Sorry, I encountered an error." })
    } finally {
        isAiThinking.value = false
        scrollToBottom()
    }
}
</script>
