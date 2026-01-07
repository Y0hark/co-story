<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Header / Tabs -->
    <div class="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
      <h2 class="font-bold font-serif text-stone-900 flex items-center gap-2">
         <Book class="w-4 h-4 text-stone-600" />
         Story Codex
      </h2>
      <button 
        @click="openCreate"
        class="text-xs bg-stone-900 text-stone-50 px-2 py-1 rounded hover:bg-stone-700 transition-colors"
      >
        + Add Entry
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

    <!-- Editor Form (Create / Edit) -->
    <div v-if="editingItem" class="p-4 border-b border-stone-200 bg-stone-50 animate-fade-in shrink-0">
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-stone-400">
                {{ editingItem.id ? 'Edit Entry' : 'New Entry' }}
            </span>
            <button v-if="editingItem.id" @click="deleteItem" class="text-xs text-red-400 hover:text-red-600">Delete</button>
        </div>
        <div class="space-y-3">
            <input 
                v-model="editingItem.name"
                class="w-full text-sm p-2 rounded border border-stone-300 focus:ring-1 focus:ring-teal-500 outline-none" 
                placeholder="Name (e.g. John Doe, Neo-Tokyo)"
            />
            <select 
                v-model="editingItem.type"
                class="w-full text-sm p-2 rounded border border-stone-300 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
            >
                <option value="character">Character</option>
                <option value="location">Location</option>
                <option value="event">Historical Event</option>
                <option value="item">Item / Object</option>
                <option value="other">Other</option>
            </select>
            <textarea 
                v-model="editingItem.description"
                rows="3"
                class="w-full text-sm p-2 rounded border border-stone-300 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
                placeholder="Description..."
            ></textarea>
            
            <div class="flex gap-2">
                <button 
                    @click="saveItem"
                    class="flex-1 bg-teal-600 text-white text-xs py-1.5 rounded hover:bg-teal-700"
                >
                    {{ editingItem.id ? 'Update' : 'Save' }}
                </button>
                <button 
                    @click="editingItem = null"
                    class="px-3 bg-stone-200 text-stone-600 text-xs py-1.5 rounded hover:bg-stone-300"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="filteredItems.length === 0 && !editingItem" class="text-center py-8 text-stone-400">
            <Book class="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No entries yet.</p>
        </div>

        <div v-for="item in filteredItems" :key="item.id" class="group">
            <div 
                class="flex items-start gap-3 p-3 rounded-lg border border-stone-100 hover:border-stone-300 hover:bg-stone-50 transition-all cursor-pointer"
                :class="editingItem?.id === item.id ? 'bg-stone-100 border-stone-300' : ''"
                @click="editItem(item)"
            >
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
import { useRoute } from 'vue-router' // Import useRoute
import { User, MapPin, BookOpen, Box, MoreHorizontal, Book } from 'lucide-vue-next'

const emit = defineEmits(['items-updated'])

const route = useRoute()
const storyId = computed(() => route.params.id as string)
const items = ref<any[]>([])

const loadItems = async () => {
    if (!storyId.value) return
    try {
        const res = await fetch(`http://localhost:3001/api/stories/${storyId.value}/world`)
        items.value = await res.json()
        emit('items-updated', items.value)
    } catch (e) {
        console.error("Failed to load world items", e)
    }
}


onMounted(() => {
    loadItems()
})

const editingItem = ref<any>(null)

// Initialize form
const newItem = reactive({ // Used as template/scratch
    name: '',
    type: 'character',
    description: ''
})

const openCreate = () => {
    editingItem.value = { ...newItem }
}

const editItem = (item: any) => {
    editingItem.value = { ...item }
}

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

const saveItem = async () => {
    if (!storyId.value || !editingItem.value) return
    const isUpdate = !!editingItem.value.id

    try {
        const url = isUpdate 
            ? `http://localhost:3001/api/stories/${storyId.value}/world/${editingItem.value.id}`
            : `http://localhost:3001/api/stories/${storyId.value}/world`
            
        const method = isUpdate ? 'PUT' : 'POST'

        const res = await fetch(url, {
             method: method,
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(editingItem.value)
        })
        
        const saved = await res.json()

        if (isUpdate) {
            const idx = items.value.findIndex(i => i.id === saved.id)
            if (idx !== -1) items.value[idx] = saved
        } else {
            items.value.unshift(saved)
        }
        
        emit('items-updated', items.value)

        editingItem.value = null
    } catch (e) {
        console.error("Failed to save item", e)
    }
}

const deleteItem = async () => {
    if (!storyId.value || !editingItem.value || !editingItem.value.id) return
    if(!confirm("Delete this entry?")) return

    try {
        await fetch(`http://localhost:3001/api/stories/${storyId.value}/world/${editingItem.value.id}`, {
             method: 'DELETE'
        })
        items.value = items.value.filter(i => i.id !== editingItem.value.id)
        emit('items-updated', items.value)
        editingItem.value = null
    } catch (e) {
        console.error("Delete failed", e)
    }
}

const createItemDirectly = async (data: any) => {
    // Open editor populated with AI data
    let targetId = data.id

    // Fallback: If ID is missing or invalid (e.g. AI fabricated "char_mathias"), try to find by Name
    if (!targetId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)) {
        const existing = items.value.find(i => i.name.toLowerCase() === data.name?.toLowerCase())
        if (existing) {
            targetId = existing.id
        } else {
            targetId = undefined
        }
    }

    // If ID is provided/found, it's an update
    editingItem.value = { 
        id: targetId, 
        name: data.name || '', 
        type: data.type || 'character', 
        description: data.description || '' 
    }
    // We do NOT auto-save. We let the user review and click "Save/Update".
}

defineExpose({
    loadItems,
    createItem: createItemDirectly
})
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
