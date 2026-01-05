<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Header / Tabs -->
    <div class="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
      <h2 class="font-bold font-serif text-stone-900 flex items-center gap-2">
         <Globe class="w-4 h-4 text-stone-600" />
         World Database
      </h2>
      <button 
        @click="isCreating = true"
        class="text-xs bg-stone-900 text-stone-50 px-2 py-1 rounded hover:bg-stone-700 transition-colors"
      >
        + Add
      </button>
    </div>

    <!-- Filters -->
    <div class="relative shrink-0 border-b border-stone-100 bg-white group" v-if="items.length > 0">
        <!-- Scroll Container -->
        <div 
            ref="tagsContainer"
            class="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth"
        >
            <button 
                v-for="filter in visibleFilters" 
                :key="filter.value"
                @click="activeFilter = filter.value"
                class="text-xs px-2 py-1 rounded-full border transition-colors whitespace-nowrap shrink-0"
                :class="activeFilter === filter.value ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'"
            >
                {{ filter.label }}
                <span class="ml-1 opacity-60 text-[10px]" v-if="filter.value !== 'all'">
                    {{ items.filter(i => i.type === filter.value).length }}
                </span>
            </button>
        </div>

        <!-- Left Hover Zone (Gradient + Trigger) -->
        <div 
            class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start cursor-pointer z-10"
            @mouseenter="startScrolling('left')"
            @mouseleave="stopScrolling"
        >
        </div>

        <!-- Right Hover Zone (Gradient + Trigger) -->
        <div 
            class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end cursor-pointer z-10"
            @mouseenter="startScrolling('right')"
            @mouseleave="stopScrolling"
        >
        </div>
    </div>

    <!-- Creation Form -->
    <div v-if="isCreating" class="p-4 border-b border-stone-200 bg-stone-50 animate-fade-in shrink-0">
        <div class="space-y-3">
            <input 
                v-model="newItem.name"
                class="w-full text-sm p-2 rounded border border-stone-300 focus:ring-1 focus:ring-teal-500 outline-none" 
                placeholder="Name (e.g. John Doe, Neo-Tokyo)"
            />
            <select 
                v-model="newItem.type"
                class="w-full text-sm p-2 rounded border border-stone-300 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
            >
                <option value="character">Character</option>
                <option value="location">Location</option>
                <option value="event">Historical Event</option>
                <option value="item">Item / Object</option>
                <option value="other">Other</option>
            </select>
            <textarea 
                v-model="newItem.description"
                rows="3"
                class="w-full text-sm p-2 rounded border border-stone-300 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
                placeholder="Description..."
            ></textarea>
            
            <div class="flex gap-2">
                <button 
                    @click="createItem"
                    class="flex-1 bg-teal-600 text-white text-xs py-1.5 rounded hover:bg-teal-700"
                >
                    Save
                </button>
                <button 
                    @click="isCreating = false"
                    class="px-3 bg-stone-200 text-stone-600 text-xs py-1.5 rounded hover:bg-stone-300"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="filteredItems.length === 0 && !isCreating" class="text-center py-8 text-stone-400">
            <Globe class="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No items found.</p>
        </div>

        <div v-for="item in filteredItems" :key="item.id" class="group">
            <div class="flex items-start gap-3 p-3 rounded-lg border border-stone-100 hover:border-stone-300 hover:bg-stone-50 transition-all cursor-pointer">
                <div class="mt-0.5">
                    <User v-if="item.type === 'character'" class="w-4 h-4 text-purple-600" />
                    <MapPin v-else-if="item.type === 'location'" class="w-4 h-4 text-emerald-600" />
                    <BookOpen v-else-if="item.type === 'event'" class="w-4 h-4 text-amber-600" />
                    <Box v-else class="w-4 h-4 text-stone-600" />
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-bold text-stone-800 leading-tight">{{ item.name }}</h3>
                    <p class="text-xs text-stone-500 uppercase tracking-wider mb-1 opacity-70">{{ item.type }}</p>
                    <p class="text-xs text-stone-600 line-clamp-2">{{ item.description }}</p>
                </div>
                <button class="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-900 transition-opacity">
                    <MoreHorizontal class="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Globe, User, MapPin, BookOpen, Box, MoreHorizontal } from 'lucide-vue-next'

// Mock for now, would fetch from API
const items = ref<any[]>([
    { id: 1, name: 'Elias Thorne', type: 'character', description: 'A cynical detective with a mechanical arm.' },
    { id: 2, name: 'The Rusty Anchor', type: 'location', description: 'A seedy bar in the lower district where information is traded.' },
    { id: 3, name: 'The Great Fire', type: 'event', description: 'The event that destroyed the old city 50 years ago.' }
])

const isCreating = ref(false)
const newItem = reactive({
    name: '',
    type: 'character',
    description: ''
})

const activeFilter = ref('all')
const filters = [
    { label: 'All', value: 'all' },
    { label: 'Characters', value: 'character' },
    { label: 'Locations', value: 'location' },
    { label: 'Events', value: 'event' },
    { label: 'Items', value: 'item' },
    { label: 'Factions', value: 'faction' },
    { label: 'Creatures', value: 'creature' },
    { label: 'Magic', value: 'magic' },
    { label: 'Tech', value: 'tech' }
]

const visibleFilters = computed(() => {
    return filters.filter(f => {
        if (f.value === 'all') return true
        return items.value.some(i => i.type === f.value)
    })
})

const filteredItems = computed(() => {
    if (activeFilter.value === 'all') return items.value
    return items.value.filter(item => item.type === activeFilter.value)
})

// Auto-Scroll Logic
const tagsContainer = ref<HTMLElement | null>(null)
let scrollInterval: number | null = null

const startScrolling = (direction: 'left' | 'right') => {
    if (!tagsContainer.value) return
    stopScrolling()
    
    const step = direction === 'left' ? -3 : 3
    
    const animate = () => {
        if (tagsContainer.value) {
            tagsContainer.value.scrollLeft += step
            scrollInterval = requestAnimationFrame(animate)
        }
    }
    
    scrollInterval = requestAnimationFrame(animate)
}

const stopScrolling = () => {
    if (scrollInterval) {
        cancelAnimationFrame(scrollInterval)
        scrollInterval = null
    }
}

onUnmounted(() => {
    stopScrolling()
})

const createItem = async () => {
    // In real implementation: POST to API
    items.value.unshift({
        id: Date.now(),
        name: newItem.name,
        type: newItem.type,
        description: newItem.description
    })
    
    // Reset
    newItem.name = ''
    newItem.type = 'character'
    newItem.description = ''
    isCreating.value = false
}

// TODO: loadItems() from API onMounted
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
