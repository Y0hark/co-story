<template>
  <div class="max-w-5xl mx-auto space-y-8 pb-24">
    <!-- Header / Banner -->
    <div class="relative">
      <div class="h-32 md:h-48 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden relative">
          <div 
            class="absolute inset-0 bg-cover bg-center opacity-90 transition-opacity"
            :style="{ backgroundImage: `url(${user?.banner_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'})` }"
          ></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      
      <div v-if="user" class="absolute -bottom-16 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-8 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 w-full md:w-auto">
        <div class="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#FDFBF7] bg-white flex items-center justify-center overflow-hidden shadow-lg shrink-0">
            <!-- Avatar -->
            <img :src="user.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.display_name" alt="Avatar" class="w-full h-full object-cover" />
        </div>
        
        <div class="mb-2 text-center md:text-left">
            <h1 class="text-2xl md:text-3xl font-serif font-bold text-stone-900">{{ user.display_name || 'Anonymous Writer' }}</h1>
            <p class="text-stone-500 text-sm">Joined {{ formatDate(user.created_at) }}</p>
        </div>
      </div>

      <div class="absolute top-4 right-4 md:top-auto md:bottom-4 md:right-8">
          <button 
            @click="startEditing"
            class="px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-white/90 backdrop-blur-sm text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900 transition-all font-medium text-xs md:text-sm shadow-sm"
          >
              Edit Profile
          </button>
      </div>
    </div>

    <div v-if="!loading && user" class="pt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Stats & Bio -->
        <div class="space-y-6">
            <div class="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                <h3 class="font-serif font-bold text-stone-900 mb-4">About</h3>
                <p class="text-stone-600 text-sm leading-relaxed">
                    {{ user.bio || "No bio provided." }}
                </p>
                
                <div class="mt-6 flex flex-wrap gap-2">
                    <span 
                        v-for="tag in user.tags || []" 
                        :key="tag"
                        class="px-2 py-1 rounded-md bg-stone-100 text-xs text-stone-600 border border-stone-200"
                    >
                        {{ tag }}
                    </span>
                    <span v-if="!user.tags || user.tags.length === 0" class="text-xs text-stone-400 italic">No tags added.</span>
                </div>
            </div>

            <div v-if="stats" class="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                <h3 class="font-serif font-bold text-stone-900 mb-4">Stats</h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-stone-500">Words Written</span>
                        <span class="text-stone-800 font-mono">{{ stats.wordsWritten.toLocaleString() }}</span>
                    </div>
                     <div class="flex items-center justify-between text-sm">
                        <span class="text-stone-500">Chapters Written</span>
                        <span class="text-stone-800 font-mono">{{ stats.chaptersWritten }}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-stone-500">Stories Published</span>
                        <span class="text-stone-800 font-mono">{{ stats.storiesPublished }}</span>
                    </div>
                    
                    <div class="pt-4 mt-4 border-t border-stone-100 space-y-4">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-stone-500">Words Read</span>
                            <span class="text-stone-800 font-mono">{{ stats.wordsRead.toLocaleString() }}</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-stone-500">Chapters Read</span>
                            <span class="text-stone-800 font-mono">{{ stats.chaptersRead }}</span>
                        </div>
                    </div>

                    <div class="pt-4 mt-4 border-t border-stone-100">
                         <div class="flex items-center justify-between text-sm">
                            <span class="text-teal-600 font-medium">Self Healing Time</span>
                            <span class="text-teal-800 font-mono font-bold">{{ formatTime(stats.timeHealingMinutes) }}</span>
                        </div>
                        <p class="text-[10px] text-stone-400 mt-1">Time spent writing in private journals.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column: Recent Activity / Stories -->
        <div class="lg:col-span-2 space-y-6">
            <div class="flex items-center gap-6 border-b border-stone-200 pb-1">
                <h3 class="font-serif font-bold text-lg text-stone-900 pb-3 border-b-2 border-teal-700">Liked Stories</h3>
            </div>

            <div class="space-y-4">
                <div v-if="filteredStories.length === 0" class="p-8 text-center text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                    {{ 'No liked stories found.' }}
                </div>

                <!-- Story Card -->
                <div 
                    v-for="story in filteredStories" 
                    :key="story.id"
                    class="bg-white border border-stone-200 p-6 rounded-xl hover:border-teal-500/30 hover:shadow-md transition-all group cursor-pointer"
                    @click="$router.push(`/app/studio/${story.id}`)"
                >
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex flex-col">
                             <div class="flex items-center gap-2">
                                <h3 class="text-xl font-serif font-bold text-stone-900 group-hover:text-teal-700 transition-colors">{{ story.title }}</h3>
                                <span 
                                    v-if="story.status"
                                    class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border"
                                    :class="getStatusColor(story.status)"
                                >
                                    {{ getStatusLabel(story.status) }}
                                </span>
                             </div>
                        </div>
                    </div>
                    <p class="text-stone-500 text-sm mb-4 line-clamp-2">
                       {{ story.description || story.topic || "No description." }}
                    </p>
                    
                    <!-- Meta Info: Chapters & Likes -->
                    <div class="flex items-center gap-4 pt-4 border-t border-stone-100">
                        <div class="flex items-center gap-2 text-stone-500 text-sm font-medium">
                            <BookOpen class="w-4 h-4 text-stone-400" />
                            <span>{{ story.chapters_count || 0 }} Chapters</span>
                        </div>
                        <div class="flex items-center gap-2 text-stone-500 text-sm font-medium">
                            <Heart class="w-4 h-4 text-rose-500 fill-rose-500" />
                            <span>{{ story.likes_count || 0 }} Likes</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="isEditing" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 class="text-xl font-bold font-serif text-stone-900">Edit Profile</h2>
            
                <div>
                    <label class="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Display Name</label>
                    <input v-model="editForm.display_name" type="text" class="w-full bg-stone-50 border-none rounded-lg focus:ring-2 focus:ring-teal-500/20 text-stone-800 placeholder:text-stone-400 text-sm py-2.5 px-3 transition-all" />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                         <label class="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Avatar URL</label>
                         <input v-model="editForm.avatar_url" type="text" class="w-full bg-stone-50 border-none rounded-lg focus:ring-2 focus:ring-teal-500/20 text-stone-800 placeholder:text-stone-400 text-sm py-2.5 px-3 transition-all" />
                    </div>
                     <div>
                         <label class="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Banner URL</label>
                         <input v-model="editForm.banner_url" type="text" class="w-full bg-stone-50 border-none rounded-lg focus:ring-2 focus:ring-teal-500/20 text-stone-800 placeholder:text-stone-400 text-sm py-2.5 px-3 transition-all" />
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Bio</label>
                    <textarea 
                        v-model="editForm.bio" 
                        rows="4" 
                        class="w-full bg-stone-50 border-none rounded-lg focus:ring-2 focus:ring-teal-500/20 text-stone-800 placeholder:text-stone-400 text-sm p-3 leading-relaxed transition-all resize-none"
                        placeholder="Tell us about yourself..."
                    ></textarea>
                </div>

                <div>
                    <label class="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Interests</label>
                    <div class="flex flex-wrap gap-2">
                        <button 
                            v-for="genre in AVAILABLE_GENRES" 
                            :key="genre"
                            @click="toggleTag(genre)"
                            class="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                            :class="editForm.tags.includes(genre) 
                                ? 'bg-teal-600 border-teal-600 text-white shadow-sm' 
                                : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700'"
                        >
                            {{ genre }}
                        </button>
                    </div>
                    <p class="text-[10px] text-stone-400 mt-2">Select up to 5 interests.</p>
                </div>

            <div class="flex justify-end gap-3 pt-2">
                <button @click="isEditing = false" class="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-lg text-sm transition-colors">Cancel</button>
                <button @click="saveProfile" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">Save Changes</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Heart, BookOpen } from 'lucide-vue-next'

