<template>
  <div class="h-[calc(100vh-6rem)] flex flex-col md:flex-row bg-stone-50 overflow-hidden">
      
      <!-- Left Sidebar: Filters & Collections -->
      <aside class="w-full md:w-64 bg-white border-r border-stone-200 flex flex-col shrink-0 z-20">
          <div class="p-6 border-b border-stone-100">
              <h1 class="text-2xl font-serif font-bold text-stone-900 mb-2">Library</h1>
              <p class="text-xs text-stone-500">Your curated collection of stories.</p>
          </div>

          <nav class="flex-1 overflow-y-auto p-4 space-y-6">
              <!-- Main Filters -->
              <div class="space-y-1">
                  <h3 class="px-3 text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">View</h3>
                  <button 
                    v-for="filter in filters" 
                    :key="filter.id"
                    @click="activeFilter = filter.id"
                    class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 group border border-transparent"
                    :class="activeFilter === filter.id ? 'bg-indigo-50 text-indigo-900 border-indigo-100' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'"
                  >
                      <component :is="filter.icon" class="w-4 h-4" :class="activeFilter === filter.id ? 'text-indigo-600' : 'text-stone-400 group-hover:text-stone-600'" />
                      {{ filter.label }}
                      <span v-if="filter.count > 0" class="ml-auto text-xs opacity-60 bg-white px-1.5 rounded-full shadow-sm">{{ filter.count }}</span>
                  </button>
              </div>

              <!-- Collections (Tags) -->
              <div class="space-y-1">
                   <div class="px-3 flex items-center justify-between mb-2">
                        <h3 class="text-xs font-bold text-stone-400 uppercase tracking-widest">Collections</h3>
                   </div>
                   <div v-if="userTags.length === 0" class="px-3 text-xs text-stone-400 italic">No tags found.</div>
                   <button 
                    v-for="tag in userTags" 
                    :key="tag"
                    @click="toggleTag(tag)"
                    class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 group"
                     :class="selectedTags.includes(tag) ? 'bg-indigo-50 text-indigo-900 font-medium' : 'text-stone-600 hover:bg-stone-50'"
                   >
                    <span class="w-2 h-2 rounded-full border border-stone-300 group-hover:border-indigo-400" :class="selectedTags.includes(tag) ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent'"></span>
                    {{ tag }}
                   </button>
              </div>
          </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden bg-stone-50 relative">
          
          <!-- Top Bar: Search & Sort -->
          <div class="h-16 border-b border-stone-200 bg-white/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 shrink-0 z-10 sticky top-0">
              <div class="relative w-full max-w-xs md:max-w-md group">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    v-model="searchQuery"
                    placeholder="Search your library..." 
                    class="w-full bg-white border border-stone-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm hover:border-stone-300"
                  />
              </div>

              <div class="flex items-center gap-3">
                  <select 
                    v-model="sortBy" 
                    class="bg-white border border-stone-200 text-stone-600 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none cursor-pointer hover:border-stone-300"
                  >
                    <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                  <button class="p-2 text-stone-400 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-100">
                      <LayoutGrid class="w-5 h-5" v-if="viewMode === 'list'" @click="viewMode = 'grid'" />
                      <ListIcon class="w-5 h-5" v-else @click="viewMode = 'list'" />
                  </button>
              </div>
          </div>

          <!-- Content Grid/List -->
          <div class="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
              
              <div v-if="loading" class="flex items-center justify-center h-40">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>

              <div v-else-if="filteredStories.length === 0" class="flex flex-col items-center justify-center h-64 text-stone-400 text-center">
                  <BookOpen class="w-12 h-12 mb-4 opacity-20" />
                  <p class="text-lg font-serif text-stone-500">Your library is empty.</p>
                  <p class="text-sm">Explore the community to find great stories.</p>
                  <button @click="$router.push('/app/community')" class="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors hover-sketch">
                      Browse Stories
                  </button>
              </div>
            
              <!-- Grid View -->
              <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div 
                    v-for="item in filteredStories" 
                    :key="item.id"
                    class="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all group cursor-pointer flex flex-col h-full"
                    @click="openReader(item)"
                  >
                        <!-- Cover -->
                        <div class="h-40 bg-stone-100 relative overflow-hidden">
                             <div class="absolute inset-0 flex items-center justify-center text-stone-300 font-serif text-2xl font-bold opacity-30 select-none">
                                {{ item.title[0] }}
                             </div>
                             <!-- Progress Bar Overlay -->
                             <div class="absolute bottom-0 left-0 right-0 h-1 bg-stone-200/50" v-if="getProgress(item) > 0">
                                 <div class="h-full bg-indigo-500 transition-all" :style="{ width: getProgress(item) + '%' }"></div>
                             </div>
                        </div>

                        <div class="p-4 flex-1 flex flex-col">
                            <h3 class="font-serif font-bold text-stone-900 line-clamp-2 mb-1 group-hover:text-indigo-700 transition-colors">{{ item.title }}</h3>
                            <p class="text-xs text-stone-500 mb-4 block">by {{ item.author_name || 'Anonymous' }}</p>
                            
                            <div class="mt-auto flex items-center justify-between text-xs text-stone-400">
                                <span v-if="item.last_read_at || getProgress(item) > 0" class="text-indigo-600 font-medium">
                                    {{ getProgress(item) >= 100 ? 'Finished' : (getProgress(item) > 0 ? 'In Progress' : 'Not Started') }}
                                </span>
                                <span v-else>Not Started</span>
                            </div>
                        </div>
                  </div>
              </div>

               <!-- List View -->
               <div v-else class="space-y-2">
                   <div 
                    v-for="item in filteredStories" 
                    :key="item.id"
                    class="bg-white border border-stone-200 rounded-lg p-4 flex items-center gap-4 hover:border-indigo-500/30 hover:shadow-sm transition-all cursor-pointer group"
                    @click="openReader(item)"
                   >
                        <div class="w-12 h-16 bg-stone-100 rounded flex items-center justify-center text-stone-300 font-serif font-bold shrink-0">
                            {{ item.title[0] }}
                        </div>
                        <div class="flex-1 min-w-0">
                             <h3 class="font-serif font-bold text-stone-900 truncate group-hover:text-indigo-700 transition-colors">{{ item.title }}</h3>
                             <p class="text-xs text-stone-500">by {{ item.author_name || 'Anonymous' }}</p>
                        </div>
                         
                         <div class="flex flex-col items-end gap-1 text-xs text-stone-500 shrink-0 w-32">
                             <div class="w-full bg-stone-100 rounded-full h-1.5 mb-1" v-if="getProgress(item) > 0">
                                 <div class="h-full bg-indigo-500 rounded-full" :style="{ width: getProgress(item) + '%' }"></div>
                             </div>
                             <span>{{ getProgressLabel(item) }}</span>
                         </div>
                    </div>
            </div>
        </div>
      </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
    Library, BookOpen, Clock, CheckCircle, Heart, Search, LayoutGrid, List as ListIcon 
} from 'lucide-vue-next'

