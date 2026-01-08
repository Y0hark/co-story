<template>
  <div class="h-[calc(100dvh-10rem)] md:h-[calc(100vh-10rem)] flex flex-col md:flex-row relative">
    
    <!-- Mobile Tab Navigation (Top or Bottom? Let's go Top for Context, Bottom for nav) -->
    <!-- Let's use Bottom Nav for switching views on Mobile -->
    
    <!-- DESKTOP LAYOUT (Hidden on Mobile) -->
    <div class="hidden md:flex w-full h-full" @mousemove="handleMouseMove" @mouseup="stopResize" @mouseleave="stopResize">
        <!-- Left Sidebar: Split View (Chapters & World) -->
        <aside class="flex flex-col gap-4 shrink-0 transition-none" :style="{ width: leftSidebarWidth + 'px' }">
        
        <!-- Top: Chapters -->
        <div 
            class="bg-white border border-stone-200 rounded-xl flex flex-col overflow-hidden shadow-sm min-h-[150px]"
            :style="{ height: leftSplitPercentage + '%' }"
        >
            <div class="px-4 py-3 border-b border-stone-100 bg-stone-50">
                <div class="flex items-center gap-2">
                    <button 
                        @click="router.push('/app/dashboard')"
                        class="text-stone-400 hover:text-stone-600 transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft class="w-4 h-4" />
                    </button>
                    <input 
                        v-if="story"
                        type="text" 
                        v-model="story.title"
                        class="flex-1 bg-transparent font-serif font-bold text-stone-900 placeholder:text-stone-400 border-none outline-none focus:ring-0 px-2 text-base truncate"
                        placeholder="Story Title..."
                    />
                </div>

                <div v-if="story" class="mt-2 flex items-center gap-2">
                    <BaseSelect 
                        v-model="story.status" 
                        :options="[
                            { label: 'Draft', value: 'draft' },
                            { label: 'In Progress', value: 'in_progress' },
                            { label: 'Finished', value: 'finished' },
                            { label: 'Abandoned', value: 'abandoned' }
                        ]"
                        class="w-40"
                    />
                    <span class="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Status</span>
                </div>
                
                <div v-if="story" class="mt-3 space-y-3">
                     <!-- Genre & Tone -->
                    <div class="grid grid-cols-2 gap-2">
                         <BaseSelect 
                            v-model="story.genre" 
                            :options="genreOptions"
                            class="text-xs"
                            placeholder="Genre"
                            @change="saveStory"
                        />
                         <BaseSelect 
                            v-model="story.tone" 
                            :options="toneOptions"
                            class="text-xs"
                            placeholder="Tone"
                            @change="saveStory"
                        />
                    </div>

                    <!-- Enhanced Description -->
                    <div class="relative group">
                        <textarea 
                            v-model="story.description"
                            rows="3"
                            placeholder="Story description..."
                            class="w-full bg-white border border-stone-200 rounded-lg text-sm text-stone-700 placeholder:text-stone-400 p-3 resize-y focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-sm transition-all"
                            @blur="saveStory"
                        ></textarea>
                        <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                             <span class="text-[10px] text-stone-400 bg-white/80 px-1 rounded">Auto-saved</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-4 border-b border-stone-200 flex items-center justify-between shrink-0 bg-white">
                <h2 class="font-bold font-serif text-stone-900 text-sm">Chapters</h2>
                <button 
                    @click="createChapter"
                    class="text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded p-1 transition-colors"
                >
                    <Plus class="w-4 h-4" />
                </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 space-y-2">
                <div 
                    v-for="chapter in chapters" 
                    :key="chapter.id"
                    class="px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors border group relative"
                    :class="selectedChapterId === chapter.id ? 'bg-stone-100 text-teal-700 border-stone-200 font-medium' : 'bg-white border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-50'"
                    @click="selectedChapterId = chapter.id"
                >
                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center gap-2 overflow-hidden flex-1">
                            <span class="text-xs opacity-50 shrink-0">{{ chapter.index }}.</span>
                            <span class="truncate">{{ chapter.title }}</span>
                        </div>
                        <div class="flex items-center gap-2 ml-2">
                            <div v-if="chapter.status === 'published'" class="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" title="Published"></div>
                            <button 
                                @click.stop="confirmDeleteChapter(chapter)"
                                class="opacity-0 group-hover:opacity-100 p-1 text-stone-300 hover:text-red-500 transition-all"
                                title="Delete Chapter"
                            >
                                <Trash2 class="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-4 border-t border-stone-200 bg-stone-50 shrink-0">
                <button 
                    @click="createChapter"
                    class="w-full py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    + New Chapter
                </button>
            </div>
        </div>

        <!-- Vertical Split Handle -->
        <div 
            class="h-2 w-full cursor-row-resize flex items-center justify-center hover:bg-stone-200 rounded transition-colors group"
            @mousedown.prevent="startResize('split')"
        >
            <div class="w-8 h-1 rounded-full bg-stone-300 group-hover:bg-teal-400"></div>
        </div>

        <!-- Bottom: World Database -->
        <div class="flex-1 bg-white border border-stone-200 rounded-xl flex flex-col overflow-hidden shadow-sm min-h-[150px]">
            <WorldPanel ref="worldPanel" class="h-full" @items-updated="handleWorldUpdate" />
            <TutorialTip id="world-panel-tip" title="Story Codex" position="top">
                Keep track of your characters, locations, and lore here. The AI uses this to maintain continuity!
            </TutorialTip>
        </div>

        </aside>

        <!-- Left Resize Handle -->
        <div 
            class="w-4 h-full cursor-col-resize flex items-center justify-center hover:bg-stone-100 transition-colors group z-10 mx-1"
            @mousedown.prevent="startResize('left')"
        >
            <div class="h-8 w-1 rounded-full bg-stone-300 group-hover:bg-teal-400"></div>
        </div>

        <!-- Main Editor Area -->
        <main class="flex-1 bg-white border border-stone-200 rounded-xl shadow-sm flex flex-col overflow-hidden relative min-w-[400px]">
        <!-- Editor Title Input & Publish Controls -->
        <div class="border-b border-stone-100 p-6 pb-2 flex items-center justify-between">
                <input 
                type="text" 
                v-model="currentChapterTitle"
                placeholder="Chapter Title"
                class="flex-1 bg-transparent text-3xl font-serif font-bold text-stone-900 placeholder:text-stone-300 border-none outline-none focus:ring-0 px-0 mr-4"
            />
            <div v-if="selectedChapter && story?.mode !== 'journal'" class="flex items-center gap-2">
                <button 
                    @click="togglePublishChapter"
                    class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border"
                    :class="selectedChapter.status === 'published' 
                        ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                        : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200'"
                >
                    {{ selectedChapter.status === 'published' ? 'Published' : 'Draft' }}
                </button>
            </div>
        </div>

        <Editor 
            v-model="currentChapterContent" 
            @editor-created="setEditor"
            @format="handleFormat"
        />
        </main>

        <!-- Right Resize Handle -->
        <div 
            class="w-4 h-full cursor-col-resize flex items-center justify-center hover:bg-stone-100 transition-colors group z-10 mx-1"
            @mousedown.prevent="startResize('right')"
        >
            <div class="h-8 w-1 rounded-full bg-stone-300 group-hover:bg-teal-400"></div>
        </div>

        <!-- Right Sidebar: AI Tools (Bigger) -->
        <aside class="shrink-0 bg-white border border-stone-200 rounded-xl flex flex-col overflow-hidden shadow-sm transition-none" :style="{ width: rightSidebarWidth + 'px' }">
             <AIChatPanel 
                :context="aiContext" 
                :story-mode="story?.mode" 
                :can-undo="contentHistory.length > 0"
                @ai-action="handleAiAction" 
                @undo="undoLastChange"
             />
             <TutorialTip id="ai-panel-tip" title="AI Assistant" position="left">
                Chat with your AI partner here. Ask for ideas, critiques, or to write scenes for you!
             </TutorialTip>
        </aside>
    </div>

    <!-- MOBILE LAYOUT -->
    <div class="md:hidden flex-1 flex flex-col overflow-hidden bg-white relative">
        <!-- Content Area -->
        <div class="flex-1 overflow-hidden relative">
            
            <!-- 1. Editor Panel -->
            <div v-show="activeTab === 'editor'" class="h-full flex flex-col">
                 <div class="border-b border-stone-100 p-4 flex items-center justify-between bg-white shrink-0">
                    <input 
                        type="text" 
                        v-model="currentChapterTitle"
                        placeholder="Chapter Title"
                        class="flex-1 bg-transparent text-xl font-serif font-bold text-stone-900 placeholder:text-stone-300 border-none outline-none focus:ring-0 px-0 mr-2"
                    />
                    <div v-if="selectedChapter">
                         <button 
                            @click="togglePublishChapter"
                            class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border shrink-0"
                            :class="selectedChapter.status === 'published' 
                                ? 'bg-teal-50 text-teal-700 border-teal-200' 
                                : 'bg-stone-100 text-stone-500 border-stone-200'"
                        >
                            {{ selectedChapter.status === 'published' ? 'Pub' : 'Draft' }}
                        </button>
                    </div>
                </div>
                <div class="flex-1 overflow-hidden">
                    <Editor 
                        v-model="currentChapterContent" 
                        @editor-created="setEditor"
                    />
                </div>
            </div>

            <!-- 2. Chapters (Story Info) Panel -->
            <div v-if="activeTab === 'chapters'" class="h-full overflow-y-auto p-4 space-y-4">
                 <div class="bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <input 
                        v-if="story"
                        type="text" 
                        v-model="story.title"
                        class="w-full bg-transparent font-serif font-bold text-stone-900 border-none outline-none focus:ring-0 px-0 text-lg mb-2"
                        placeholder="Story Title..."
                    />
                    <button 
                        @click="router.push('/app/new-story')"
                        class="mb-4 flex items-center gap-2 text-stone-500 hover:text-teal-600 transition-colors text-xs font-medium"
                    >
                        <Feather class="w-3 h-3" />
                        <span>Tell a new Story</span>
                    </button>
                     <div v-if="story" class="flex items-center gap-2 mb-2">
                        <span class="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Status:</span>
                        <BaseSelect 
                            v-model="story.status" 
                            :options="[
                                { label: 'Draft', value: 'draft' },
                                { label: 'In Progress', value: 'in_progress' },
                                { label: 'Finished', value: 'finished' }
                            ]"
                            class="w-32 text-xs"
                        />
                    </div>
                     <textarea 
                        v-if="story"
                        v-model="story.description"
                        rows="2"
                        class="w-full bg-white border border-stone-200 rounded-lg text-sm text-stone-600 p-2 resize-none"
                    ></textarea>
                 </div>

                 <!-- List -->
                  <div class="space-y-2">
                      <div class="flex items-center justify-between">
                          <h3 class="font-bold text-stone-900">Chapters</h3>
                           <button @click="createChapter" class="flex items-center gap-1 text-teal-600 text-sm font-medium"><Plus class="w-4 h-4"/> New</button>
                      </div>
                      <div 
                        v-for="chapter in chapters" 
                        :key="chapter.id"
                        class="p-3 rounded-lg border flex items-center justify-between"
                        :class="selectedChapterId === chapter.id ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white border-stone-200 text-stone-600'"
                        @click="handleMobileChapterSelect(chapter.id)"
                    >
                        <span>{{ chapter.index }}. {{ chapter.title || 'Untitled' }}</span>
                         <span v-if="chapter.status === 'published'" class="w-2 h-2 rounded-full bg-teal-500"></span>
                    </div>
                  </div>
            </div>

            <!-- 3. World Panel -->
            <div v-if="activeTab === 'world'" class="h-full overflow-hidden flex flex-col">
                <WorldPanel class="flex-1" @items-updated="handleWorldUpdate" />
            </div>

            <!-- 4. AI Panel -->
            <div v-if="activeTab === 'ai'" class="h-full flex flex-col">
                <AIChatPanel :context="aiContext" />
            </div>
            
        </div>

        <!-- Bottom Tab Bar -->
        <div class="h-16 bg-white border-t border-stone-200 flex items-center justify-around shrink-0 pb-safe">
            <button @click="activeTab = 'chapters'" class="flex flex-col items-center gap-1 p-2 transition-colors" :class="activeTab === 'chapters' ? 'text-teal-600' : 'text-stone-400'">
                <List class="w-5 h-5" />
                <span class="text-[10px] font-medium">Story</span>
            </button>
            <button @click="activeTab = 'editor'" class="flex flex-col items-center gap-1 p-2 transition-colors" :class="activeTab === 'editor' ? 'text-teal-600' : 'text-stone-400'">
                <PenTool class="w-5 h-5" />
                <span class="text-[10px] font-medium">Editor</span>
            </button>
            <button @click="activeTab = 'world'" class="flex flex-col items-center gap-1 p-2 transition-colors" :class="activeTab === 'world' ? 'text-teal-600' : 'text-stone-400'">
                <Globe class="w-5 h-5" />
                <span class="text-[10px] font-medium">World</span>
            </button>
            <button @click="activeTab = 'ai'" class="flex flex-col items-center gap-1 p-2 transition-colors" :class="activeTab === 'ai' ? 'text-teal-600' : 'text-stone-400'">
                <Sparkles class="w-5 h-5" />
                <span class="text-[10px] font-medium">AI</span>
            </button>
        </div>
        </div>

    <!-- Confirm Delete Modal -->
    <BaseModal
        :is-open="showDeleteModal"
        title="Delete Chapter?"
        description="Are you sure you want to delete this chapter? This cannot be undone."
        confirm-text="Delete"
        :is-destructive="true"
        @close="showDeleteModal = false"
        @confirm="executeDeleteChapter"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Sparkles, List, PenTool, Globe, Feather, ArrowLeft, Trash2 } from 'lucide-vue-next'
