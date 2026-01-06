<template>
  <div class="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-stone-50">
    
    <!-- Mobile Category Selector -->
    <div class="md:hidden p-4 bg-white border-b border-stone-200 sticky top-0 z-20 overflow-x-auto">
        <div class="flex items-center gap-2">
            <button 
                v-for="list in lists" 
                :key="list.id"
                @click="selectedListId = list.id"
                class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border"
                :class="selectedListId === list.id ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-stone-600 border-stone-200'"
            >
                {{ list.name }}
            </button>
            <button 
                @click="showCreateModal = true"
                class="px-3 py-2 rounded-full border border-dashed border-stone-300 text-stone-400"
            >
                <Plus class="w-4 h-4" />
            </button>
        </div>
    </div>

    <!-- Sidebar: Categories (Desktop) -->
    <aside class="hidden md:flex w-64 border-r border-stone-200 bg-white flex-col">
        <div class="p-6 border-b border-stone-100">
            <h2 class="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <Library class="w-5 h-5 text-teal-600" /> Library
            </h2>
        </div>

        <nav class="flex-1 overflow-y-auto p-4 space-y-1">
            <div 
                v-for="list in lists" 
                :key="list.id"
                class="group relative"
            >
                <!-- Editing Mode -->
                <div v-if="editingListId === list.id" class="px-2 py-1.5 flex items-center gap-2">
                    <input 
                       v-model="editName"
                       ref="editInput"
                       class="w-full text-sm rounded-md border-stone-200 py-1 px-2 focus:ring-2 focus:ring-teal-500/20"
                       @keyup.enter="saveRename(list.id)"
                       @keyup.esc="cancelRename"
                       @blur="saveRename(list.id)"
                       v-focus
                    />
                </div>

                <!-- Normal Mode -->
                <button 
                    v-else
                    @click="selectedListId = list.id"
                    class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors relative"
                    :class="selectedListId === list.id ? 'bg-teal-50 text-teal-700 font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'"
                >
                    <span class="flex items-center gap-2 truncate pr-6">
                        <component :is="getIcon(list.name)" class="w-4 h-4 opacity-70 flex-shrink-0" />
                        <span class="truncate">{{ list.name }}</span>
                    </span>
                    
                    <div class="flex items-center gap-2">
                         <span class="text-xs bg-white border border-stone-200 px-1.5 py-0.5 rounded-full text-stone-400 group-hover:text-stone-500">
                            {{ list.stories.length }}
                        </span>

                         <!-- Menu Trigger (Only for non-Saved lists) -->
                         <div v-if="list.name !== 'Saved'" class="relative" @click.stop>
                             <button 
                                @click="openMenuId = (openMenuId === list.id ? null : list.id)"
                                class="p-1 rounded-md hover:bg-stone-200/50 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                :class="{ 'opacity-100 bg-stone-200/50': openMenuId === list.id }"
                            >
                                <MoreVertical class="w-3.5 h-3.5" />
                            </button>

                            <!-- Dropdown Menu -->
                            <div 
                                v-if="openMenuId === list.id"
                                class="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-stone-100 z-50 overflow-hidden py-1"
                            >
                                <button 
                                    @click="startRename(list)"
                                    class="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50 hover:text-stone-900 text-left"
                                >
                                    <Edit2 class="w-3 h-3" /> Rename
                                </button>
                                <button 
                                    @click="deleteList(list.id)"
                                    class="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
                                >
                                    <Trash2 class="w-3 h-3" /> Delete
                                </button>
                            </div>
                         </div>
                    </div>
                </button>

                <!-- Click outside listener for menu closing could be global, effectively handled by toggle for now or advanced via directive. Simple toggle is okay. -->
            </div>
            
            <div class="pt-4 mt-4 border-t border-stone-100">
                <button 
                    @click="showCreateModal = true"
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-500 hover:text-teal-600 transition-colors dashed-border rounded-lg"
                >
                    <Plus class="w-4 h-4" /> New Category
                </button>
            </div>
        </nav>
    </aside>

    <!-- Main Content: Stories -->
    <main class="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8">
        <header class="mb-6 md:mb-8 flex justify-between items-center">
            <div>
                 <h1 class="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-1 md:mb-2">{{ selectedList?.name || 'All Stories' }}</h1>
                 <p class="text-xs md:text-base text-stone-500">{{ selectedList?.stories.length || 0 }} stories in this collection</p>
            </div>
        </header>

        <!-- Empty State -->
        <div v-if="currentStories.length === 0" class="text-center py-20">
            <div class="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                <BookOpen class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-bold text-stone-900 mb-2">Your library is empty</h3>
            <p class="text-stone-500 mb-6">Start reading and add stories to your collections.</p>
            <button 
                @click="$router.push('/app/community')"
                class="px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm"
            >
                Browse Community
            </button>
        </div>

        <!-- Story Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <div 
                v-for="story in currentStories" 
                :key="story.id"
                class="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-teal-500/30 hover:shadow-md transition-all cursor-pointer flex flex-col group relative active:scale-[0.98] duration-200"
                @click="$router.push(`/app/read/${story.id}`)"
            >
                <!-- New Chapter Badge -->
                <div v-if="story.is_new" class="absolute top-3 right-3 z-20">
                    <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-600 text-white text-[10px] font-bold shadow-sm uppercase tracking-wider animate-pulse">
                        <Sparkles class="w-3 h-3" /> New
                    </span>
                </div>

                <div class="h-40 bg-stone-100 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent z-10"></div>
                     <div class="w-full h-full flex items-center justify-center text-stone-300 font-serif text-4xl opacity-20 select-none">
                        {{ story.title[0] }}
                    </div>
                </div>

                <div class="p-4 flex-1 flex flex-col">
                    <h3 class="font-serif font-bold text-lg text-stone-900 mb-1 group-hover:text-teal-700 transition-colors line-clamp-1">{{ story.title }}</h3>
                    <p class="text-xs text-stone-500 mb-3">by {{ story.author_name }}</p>
                    
                    <!-- Progress Bar -->
                    <div class="mt-auto pt-3 border-t border-stone-50">
                        <div class="flex justify-between text-[10px] uppercase font-bold text-stone-400 mb-1">
                            <span>Progress</span>
                            <span>{{ story.read_chapters_count }} / {{ story.total_chapters }}</span>
                        </div>
                        <div class="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                            <div 
                                class="h-full bg-teal-500 rounded-full transition-all duration-500"
                                :style="{ width: `${(story.read_chapters_count / story.total_chapters) * 100}%` }"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Create List Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 class="text-lg font-bold text-stone-900 mb-4">New Collection</h3>
            <input 
                v-model="newListName"
                ref="listInput"
                type="text" 
                placeholder="Collection Name (e.g. Favorite Sci-Fi)"
                class="w-full rounded-lg border-stone-200 bg-stone-50 p-3 text-sm focus:border-teal-500 focus:ring-teal-500 mb-4"
                @keyup.enter="createList"
            />
            <div class="flex justify-end gap-2">
                <button @click="showCreateModal = false" class="px-4 py-2 text-stone-500 hover:text-stone-800 text-sm font-medium">Cancel</button>
                <button @click="createList" class="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 text-sm font-medium">Create</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Library, Plus, BookOpen, Star, Bookmark, Archive, Sparkles, MoreVertical, Edit2, Trash2 } from 'lucide-vue-next'

