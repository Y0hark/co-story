<template>
  <div class="h-[calc(100vh-6rem)] flex flex-col md:flex-row bg-stone-50 overflow-hidden">
      
      <!-- Left Sidebar: Filters & Collections -->
      <aside class="w-full md:w-64 bg-white border-r border-stone-200 flex flex-col shrink-0 z-20">
          <div class="p-6 border-b border-stone-100">
              <div class="flex items-center gap-2 mb-2">
                  <h1 class="text-2xl font-serif font-bold text-stone-900">Library</h1>
                  <span 
                      v-if="stats?.subscription?.tier && stats.subscription.tier !== 'free'"
                      class="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold border shadow-sm"
                      :class="{
                          'bg-emerald-50 text-emerald-700 border-emerald-200': stats.subscription.tier === 'scribe',
                          'bg-indigo-50 text-indigo-700 border-indigo-200': stats.subscription.tier === 'storyteller',
                          'bg-purple-50 text-purple-700 border-purple-200': stats.subscription.tier === 'architect',
                          'bg-stone-100 text-stone-600 border-stone-200': stats.subscription.tier === 'pro'
                      }"
                  >
                      {{ stats.subscription.tier }}
                  </span>
              </div>
              <p class="text-xs text-stone-500">Your curated collection of stories.</p>
          </div>
          
          <nav class="flex-1 overflow-y-auto p-4 space-y-6">
              <!-- Main Filters -->
              <div class="space-y-1">
                  <h3 class="px-3 text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">View</h3>
                  <button 
                    v-for="filter in filters" 
                    :key="filter.id"
                    @click="selectFilter(filter.id)"
                    class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 group border border-transparent"
                    :class="activeFilter === filter.id ? 'bg-indigo-50 text-indigo-900 border-indigo-100' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'"
                  >
                      <component :is="filter.icon" class="w-4 h-4" :class="activeFilter === filter.id ? 'text-indigo-600' : 'text-stone-400 group-hover:text-stone-600'" />
                      {{ filter.label }}
                      <span v-if="filter.count > 0" class="ml-auto text-xs opacity-60 bg-white px-1.5 rounded-full shadow-sm">{{ filter.count }}</span>
                  </button>
              </div>

              <!-- Collections (Lists) -->
              <div class="space-y-1">
                   <div class="px-3 flex items-center justify-between mb-2">
                        <h3 class="text-xs font-bold text-stone-400 uppercase tracking-widest">Collections</h3>
                        <button 
                            @click="createCollection"
                            class="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                            title="New Collection"
                        >
                            <Plus class="w-3 h-3" />
                        </button>
                   </div>
                   <div v-if="lists.length === 0" class="px-3 text-xs text-stone-400 italic">No collections yet.</div>
                   <button 
                    v-for="list in lists" 
                    :key="list.id"
                    @click="selectList(list.id)"
                    class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 group"
                     :class="selectedListId === list.id ? 'bg-indigo-50 text-indigo-900 font-medium' : 'text-stone-600 hover:bg-stone-50'"
                   >
                    <Folder class="w-3.5 h-3.5" :class="selectedListId === list.id ? 'text-indigo-500' : 'text-stone-400 group-hover:text-stone-500'" />
                    {{ list.name }}
                    <span class="ml-auto text-xs text-stone-300 group-hover:text-stone-400">{{ list.stories?.length || 0 }}</span>
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
                  <div class="relative group">
                        <select 
                            v-model="sortBy" 
                            class="appearance-none bg-white border border-stone-200 text-stone-600 text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer hover:border-stone-300 shadow-sm transition-all font-medium"
                        >
                            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                        </select>
                        <ChevronDown class="w-4 h-4 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-stone-600 transition-colors" />
                  </div>
                  
                  <div class="flex bg-white border border-stone-200 rounded-lg p-0.5 shadow-sm">
                        <button 
                            class="p-1.5 rounded-md transition-all"
                            :class="viewMode === 'grid' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'"
                            @click="viewMode = 'grid'"
                        >
                            <LayoutGrid class="w-4 h-4" />
                        </button>
                         <button 
                            class="p-1.5 rounded-md transition-all"
                            :class="viewMode === 'list' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'"
                            @click="viewMode = 'list'"
                        >
                            <ListIcon class="w-4 h-4" />
                        </button>
                  </div>
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

      <!-- Create Collection Modal -->
      <BaseModal
        :is-open="showCreateCollectionModal"
        title="New Collection"
        description="Create a new collection to organize your stories."
        confirm-text="Create"
        @close="showCreateCollectionModal = false"
        @confirm="confirmCreateCollection"
      >
        <div class="mt-4">
            <label class="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Collection Name</label>
            <input 
                v-model="newCollectionName" 
                type="text" 
                class="w-full bg-stone-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-stone-800 placeholder:text-stone-400 text-sm py-2.5 px-3 transition-all"
                placeholder="e.g. Sci-Fi Ideas"
                @keyup.enter="confirmCreateCollection"
                autoFocus
            />
        </div>
      </BaseModal>

      <!-- Upgrade Modal -->
      <BaseModal
        :is-open="showUpgradeModal"
        title="Limit Reached"
        :description="`You've reached the collection limit for your current plan. Upgrade to unlock more collections and features.`"
        confirm-text="Upgrade"
        @close="showUpgradeModal = false"
        @confirm="$router.push('/app/subscription')"
      >
        <div class="bg-indigo-50 rounded-lg p-4 mt-2 border border-indigo-100">
            <div class="flex items-center gap-2 text-indigo-700 font-medium text-sm mb-1">
                <Sparkles class="w-4 h-4" />
                <span>Unlock Limitless Creativity</span>
            </div>
            <p class="text-xs text-indigo-600/80">
                Get unlimited collections, advanced AI models, and more storage with our Pro plans.
            </p>
        </div>
      </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BaseModal from '../components/ui/BaseModal.vue'