import Editor from '../../components/editor/Editor.vue'
import WorldPanel from '../../components/studio/WorldPanel.vue'
import BaseSelect from '../../components/ui/BaseSelect.vue'
import TutorialTip from '../../components/ui/TutorialTip.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import { GENRES, TONES } from '../../config/storyOptions'

const genreOptions = GENRES.map(g => ({ label: g, value: g }))
const toneOptions = TONES.map(t => ({ label: t, value: t }))

const route = useRoute()
const router = useRouter()
const worldPanel = ref()

// Mobile State
const activeTab = ref<string>('editor')

const handleMobileChapterSelect = (chapterId: string | number) => {
    selectedChapterId.value = chapterId
    activeTab.value = 'editor' // Switch back to editor after selection
}

// Resizing Logic
const leftSidebarWidth = ref(288) // 72 * 4 = 288px default
const rightSidebarWidth = ref(384) // 96 * 4 = 384px default
const leftSplitPercentage = ref(50) // 50% split height
const isResizing = ref<string | null>(null)

const startResize = (handle: string) => {
    isResizing.value = handle
    document.body.style.userSelect = 'none'
    document.body.style.cursor = handle === 'split' ? 'row-resize' : 'col-resize'
}

const stopResize = () => {
    isResizing.value = null
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
}