const router = useRouter()
const USER_ID = '11111111-1111-1111-1111-111111111111'

// State
const allStories = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('all')
const selectedTags = ref<string[]>([])
const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref('recent')

// Config
const filters = computed(() => [
    { id: 'all', label: 'All Stories', icon: Library, count: allStories.value.length },
    { id: 'in_progress', label: 'In Progress', icon: Clock, count: allStories.value.filter(s => getProgress(s) > 0 && getProgress(s) < 100).length },
    { id: 'finished', label: 'Finished', icon: CheckCircle, count: allStories.value.filter(s => getProgress(s) >= 100).length },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: allStories.value.filter(s => s.is_liked).length }
])

const sortOptions = [
    { label: 'Recently Read', value: 'recent' },
    { label: 'Alphabetical', value: 'alpha' },
    { label: 'Progress', value: 'progress' }
]

const userTags = computed(() => {
    const tags = new Set<string>()
    allStories.value.forEach(s => {
        if (s.genre) tags.add(s.genre)
        if (s.tags) s.tags.forEach((t: string) => tags.add(t))
    })
    return Array.from(tags)
})

// Helpers
const getProgress = (story: any) => {
    if (!story.total_chapters) return 0
    return Math.min(100, Math.round(((story.read_chapters_count || 0) / story.total_chapters) * 100))
}

const getProgressLabel = (story: any) => {
    const p = getProgress(story)
    if (p >= 100) return 'Finished'
    if (p > 0) return `${p}% Complete`
    return 'Not Started'
}

const toggleTag = (tag: string) => {
    if (selectedTags.value.includes(tag)) {
        selectedTags.value = selectedTags.value.filter(t => t !== tag)
    } else {
        selectedTags.value.push(tag)
    }
}

const openReader = (story: any) => {
    router.push(`/app/read/${story.id}`)
}

// Data Fetching
const fetchLibrary = async () => {
    try {
        loading.value = true
        // Fetch all user lists and flatten stories
        const res = await fetch(`http://localhost:3001/api/library/${USER_ID}`)
        if (res.ok) {
            const data = await res.json()
            const flatStories = new Map()
            if (Array.isArray(data)) {
                 data.forEach((list: any) => {
                     if (list.stories) {
                         list.stories.forEach((s: any) => {
                             if (!flatStories.has(s.id)) flatStories.set(s.id, s)
                         })
                     }
                 })
            }
            allStories.value = Array.from(flatStories.values())
        }
    } catch (e) {
        console.error("Failed to load library", e)
    } finally {
        loading.value = false
    }
}

// Computed Data
const filteredStories = computed(() => {
    let result = allStories.value

    // Filter by Tab
    if (activeFilter.value === 'in_progress') {
        result = result.filter(s => getProgress(s) > 0 && getProgress(s) < 100)
    } else if (activeFilter.value === 'finished') {
         result = result.filter(s => getProgress(s) >= 100)
    } else if (activeFilter.value === 'favorites') {
        result = result.filter(s => s.is_liked)
    }

    // Filter by Tags
    if (selectedTags.value.length > 0) {
        result = result.filter(s => {
            const sTags = [s.genre, ...(s.tags || [])]
            return selectedTags.value.some(t => sTags.includes(t))
        })
    }

    // Search
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(s => s.title.toLowerCase().includes(q) || (s.author_name && s.author_name.toLowerCase().includes(q)))
    }

    // Sort
    result = [...result].sort((a, b) => {
        if (sortBy.value === 'alpha') return a.title.localeCompare(b.title)
        if (sortBy.value === 'progress') return getProgress(b) - getProgress(a)
        // Default recent
        const dateA = new Date(a.last_read_at || a.updated_at || 0).getTime()
        const dateB = new Date(b.last_read_at || b.updated_at || 0).getTime()
        return dateB - dateA
    })

    return result
})

onMounted(() => {
    fetchLibrary()
})
</script>

<style scoped>
</style>
