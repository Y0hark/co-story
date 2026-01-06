<template>
  <div class="space-y-6 pb-24">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Start Writing (CTA) -->
      <div class="bg-white border border-stone-200 rounded-xl p-6 hover:border-teal-500/30 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between" @click="$router.push('/app/new-story')">
        <div>
            <div class="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
            <PenTool class="w-5 h-5 text-teal-700" />
            </div>
            <h3 class="text-lg font-bold font-serif text-stone-900">Start Writing</h3>
            <p class="text-stone-500 text-sm mt-2">Create a new story or continue where you left off.</p>
        </div>
      </div>

      <!-- Weekly Progress -->
       <div class="bg-white border border-stone-200 rounded-xl p-6">
        <div class="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center mb-4">
          <Activity class="w-5 h-5 text-amber-700" />
        </div>
        <h3 class="text-lg font-bold font-serif text-stone-900">Weekly Progress</h3>
        <p class="text-stone-500 text-sm mt-2">
            <span class="font-bold text-stone-800">{{ stats?.wordsWritten || 0 }}</span> words written this week.
        </p>
      </div>

      <!-- Total Stats -->
       <div class="bg-white border border-stone-200 rounded-xl p-6">
        <div class="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
          <BookOpen class="w-5 h-5 text-indigo-700" />
        </div>
        <h3 class="text-lg font-bold font-serif text-stone-900">Total Archive</h3>
        <p class="text-stone-500 text-sm mt-2 flex flex-col gap-1">
            <span><span class="font-bold text-stone-800">{{ stats?.storiesPublished || 0 }}</span> Published</span>
            <span><span class="font-bold text-stone-800">{{ stories.filter(s => s.visibility === 'private').length }}</span> Private Entries</span>
        </p>
      </div>
    </div>

    <!-- Content Tabs -->
    <div class="space-y-6">
        <div class="flex items-center gap-6 border-b border-stone-200 pb-1">
            <button 
                @click="activeTab = 'stories'"
                class="pb-3 font-medium text-sm transition-colors relative flex items-center gap-2"
                :class="activeTab === 'stories' ? 'text-teal-700' : 'text-stone-500 hover:text-stone-800'"
            >
                <Globe class="w-4 h-4" />
                Published
                <div v-if="activeTab === 'stories'" class="absolute bottom-0 left-0 w-full h-0.5 bg-teal-700 rounded-full"></div>
            </button>
            <button 
                @click="activeTab = 'drafts'"
                class="pb-3 font-medium text-sm transition-colors relative flex items-center gap-2"
                :class="activeTab === 'drafts' ? 'text-teal-700' : 'text-stone-500 hover:text-stone-800'"
            >
                <FileText class="w-4 h-4" />
                Drafts
                <div v-if="activeTab === 'drafts'" class="absolute bottom-0 left-0 w-full h-0.5 bg-teal-700 rounded-full"></div>
            </button>
             <button 
                @click="activeTab = 'private'"
                class="pb-3 font-medium text-sm transition-colors relative flex items-center gap-2"
                :class="activeTab === 'private' ? 'text-amber-700' : 'text-stone-500 hover:text-stone-800'"
            >
                <Lock class="w-4 h-4" />
                Private
                <div v-if="activeTab === 'private'" class="absolute bottom-0 left-0 w-full h-0.5 bg-amber-700 rounded-full"></div>
            </button>
        </div>

        <div v-if="loading" class="text-center py-12 text-stone-400">
            Loading...
        </div>

        <div v-else-if="filteredStories.length === 0" class="bg-white border border-stone-200 border-dashed rounded-xl p-12 text-center text-stone-400">
            <template v-if="activeTab === 'stories'">No published stories.</template>
            <template v-else-if="activeTab === 'drafts'">No drafts in progress.</template>
            <template v-else>No private entries.</template>
        </div>

        <div v-else class="grid grid-cols-1 gap-4">
             <div 
                v-for="story in filteredStories" 
                :key="story.id"
                class="bg-white border border-stone-200 p-6 rounded-xl hover:border-teal-500/30 hover:shadow-md transition-all group cursor-pointer flex justify-between items-center"
                @click="router.push(`/app/studio/${story.id}`)"
            >
                <div>
                     <div class="flex items-center gap-2 mb-1">
                        <h3 class="text-lg font-serif font-bold text-stone-900 group-hover:text-teal-700 transition-colors">{{ story.title }}</h3>
                        <span v-if="story.mode === 'journaling'" class="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Journal</span>
                    </div>
                    <p class="text-stone-500 text-sm mb-2 line-clamp-1 max-w-xl">
                        {{ story.description || story.topic || "No description." }}
                    </p>
                    <div class="flex items-center gap-4 text-xs text-stone-400">
                         <span v-if="activeTab === 'stories'" class="flex items-center gap-1 font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                            {{ story.published_chapters_count }} Published
                         </span>
                         <span v-else-if="activeTab === 'drafts'" class="flex items-center gap-1 font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                            {{ story.draft_chapters_count }} Drafts
                         </span>
                         <span v-else class="flex items-center gap-1"><BookOpen class="w-3 h-3" /> {{ story.chapters_count || 0 }} Chapters</span>
                         
                         <span class="flex items-center gap-1">Updated {{ new Date(story.updated_at).toLocaleDateString() }}</span>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                     <button class="px-4 py-2 text-sm font-medium text-stone-600 bg-stone-50 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors">
                        Edit
                     </button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { PenTool, Activity, BookOpen, Heart, MessageCircle, Lock, FileText, Globe } from 'lucide-vue-next'

const router = useRouter()
// Mock User ID (matches backend)
const USER_ID = '11111111-1111-1111-1111-111111111111'

const stories = ref<any[]>([])
const stats = ref<any>(null)
const loading = ref(true)
const activeTab = ref('stories') // 'stories', 'drafts', 'private'

const filteredStories = computed(() => {
    if (!stories.value) return []
    if (activeTab.value === 'stories') {
        // Published: Has at least one published chapter AND is not Private
        return stories.value.filter(s => 
            s.visibility !== 'private' && 
            parseInt(s.published_chapters_count || 0) > 0
        )
    } else if (activeTab.value === 'drafts') {
        // Drafts: Has at least one draft chapter OR no chapters yet, AND is not Private
        return stories.value.filter(s => 
            s.visibility !== 'private' && 
            (parseInt(s.draft_chapters_count || 0) > 0 || parseInt(s.chapters_count || 0) === 0)
        )
    } else if (activeTab.value === 'private') {
        // Private / Journaling
        return stories.value.filter(s => s.visibility === 'private')
    }
    return []
})

const fetchDashboardData = async () => {
    try {
        loading.value = true
        // Fetch Stories
        const storiesRes = await fetch('http://localhost:3001/api/stories/my')
        if (storiesRes.ok) stories.value = await storiesRes.json()

        // Fetch Stats
        const statsRes = await fetch(`http://localhost:3001/api/users/${USER_ID}/stats`)
        if (statsRes.ok) stats.value = await statsRes.json()
    } catch (e) {
        console.error("Failed to load dashboard data", e)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchDashboardData()
})
</script>