const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return

    if (isResizing.value === 'left') {
        // Limit width between 200px and 500px
        // Assuming sidebar is ~64px-256px. Using clientX - constant logic.
        // Adjust constant based on your layout (e.g. Main Sidebar width).
        // For now, using similar logic to previous valid one:
        leftSidebarWidth.value = Math.max(200, Math.min(e.clientX - 64, 500))
    }

    if (isResizing.value === 'right') {
        // Right sidebar width = Window Width - Mouse X - margins
        const newWidth = window.innerWidth - e.clientX - 32 // approx margin
        rightSidebarWidth.value = Math.max(250, Math.min(newWidth, 600))
    }

    if (isResizing.value === 'split') {
        // Vertical split in left sidebar associated with current container height
        // We need the container top offset. 
        // Simpler: just use percentage based on movementY? No.
        // Let's stick to a rough percentage update or just clamp it.
        // Accessing element bounding rect would be best but let's try heuristic.
        // e.clientY relative to the top of the Studio view.
        // Studio view top is approx 4rem (Header) + 2rem (Padding) = ~96px.
        const topOffset = 100 
        const containerHeight = window.innerHeight - topOffset
        const relativeY = e.clientY - topOffset
        const percent = (relativeY / containerHeight) * 100
        leftSplitPercentage.value = Math.max(20, Math.min(percent, 80))
    }
}

