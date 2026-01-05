<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900 mb-2">Discover Stories</h1>
        <p class="text-stone-500">Join the co-creation revolution. Read, Remix, and Collaborate.</p>
      </div>
      
      <div class="flex gap-2">
          <input 
            type="text" 
            placeholder="Search stories..." 
            class="bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm focus:border-teal-500/50 outline-none w-64 text-stone-900 placeholder:text-stone-400 shadow-sm"
           />
      </div>
    </div>

    <!-- Categories / Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        <button 
            v-for="cat in categories" 
            :key="cat"
            class="px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-all shadow-sm"
            :class="selectedCategory === cat ? 'bg-teal-50 text-teal-700 border-teal-200 font-medium' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'"
            @click="selectedCategory = cat"
        >
            {{ cat }}
        </button>
    </div>

    <!-- Featured Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
            v-for="story in stories" 
            :key="story.id"
            class="group bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-teal-500/30 hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
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
                         {{ story.genre }}
                     </span>
                </div>
            </div>

            <div class="p-6 flex-1 flex flex-col">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold border border-indigo-100">
                        {{ story.author[0] }}
                    </div>
                    <span class="text-xs text-stone-500">{{ story.author }}</span>
                </div>

                <h3 class="text-lg font-serif font-bold text-stone-900 mb-2 group-hover:text-teal-700 transition-colors">{{ story.title }}</h3>
                <p class="text-sm text-stone-500 line-clamp-3 mb-4 flex-1">
                    {{ story.synopsis }}
                </p>

                <div class="flex items-center justify-between text-xs text-stone-400 pt-4 border-t border-stone-100">
                    <div class="flex items-center gap-3">
                        <span class="flex items-center gap-1"><BookOpen class="w-3 h-3" /> {{ story.chapters }}</span>
                        <span class="flex items-center gap-1"><Users class="w-3 h-3" /> {{ story.remixes }}</span>
                    </div>
                    <span class="flex items-center gap-1 text-pink-400"><Heart class="w-3 h-3" /> {{ story.likes }}</span>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen, Users, Heart } from 'lucide-vue-next'

const categories = ['All', 'Sci-Fi', 'Fantasy', 'Romance', 'Mystery', 'Cyberpunk', 'Historical']
const selectedCategory = ref('All')

const stories = ref([
    {
        id: 1,
        title: 'The Clockwork Heart',
        author: 'Alice V.',
        genre: 'Steampunk',
        synopsis: 'In a London that never sleeps, a mechanic finds a heart that beats with a rhythm unknown to science.',
        chapters: 8,
        likes: 1240,
        remixes: 12
    },
    {
        id: 2,
        title: 'Neon Rain',
        author: 'Kai M.',
        genre: 'Cyberpunk',
        synopsis: 'The rain in sector 7 burns, but not as much as the memories she is trying to wash away.',
        chapters: 15,
        likes: 856,
        remixes: 4
    },
    {
        id: 3,
        title: 'Whispers of the Old Gods',
        author: 'Elena R.',
        genre: 'Fantasy',
        synopsis: 'They said the gods were dead. They were wrong. They were just sleeping, and now they are hungry.',
        chapters: 22,
        likes: 3402,
        remixes: 45
    },
    {
        id: 4,
        title: 'Orbit 9',
        author: 'Davide S.',
        genre: 'Sci-Fi',
        synopsis: 'Isolated on a monitoring station, one astronaut begins to receive messages from a planet that shouldn\'t exist.',
        chapters: 4,
        likes: 156,
        remixes: 1
    }
])
</script>
