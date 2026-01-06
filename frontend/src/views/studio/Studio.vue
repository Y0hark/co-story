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
                <input 
                    v-if="story"
                    type="text" 
                    v-model="story.title"
                    class="w-full bg-transparent font-serif font-bold text-stone-900 placeholder:text-stone-400 border-none outline-none focus:ring-0 px-0 text-base"
                    placeholder="Story Title..."
                />
                <div v-if="story" class="mt-2 flex items-center gap-2">
                    <BaseSelect 
                        v-model="story.status" 
                        :options="[
                            { label: 'Draft', value: 'draft' },
                            { label: 'In Progress', value: 'in_progress' },
                            { label: 'Finished', value: 'finished' },
                            { label: 'Abandoned', value: 'abandoned' }
                        ]"
                        class="w-32"
                    />
                    <span class="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Status</span>
                </div>
                
                <textarea 
                    v-if="story"
                    v-model="story.description"
                    rows="2"
                    placeholder="Story description..."
                    class="w-full bg-stone-50 border-none rounded-lg text-xs text-stone-600 placeholder:text-stone-400 mt-3 p-2 resize-none focus:ring-1 focus:ring-teal-500"
                ></textarea>
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
                class="px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors border"
                :class="selectedChapterId === chapter.id ? 'bg-stone-100 text-teal-700 border-stone-200 font-medium' : 'bg-white border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-50'"
                @click="selectedChapterId = chapter.id"
            >
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-2 overflow-hidden">
                        <span class="text-xs opacity-50 shrink-0">{{ chapter.index }}.</span>
                        <span class="truncate">{{ chapter.title }}</span>
                    </div>
                    <div v-if="chapter.status === 'published'" class="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 ml-2" title="Published"></div>
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
            <WorldPanel class="h-full" />
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
            <div v-if="selectedChapter">
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
            @request-ai-edit="handleAiEditRequest"
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
             <AIChatPanel :context="aiContext" :selection="selectedText" />
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
                        @request-ai-edit="handleAiEditRequest"
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
                <WorldPanel class="flex-1" />
            </div>

            <!-- 4. AI Panel -->
            <div v-if="activeTab === 'ai'" class="h-full flex flex-col">
                <AIChatPanel :context="aiContext" :selection="selectedText" />
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

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Sparkles, List, PenTool, Globe } from 'lucide-vue-next'
import Editor from '../../components/editor/Editor.vue'
import WorldPanel from '../../components/studio/WorldPanel.vue'
import BaseSelect from '../../components/ui/BaseSelect.vue'

const route = useRoute()
const router = useRouter()

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
const selectedChapterId = ref<string | number | null>(null)

import AIChatPanel from '@/components/studio/AIChatPanel.vue'

// AI State
const selectedText = ref('')

// AI Context
const aiContext = computed(() => ({
    storyTitle: story.value?.title,
    currentChapter: selectedChapter.value?.title,
    status: story.value?.status
}))

const handleAiEditRequest = (selection: any) => {
    // Tiptap selection object: { from, to, empty }
    if (!editorInstance.value) return
    
    const { from, to, empty } = selection
    if (empty) return
    
    const text = editorInstance.value.state.doc.textBetween(from, to, ' ')
    selectedText.value = text
    
    // Mobile: Switch tab
    if (window.innerWidth < 768) {
        activeTab.value = 'ai'
    }
}

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
                 description: story.value.description
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
                content: selectedChapter.value.content
            })
        })
    } catch (e) {
        console.error("Failed to save", e)
    }
}

const createChapter = async () => {
    try {
        const res = await fetch('http://localhost:3001/api/chapters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storyId: storyId.value })
        })
        if (!res.ok) throw new Error("Failed to create chapter")
        
        const newChapter = await res.json()
        chapters.value.push(newChapter)
        selectedChapterId.value = newChapter.id
    } catch (e) {
        console.error("Failed to create chapter", e)
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
