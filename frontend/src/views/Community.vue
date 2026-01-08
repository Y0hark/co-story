<template>
  <div class="max-w-6xl mx-auto space-y-8 bg-stone-50 min-h-screen">
    <div class="flex flex-col items-center text-center space-y-6 py-6 md:py-10">
      <div class="space-y-2">
        <h1 class="text-3xl md:text-4xl font-serif font-bold text-stone-900">Discover Stories</h1>
        <p class="text-stone-500 max-w-lg mx-auto">Explore a growing collection of stories published by our community.</p>
      </div>
      
      <div class="w-full max-w-lg mx-auto relative group">
          <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search class="w-4 h-4 text-stone-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Search stories by title or description..." 
            class="w-full bg-white border border-stone-200 rounded-full pl-10 pr-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-stone-900 placeholder:text-stone-400 shadow-sm transition-all hover:border-stone-300"
           />
      </div>
    </div>

    <!-- Categories / Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide px-4 md:px-0">
        <button 
            v-for="cat in categories" 
            :key="cat"
            class="px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-all shadow-sm"
            :class="selectedCategory === cat ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'"
            @click="selectedCategory = cat"
        >
            {{ cat }}
        </button>
    </div>

    <!-- Featured Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0 pb-12">
        <div 
            v-for="story in filteredStories" 
            :key="story.id"
            class="group bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-indigo-500/30 hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
            @click="$router.push(`/app/read/${story.id}`)"
        >
            <!-- Cover Placeholder -->
            <div class="h-48 bg-stone-100 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent z-10"></div>
                <!-- Actual image would go here -->
                <div class="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400 font-mono text-xs">
                    {{ story.title }} Cover
                </div>
                
                <div class="absolute top-4 right-4 z-20">
                     <span class="px-2 py-1 rounded bg-white/90 backdrop-blur text-xs text-stone-900 font-medium border border-stone-200 shadow-sm">
                         {{ story.genre || story.mode || 'Fiction' }}
                     </span>
                </div>
            </div>

            <div class="p-6 flex-1 flex flex-col">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold border border-indigo-100 uppercase">
                        {{ story.author_name?.[0] || 'A' }}
                    </div>
                    <span class="text-xs text-stone-500">{{ story.author_name || 'Anonymous' }}</span>
                    <span 
                        v-if="story.status"
                        class="ml-auto text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border"
                        :class="getStatusColor(story.status)"
                    >
                        {{ getStatusLabel(story.status) }}
                    </span>
                </div>

                <h3 class="text-lg font-serif font-bold text-stone-900 mb-2 group-hover:text-indigo-700 transition-colors">{{ story.title }}</h3>
                <p class="text-sm text-stone-500 line-clamp-3 mb-4 flex-1">
                    {{ story.description || "No description provided." }}
                </p>

                <div class="flex items-center justify-between text-xs text-stone-400 pt-4 border-t border-stone-100">
                    <div class="flex items-center gap-3">
                        <span class="flex items-center gap-1"><BookOpen class="w-3 h-3" /> {{ story.chapters_count || 0 }}</span>
                    </div>
                    
                    <button 
                        @click.stop="() => toggleLike(story)"
                        class="flex items-center gap-1 transition-colors z-30 relative group/like"
                        :class="story.is_liked ? 'text-rose-500' : 'text-stone-400 hover:text-rose-500'"
                    >
                        <Heart class="w-3 h-3" :fill="story.is_liked ? 'currentColor' : 'none'" /> 
                        {{ story.likes_count || 0 }}
                    </button>
                    
                    <button 
                        @click.stop="openLibraryModal(story)"
                        class="p-1 text-stone-400 hover:text-indigo-600 transition-colors hover-sketch bg-stone-50 rounded-full"
                        title="Add to Library"
                    >
                        <Bookmark class="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <AddToLibraryModal 
        v-if="showLibraryModal"
        :is-open="showLibraryModal"
        :story-id="selectedStory?.id"
        :story-title="selectedStory?.title"
        @close="showLibraryModal = false"
        @added="() => {}" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { BookOpen, Heart, Bookmark, Search } from 'lucide-vue-next'

import AddToLibraryModal from '../components/library/AddToLibraryModal.vue'

// Mock User ID
const USER_ID = '11111111-1111-1111-1111-111111111111'

const categories = ['All', 'Sci-Fi', 'Fantasy', 'Romance', 'Mystery', 'Cyberpunk', 'Historical']
const selectedCategory = ref('All')

const stories = ref<any[]>([])
const showLibraryModal = ref(false)
const selectedStory = ref<any>(null)
const searchQuery = ref('')

const openLibraryModal = (story: any) => {
    selectedStory.value = story
    showLibraryModal.value = true
}

const fetchStories = async (query?: string) => {
    try {
        // Must pass userId to get is_liked status
        const url = new URL('http://localhost:3001/api/stories')
        url.searchParams.append('userId', USER_ID)
        if (query) url.searchParams.append('q', query)

        const res = await fetch(url.toString()) 
        if (res.ok) {
            stories.value = await res.json()
        }
    } catch (e) {
        console.error("Failed to fetch stories", e)
    }
}

// Debounced Search
let searchTimeout: any
watch(searchQuery, (newVal) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        fetchStories(newVal)
    }, 500)
})

const toggleLike = async (story: any) => {
    try {
        const res = await fetch(`http://localhost:3001/api/likes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID, resourceId: story.id, resourceType: 'story' })
        });
        
        if (res.ok) {
            const data = await res.json();
            story.is_liked = data.liked;
            story.likes_count = data.count;
        }
    } catch (e) { console.error(e) }
}

const filteredStories = computed(() => {
    // If backend handles search, client side filtering might be redundant for search terms, 
    // but we still need category filtering.
    // If we want combined filtering (search + category), backend should handle both OR we filter category locally.
    // Current approach: Search is backend (returns matching text), Category is frontend (filters those results).
    
    let result = stories.value

    if (selectedCategory.value !== 'All') {
        result = result.filter(story => {
            const genre = story.genre || story.mode || 'Fiction'
            return genre.toLowerCase() === selectedCategory.value.toLowerCase()
        })
    }
    return result
})

const getStatusColor = (status: string) => {
    switch (status) {
        case 'finished': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
        case 'abandoned': return 'bg-rose-50 text-rose-700 border-rose-200'
        case 'draft': return 'bg-stone-100 text-stone-600 border-stone-200'
        default: return 'bg-amber-50 text-amber-700 border-amber-200' // In Progress
    }
}

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'finished': return 'Finished'
        case 'abandoned': return 'Abandoned'
        case 'draft': return 'Draft'
        default: return 'In Progress'
    }
}

onMounted(() => {
    fetchStories()
})
</script>