// const router = useRouter() // Ensure router is available if needed
const storyId = computed(() => route.params.id as string)
const story = ref<any>(null)
const chapters = ref<any[]>([])
const worldItems = ref<any[]>([])
const selectedChapterId = ref<string | number | null>(null)

const handleWorldUpdate = (items: any[]) => {
    worldItems.value = items
}

import AIChatPanel from '@/components/studio/AIChatPanel.vue'

// AI State


// AI Context
const aiContext = computed(() => {
    // Compute Summaries
    const currentIdx = selectedChapter.value?.index ?? -1
    
    // 1. Previous Chapter Summary
    // We look for index - 1.
    const prevChapter = chapters.value.find(c => c.index === currentIdx - 1)
    const summaryPreviousChapter = prevChapter?.summary || null
    
    // 2. Recent Context (3 chapters before previous)
    // Range: [currentIdx - 4, currentIdx - 2] inclusive
    // e.g. if current is 5 (Chapter 6). Prev is 4 (Chapter 5).
    // Recent Context: 1, 2, 3 (Indexes 0, 1, 2? No, indexes start at 1 usually? 
    // Schema says chapter_index is INT. Studio uses c.index. 
    // Let's assume indices are consistent.
    const recentContextChapters = chapters.value
        .filter(c => c.index >= currentIdx - 4 && c.index <= currentIdx - 2)
        .sort((a, b) => a.index - b.index)
        
    const summaryRecentContext = recentContextChapters.length > 0 
        ? recentContextChapters.map(c => `Chapter ${c.index}: ${c.summary || 'No summary'}`).join('\n')
        : null

    return {
        storyId: storyId.value,
        storyTitle: story.value?.title,
        currentChapter: selectedChapter.value?.title,
        chapter: { 
            title: selectedChapter.value?.title, 
            // Strip HTML tags for AI Context to encourage plain text/markdown response
            content: selectedChapter.value?.content?.replace(/<[^>]*>/g, '') || '',
            index: selectedChapter.value?.index 
        },
        status: story.value?.status,
        chapters: chapters.value.map(c => ({ title: c.title, index: c.index })),
        worldManifest: worldItems.value.map(w => ({ name: w.name, type: w.type })),
        
        // Include Summaries for AI
        summaryStory: story.value?.summary || null,
        summaryPreviousChapter,
        summaryRecentContext,
        aiRole: story.value?.ai_role, // Pass persisted AI role
        genre: story.value?.genre,
        tone: story.value?.tone
    }
})



