<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
        <h3 class="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Bookmark class="w-5 h-5 text-teal-600" />
            Add to Library
        </h3>
        
        <p class="text-stone-500 text-sm mb-4">Select a collection to add <strong>{{ storyTitle }}</strong> to:</p>

        <div class="space-y-2 mb-6 max-h-60 overflow-y-auto">
            <button 
                v-for="list in lists" 
                :key="list.id"
                @click="addToList(list.id)"
                class="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-stone-200 hover:border-teal-500/50 hover:bg-teal-50/50 transition-all text-left group"
            >
                <span class="text-sm font-medium text-stone-700 group-hover:text-stone-900">{{ list.name }}</span>
                <Plus class="w-4 h-4 text-stone-400 group-hover:text-teal-600" />
            </button>
            
            <button 
                @click="showNewListInput = true" 
                v-if="!showNewListInput"
                class="w-full text-center text-xs font-medium text-teal-600 hover:text-teal-700 py-2 dashed-border rounded-lg"
            >
                + Create new collection
            </button>

            <div v-else class="flex gap-2 animate-in fade-in slide-in-from-top-2">
                 <input 
                    v-model="newListName"
                    ref="newListInput"
                    type="text" 
                    placeholder="Collection name"
                    class="flex-1 rounded-lg border-stone-200 bg-stone-50 p-2 text-xs focus:border-teal-500 focus:ring-teal-500"
                    @keyup.enter="createNewList"
                />
                <button @click="createNewList" class="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs">Add</button>
            </div>
        </div>

        <div class="flex justify-end">
            <button @click="$emit('close')" class="px-4 py-2 text-stone-500 hover:text-stone-800 text-sm font-medium">Cancel</button>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Bookmark, Plus } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  storyId: string
  storyTitle: string
}>()

const emit = defineEmits(['close', 'added'])

const USER_ID = '11111111-1111-1111-1111-111111111111'
const lists = ref<any[]>([])
const showNewListInput = ref(false)
const newListName = ref('')

const fetchLists = async () => {
    try {
        const res = await fetch(`http://localhost:3001/api/library/${USER_ID}`)
        if (res.ok) {
            lists.value = await res.json()
        }
    } catch (e) { console.error(e) }
}

const addToList = async (listId: string) => {
    try {
        const res = await fetch('http://localhost:3001/api/library/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listId, storyId: props.storyId })
        })
        if (res.ok) {
            emit('added')
            emit('close')
        }
    } catch (e) { console.error(e) }
}

const createNewList = async () => {
    if (!newListName.value.trim()) return
    try {
        const res = await fetch('http://localhost:3001/api/library/lists', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ userId: USER_ID, name: newListName.value })
        })
        if (res.ok) {
            const newList = await res.json()
            await addToList(newList.id) // Auto add to new list
        }
    } catch (e) { console.error(e) }
}

onMounted(() => {
    fetchLists()
})
</script>

<style scoped>
.dashed-border {
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='6' ry='6' stroke='%232dd4bf' stroke-width='1' stroke-dasharray='4%2c 4' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
}
</style>
