<template>
  <div class="h-[calc(100vh-4rem-2rem)] flex" @mousemove="handleMouseMove" @mouseup="stopResize" @mouseleave="stopResize">
    
    <!-- Left Sidebar: Split View (Chapters & World) -->
    <aside class="flex flex-col gap-4 shrink-0 transition-none" :style="{ width: leftSidebarWidth + 'px' }">
      
      <!-- Top: Chapters -->
      <div 
        class="bg-white border border-stone-200 rounded-xl flex flex-col overflow-hidden shadow-sm min-h-[150px]"
        :style="{ height: leftSplitPercentage + '%' }"
      >
        <div class="p-4 border-b border-stone-200 flex items-center justify-between shrink-0">
          <h2 class="font-bold font-serif text-stone-900">Chapters</h2>
           <button class="text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded p-1 transition-colors">
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
              <div class="flex items-center gap-2">
                  <span class="text-xs opacity-50">{{ chapter.index }}.</span>
                  {{ chapter.title }}
              </div>
          </div>
        </div>
        <div class="p-4 border-t border-stone-200 bg-stone-50 shrink-0">
          <button class="w-full py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-lg text-sm font-medium transition-colors shadow-sm">
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
       <!-- Editor Title Input -->
       <div class="border-b border-stone-100 p-6 pb-2">
            <input 
            type="text" 
            v-model="currentChapterTitle"
            placeholder="Chapter Title"
            class="w-full bg-transparent text-3xl font-serif font-bold text-stone-900 placeholder:text-stone-300 border-none outline-none focus:ring-0 px-0"
           />
       </div>

      <Editor v-model="currentChapterContent" />
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
       <div class="p-4 border-b border-stone-200 flex items-center justify-between bg-gradient-to-r from-teal-50 to-amber-50">
        <h2 class="font-bold font-serif text-teal-900 flex items-center gap-2">
           <Sparkles class="w-4 h-4 text-teal-600" />
           Co-Author
        </h2>
        <div class="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
      </div>
       <div class="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center text-stone-400">
          <Bot class="w-12 h-12 mb-3 text-stone-300" />
          <p class="text-sm">AI Suggestions will appear here as you write.</p>
      </div>
       <div class="p-4 border-t border-stone-200 bg-stone-50">
          <div class="relative">
              <input 
                type="text" 
                placeholder="Ask Co-Story to help..." 
                class="w-full pl-4 pr-10 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none placeholder:text-stone-400"
              />
              <button class="absolute right-2 top-1.5 p-1 rounded-md text-teal-600 hover:bg-teal-50 transition-colors">
                  <Send class="w-4 h-4" />
              </button>
          </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Sparkles, Send, Bot, Globe } from 'lucide-vue-next'
import Editor from '../../components/editor/Editor.vue'
import WorldPanel from '../../components/studio/WorldPanel.vue'

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
        const newWidth = Math.max(200, Math.min(e.clientX - 64, 500)) // 64 is approx Sidebar Icon offset if using main sidebar, but here we assume relative to start
        // Better: relative to window
        // Simplified for this context:
        leftSidebarWidth.value = Math.max(200, Math.min(e.clientX - 256, 600)) // Adjust offset based on MainLayout sidebar (w-64 = 256px?? No Sidebar is separate).
         // Wait, Sidebar.vue is w-64? Let's check MainLayout. The sidebar is likely w-64 (256px).
         // e.clientX includes the sidebar width (if it's fixed). 
         // Let's assume the router-view starts after the sidebar.
         // Actually, let's just use movementX if we want simpler logic, or stick to clientX minus offset.
         // Assuming MainLayout sidebar is 256px + padding.
         leftSidebarWidth.value = Math.max(200, Math.min(e.clientX - 80, 600)  ) // Approximate correction
         // Let's use flexible logic:
         // Since this view is inside router-view, and we don't know exact offset easily without element Ref, 
         // let's try a simple approach: 
         // Actually, e.clientX is global. Left sidebar ends at 64px approx (icon sidebar) or 250px (full sidebar).
         // The Sidebar.vue seems to be w-16 or w-64? 
         // Previous step said "w-64" for sidebar. So that's 256px.
         // MainLayout usually has padding.
         // Let's just update based on delta for robustness next time, but for now let's guess offset is roughly 250-300.
         // Actually, simpler: just set it to e.clientX - 280 (approx sidebar width + margins).
          leftSidebarWidth.value = Math.max(200, Math.min(e.clientX - 270, 500))
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

// Mock Data
const chapters = ref([
    { id: 1, index: 1, title: 'The Call', content: '<p>The phone rang at midnight, slicing through the silence like a knife...</p>' },
    { id: 2, index: 2, title: 'Departure', content: '' },
])

const selectedChapterId = ref(1)

const selectedChapter = computed(() => {
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
</script>