// Editor instance
const editorInstance = ref<any>(null)
const setEditor = (editor: any) => {
    editorInstance.value = editor
}


// Computed properties must be declared before they are used in watchers or functions that might trigger them
const selectedChapter = computed(() => {
    if (!Array.isArray(chapters.value)) return undefined
    return chapters.value.find(c => c.id === selectedChapterId.value)
})

const currentChapterContent = computed({
    get: () => selectedChapter.value?.content || '',
    set: (val) => {
        if (selectedChapter.value) selectedChapter.value.content = val
    }
})

const currentChapterTitle = computed({
    get: () => selectedChapter.value?.title || '',
    set: (val) => {
        if (selectedChapter.value) selectedChapter.value.title = val
    }
})

const loadStory = async () => {
    if (!storyId.value) return
    try {
         const res = await fetch(`http://localhost:3001/api/stories/${storyId.value}`)
         if(res.ok) {
             story.value = await res.json()
         }
    } catch (e) {
        console.error("Failed to load story", e)
    }
}

const loadChapters = async () => {
    try {
        const res = await fetch(`http://localhost:3001/api/chapters/story/${storyId.value}`)
        if (!res.ok) throw new Error("Failed to fetch chapters")
        
        const data = await res.json()
        if (Array.isArray(data)) {
            chapters.value = data
        } else {
            chapters.value = []
            console.error("API did not return an array", data)
        }
        
        // Select first chapter if none selected
        if (!selectedChapterId.value && chapters.value.length > 0) {
            selectedChapterId.value = chapters.value[0].id
        }
    } catch (e) {
        console.error("Failed to load chapters", e)
        chapters.value = []
    }
}