import { 
    Library, BookOpen, Clock, CheckCircle, Heart, Search, LayoutGrid, List as ListIcon, ChevronDown, Plus, Sparkles, Folder
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// State
const lists = ref<any[]>([])
const allStories = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('all') // 'all', 'in_progress', 'finished', 'favorites'
const selectedListId = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref('recent')
const stats = ref<any>(null)

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

// Modal State
const showCreateCollectionModal = ref(false)
const showUpgradeModal = ref(false)
const newCollectionName = ref('')

const createCollection = () => {
    // Check limits based on tier
    const tier = stats.value?.subscription?.tier || 'free';
    // User lists count (excluding "Saved" is common, but let's count all user created ones)
    // The backend endpoint likely returns all lists including default ones if any.
    const currentCount = lists.value.length;
    
    let limit = 1; // Free
    if (tier === 'scribe') limit = 3;
    if (tier === 'storyteller' || tier === 'architect' || tier === 'pro') limit = 999;
    
    if (currentCount >= limit) {
        showUpgradeModal.value = true;
        return;
    }
    
    newCollectionName.value = ''
    showCreateCollectionModal.value = true
}

const confirmCreateCollection = async () => {
    if (!newCollectionName.value.trim() || !authStore.user?.id) return;
    
    try {
        const res = await fetch('http://localhost:3001/api/library/lists', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ userId: authStore.user.id, name: newCollectionName.value.trim() })
        })
        
        if (res.ok) {
            const newList = await res.json()
            lists.value.push({ ...newList, stories: [] })
            showCreateCollectionModal.value = false
        }
    } catch (e) {
        console.error("Failed to create collection", e)
    }
}

const selectList = (listId: string) => {
    if (selectedListId.value === listId) {
        selectedListId.value = null // toggle off
    } else {
        selectedListId.value = listId
        activeFilter.value = '' // clear main filter if list selected
    }
}

const selectFilter = (filterId: string) => {
    activeFilter.value = filterId
    selectedListId.value = null // clear list selection
}

const openReader = (story: any) => {
    router.push(`/app/read/${story.id}`)
}

// Data Fetching
const fetchLibrary = async () => {
    try {
        loading.value = true
        
        // Fetch Stats
        if (authStore.user?.id) {
            fetch(`http://localhost:3001/api/users/${authStore.user.id}/stats`)
                .then(r => r.json())
                .then(d => stats.value = d)
                .catch(e => console.error("Stats fail", e))

            // Fetch all user lists and flatten stories
            const res = await fetch(`http://localhost:3001/api/library/${authStore.user.id}`)
            if (res.ok) {
                const data = await res.json()
                lists.value = data;

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

    // 1. Filter by List Selection
    if (selectedListId.value) {
        const list = lists.value.find(l => l.id === selectedListId.value)
        if (list) {
            result = list.stories || []
        } else {
            result = []
        }
    } 
    // 2. OR Filter by Tab (only if no list selected)
    else {
        if (activeFilter.value === 'in_progress') {
            result = result.filter(s => getProgress(s) > 0 && getProgress(s) < 100)
        } else if (activeFilter.value === 'finished') {
             result = result.filter(s => getProgress(s) >= 100)
        } else if (activeFilter.value === 'favorites') {
            result = result.filter(s => s.is_liked)
        }
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