// Mock User ID for development (matches what we use in seeds/auth)
const USER_ID = '11111111-1111-1111-1111-111111111111'

const user = ref<any>(null)
const stats = ref<any>(null)
const likedStories = ref<any[]>([])
const loading = ref(true)

const filteredStories = computed(() => {
    return likedStories.value
})

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const formatTime = (minutes: number) => {
    if (!minutes) return '0m'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

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

const fetchData = async () => {
    try {
        loading.value = true
        
        // Fetch User Profile
        const userRes = await fetch(`http://localhost:3001/api/users/${USER_ID}`)
        if (userRes.ok) user.value = await userRes.json()
        
        // Fetch Stats
        const statsRes = await fetch(`http://localhost:3001/api/users/${USER_ID}/stats`)
        if (statsRes.ok) stats.value = await statsRes.json()
        
        // Fetch Liked Stories
        const likedRes = await fetch(`http://localhost:3001/api/stories/liked`) // Hardcoded user in backend
        if (likedRes.ok) likedStories.value = await likedRes.json()
        
    } catch (e) {
        console.error("Failed to fetch profile data", e)
    } finally {
        loading.value = false
    }
}

const isEditing = ref(false)
const editForm = ref({
    display_name: '',
    bio: '',
    avatar_url: '',
    banner_url: '',
    tags: [] as string[]
})

const AVAILABLE_GENRES = [
    'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Thriller', 
    'Historical', 'Literary Fiction', 'Adventure', 'Dystopian', 
    'Contemporary', 'Non-Fiction', 'Poetry', 'Screenplay'
]

const startEditing = () => {
    if (!user.value) return
    editForm.value = {
        display_name: user.value.display_name,
        bio: user.value.bio,
        avatar_url: user.value.avatar_url,
        banner_url: user.value.banner_url,
        tags: [...(user.value.tags || [])]
    }
    isEditing.value = true
}

const toggleTag = (tag: string) => {
    const index = editForm.value.tags.indexOf(tag)
    if (index === -1) {
        if (editForm.value.tags.length < 5) { // Optional limit
            editForm.value.tags.push(tag)
        }
    } else {
        editForm.value.tags.splice(index, 1)
    }
}
const saveProfile = async () => {
    try {
        const res = await fetch(`http://localhost:3001/api/users/${USER_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm.value)
        })
        
        if (res.ok) {
            const updatedUser = await res.json()
            user.value = updatedUser
            isEditing.value = false
        }
    } catch (e) {
        console.error("Failed to update profile", e)
    }
}



onMounted(() => {
    fetchData()
})
</script>