const saveStory = async () => {
    if (!story.value) return
    try {
        await fetch(`http://localhost:3001/api/stories/${storyId.value}`, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 title: story.value.title,
                 status: story.value.status,
                 description: story.value.description,
                 summary: story.value.summary,
                 genre: story.value.genre, // Save Genre
                 tone: story.value.tone // Save Tone
             })
        })
    } catch (e) {
        console.error("Failed to save story", e)
    }
}

const togglePublishChapter = async () => {
    if (!selectedChapter.value) return
    
    const newStatus = selectedChapter.value.status === 'published' ? 'draft' : 'published'
    
    // Optimistic update
    selectedChapter.value.status = newStatus
    
    try {
        await fetch(`http://localhost:3001/api/chapters/${selectedChapter.value.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        })
    } catch (e) {
        console.error("Failed to update status", e)
        // Revert on failure
        selectedChapter.value.status = newStatus === 'published' ? 'draft' : 'published'
    }
}

const saveChapter = async () => {
    if (!selectedChapter.value) return
    try {
        await fetch(`http://localhost:3001/api/chapters/${selectedChapter.value.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: selectedChapter.value.title,
                content: selectedChapter.value.content,
                summary: selectedChapter.value.summary // Save summary
            })
        })
    } catch (e) {
        console.error("Failed to save", e)
    }
}

const isSummarizing = ref(false)
const summarizeChapter = async () => {
    if (!selectedChapter.value?.content || isSummarizing.value) return
    isSummarizing.value = true
    try {
         const token = localStorage.getItem('token')
         const res = await fetch('http://localhost:3001/api/ai/summarize', {
             method: 'POST',
             headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
             },
             body: JSON.stringify({ 
                 text: selectedChapter.value.content.replace(/<[^>]*>/g, ''), // Strip HTML
                 type: 'chapter' 
             })
         })
         
         if (res.ok) {
             const data = await res.json()
             selectedChapter.value.summary = data.summary
             // Save immediately
             await saveChapter()
         }
    } catch (e) {
        console.error("Summary failed", e)
    } finally {
        isSummarizing.value = false
    }
}