const USER_ID = '11111111-1111-1111-1111-111111111111'

const lists = ref<any[]>([])
const selectedListId = ref<string | null>(null)
const showCreateModal = ref(false)
const newListName = ref('')

const openMenuId = ref<string | null>(null)
const editingListId = ref<string | null>(null)
const editName = ref('')

const fetchLibrary = async () => {
    try {
        const res = await fetch(`http://localhost:3001/api/library/${USER_ID}`)
        if (res.ok) {
            lists.value = await res.json()
            if (lists.value.length > 0 && !selectedListId.value) {
                selectedListId.value = lists.value[0].id
            }
        }
    } catch (e) {
        console.error(e)
    }
}

const currentStories = computed(() => {
    const list = lists.value.find(l => l.id === selectedListId.value)
    return list ? list.stories : []
})

const selectedList = computed(() => lists.value.find(l => l.id === selectedListId.value))

const createList = async () => {
    if (!newListName.value.trim()) return
    
    try {
        const res = await fetch('http://localhost:3001/api/library/lists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID, name: newListName.value })
        })
        if (res.ok) {
            await fetchLibrary()
            showCreateModal.value = false
            newListName.value = ''
        }
    } catch (e) { console.error(e) }
}

const getIcon = (name: string) => {
    const n = name.toLowerCase()
    if (n === 'saved' || n === 'favorites') return Star
    if (n === 'archive') return Archive
    return Bookmark
}

// Rename / Delete Logic

const startRename = (list: any) => {
    editName.value = list.name
    editingListId.value = list.id
    openMenuId.value = null
}

const cancelRename = () => {
    editingListId.value = null
    editName.value = ''
}

const saveRename = async (listId: string) => {
    if (!editName.value.trim() || !editingListId.value) {
        cancelRename()
        return
    }

    try {
        const res = await fetch(`http://localhost:3001/api/library/lists/${listId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName.value })
        })

        if (res.ok) {
            await fetchLibrary()
        }
    } catch (e) {
        console.error(e)
    } finally {
        cancelRename()
    }
}

const deleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) {
        openMenuId.value = null
        return
    }

    try {
        const res = await fetch(`http://localhost:3001/api/library/lists/${listId}`, {
            method: 'DELETE'
        })

        if (res.ok) {
            if (selectedListId.value === listId) {
                selectedListId.value = lists.value[0]?.id || null
            }
            await fetchLibrary()
        }
    } catch (e) {
        console.error(e)
    } finally {
        openMenuId.value = null
    }
}

const vFocus = {
  mounted: (el: HTMLInputElement) => el.focus()
}

onMounted(() => {
    fetchLibrary()
})
</script>

<style scoped>
.dashed-border {
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='%23A8A29E' stroke-width='1' stroke-dasharray='4%2c 4' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
}
</style>