const updateStorySummary = async () => {
    if (!storyId.value || isSummarizing.value) return
    // Concatenate all chapter contents
    const fullText = chapters.value
        .map(c => `Chapter ${c.index}: ${c.title}\n${c.content?.replace(/<[^>]*>/g, '') || ''}`)
        .join('\n\n')
    
    if (fullText.length < 100) return 

    try {
         const token = localStorage.getItem('token')
         const res = await fetch('http://localhost:3001/api/ai/summarize', {
             method: 'POST',
             headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
             },
             body: JSON.stringify({ 
                 text: fullText,
                 type: 'story' 
             })
         })
         
         if (res.ok) {
             const data = await res.json()
             if (story.value) {
                 story.value.summary = data.summary
                 await saveStory()
             }
         }
    } catch (e) {
        console.error("Story Summary failed", e)
    }
}

const createChapter = async (initialData: any = {}) => {
    // Automatic Summarization Trigger
    if (selectedChapter.value && selectedChapter.value.content && selectedChapter.value.content.length > 50) {
        console.log("Auto-summarizing previous chapter and story...")
        await summarizeChapter() // Wait for chapter summary (critical for context)
        updateStorySummary() // Fire and forget story summary (heavy, can lag)
    }

    try {
        const res = await fetch('http://localhost:3001/api/chapters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storyId: storyId.value, ...initialData })
        })
        if (!res.ok) throw new Error("Failed to create chapter")
        
        const newChapter = await res.json()
        chapters.value.push(newChapter)
        
        // If content provided, update it immediately (since API might only take title/storyId)
        if (initialData.content) {
             // We need to update the newly created chapter with content
             // Optimistic update locally
             newChapter.content = initialData.content
             // Persist
             await fetch(`http://localhost:3001/api/chapters/${newChapter.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: initialData.content })
            })
        }

        selectedChapterId.value = newChapter.id
    } catch (e) {
        console.error("Failed to create chapter", e)
    }
}

const showDeleteModal = ref(false)
const chapterToDelete = ref<any>(null)

const confirmDeleteChapter = (chapter: any) => {
    chapterToDelete.value = chapter
    showDeleteModal.value = true
}

const executeDeleteChapter = async () => {
    if (!chapterToDelete.value) return
    
    try {
        await fetch(`http://localhost:3001/api/chapters/${chapterToDelete.value.id}`, { 
            method: 'DELETE'
        })
        
        // Remove locally
        chapters.value = chapters.value.filter(c => c.id !== chapterToDelete.value.id)
        
        // If deleted was selected, select another
        if (selectedChapterId.value === chapterToDelete.value.id) {
            selectedChapterId.value = chapters.value[0]?.id || null
        }
    } catch (e) {
        console.error("Failed to delete chapter", e)
    } finally {
        showDeleteModal.value = false
        chapterToDelete.value = null
    }
}

// --- History / Undo ---
const contentHistory = ref<string[]>([])

const pushHistory = () => {
    if (selectedChapter.value) {
        contentHistory.value.push(selectedChapter.value.content || '')
        // Limit history size
        if (contentHistory.value.length > 10) contentHistory.value.shift()
    }
}

const undoLastChange = () => {
    const prev = contentHistory.value.pop()
    if (prev !== undefined && selectedChapter.value) {
        selectedChapter.value.content = prev
    }
}

const isFormatting = ref(false)
const handleFormat = () => {
    if (!selectedChapter.value?.content) return
    
    isFormatting.value = true
    pushHistory()
    
    let text = selectedChapter.value.content || ''
    
    // 1. Split dialogues: If a sentence ends and a dialogue starts on same line (inside same <p>), break it.
    // Case: "Hello." — said John. (Standardize dashes first maybe?)
    
    // Standardize dialogue dashes to em-dash
    text = text.replace(/(\s|^)(-—|--|-|–)(\s)/g, '$1—$3')
    
    // Ensure dialogue starts on new paragraph if it follows punctuation
    // Looking for: Punctuation + Spaces + Dash/Quote
    // We assume HTML content, so we are looking for patterns inside <p> usually.
    // A simple approach is to replace any "—" that follows a sentence end with "</p><p>—"
    
    // Fix: Dialogue starting in the middle of a paragraph
    // Pattern: [.!?] + space + [—"«]
    text = text.replace(/([.!?])\s+(—|«|")/g, '$1</p><p>$2')
    
    // 2. Fix typography
    // Space before punctuation (French style - basic rule)
    text = text.replace(/([a-zA-Z])([:;?!])/g, '$1&nbsp;$2')
    
    // 3. Ensure paragraphs are not too long? (Optional, maybe too aggressive)
    
    // 4. Clean up Multiple empty paragraphs
    text = text.replace(/(<p><\/p>){2,}/g, '<p></p>')

    selectedChapter.value.content = text
    isFormatting.value = false
}

const md = new MarkdownIt()

const handleAiAction = async (action: any) => {
    console.log("Processing AI Action:", action)
    const { type, data } = action
    
    switch (type) {
        case 'update_story_title':
            if (story.value && data.title) {
                story.value.title = data.title
                // Watcher will save it
            }
            break;
            
        case 'update_chapter_title':
            if (selectedChapter.value && data.title) {
                selectedChapter.value.title = data.title
                // Watcher will save it
            }
            break;

        case 'update_chapter_content':
            if (selectedChapter.value && data.content) {
                pushHistory() // Save state before change
                // Render markdown to HTML
                currentChapterContent.value = md.render(data.content) 
                // content watcher handles save
            }
            break;

        case 'append_chapter_content':
            if (selectedChapter.value && data.content) {
                pushHistory() // Save state before change
                // Render markdown to HTML and append
                const newHtml = md.render(data.content)
                const current = currentChapterContent.value || ''
                // crude append: assuming newHtml is block level (p)
                currentChapterContent.value = current + newHtml
            }
            break;

        case 'create_chapter':
            if (data.title) {
                const content = data.content ? md.render(data.content) : ''
                await createChapter({ title: data.title, content: content })
            }
            break;

        case 'create_world_entity':
            if (worldPanel.value && data.name && data.type) {
                worldPanel.value.createItem(data)
            }
            break;

        case 'update_world_entity':
            if (worldPanel.value && data.id) {
                worldPanel.value.createItem(data)
            }
            break;
    }
}

// Watch for content changes to autosave (debounced ideally, but simple for now)
let timeout: any
watch(() => selectedChapter.value?.content, () => {
    clearTimeout(timeout)
    timeout = setTimeout(saveChapter, 1000)
})

watch(() => selectedChapter.value?.title, () => {
    clearTimeout(timeout)
    timeout = setTimeout(saveChapter, 1000)
})

// Auto-save story title
let storyTimeout: any
watch(() => story.value?.title, () => {
    clearTimeout(storyTimeout)
    storyTimeout = setTimeout(saveStory, 1000)
})

watch(() => story.value?.status, () => {
    saveStory() // Save immediately on dropdown change
})

watch(() => story.value?.description, () => {
    clearTimeout(storyTimeout)
    storyTimeout = setTimeout(saveStory, 1000)
})

onMounted(async () => {
    if (!storyId.value) {
        // No ID provided, find most recent story or redirect to new
        try {
            const res = await fetch('http://localhost:3001/api/stories/my')
            if (res.ok) {
                const stories = await res.json()
                if (stories.length > 0) {
                    // Redirect to most recent
                    router.replace(`/app/studio/${stories[0].id}`)
                    return
                }
            }
            // No stories, go to new story
            router.replace('/app/new-story')
        } catch (e) {
            console.error("Failed to check stories", e)
             router.replace('/app/new-story')
        }
        return
    }

    loadStory()
    loadChapters()
})

watch(() => route.params.id, (newId) => {
    if (newId) {
        loadStory()
        loadChapters()
    }
})
</script>
