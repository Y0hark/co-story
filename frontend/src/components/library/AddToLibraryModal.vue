<template>
  <BaseModal
    :is-open="isOpen"
    :title="`Add to Collection`"
    :description="`Select a collection to add '${storyTitle}' to:`"
    confirm-text="Create & Add"
    cancel-text="Close"
    @close="$emit('close')"
    @confirm="createNewList"
  >
    <div class="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        <!-- Existing Lists -->
        <button 
            v-for="list in lists" 
            :key="list.id"
            @click="addToList(list.id)"
            class="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-stone-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
        >
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <Bookmark class="w-4 h-4" />
                </div>
                <span class="text-sm font-medium text-stone-700 group-hover:text-indigo-900">{{ list.name }}</span>
            </div>
            <Plus class="w-4 h-4 text-stone-400 group-hover:text-indigo-600" />
        </button>

        <!-- Create New Input -->
        <div class="pt-4 mt-2 border-t border-stone-100">
            <label class="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">New Collection</label>
            <input 
                v-model="newListName"
                type="text" 
                placeholder="e.g. Summer Reads"
                class="w-full bg-stone-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-stone-800 placeholder:text-stone-400 text-sm py-2.5 px-3 transition-all"
                @keyup.enter="createNewList"
            />
        </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Bookmark, Plus } from 'lucide-vue-next'
import BaseModal from '../ui/BaseModal.vue'
import { useAuthStore } from '../../stores/auth'

const props = defineProps<{
  isOpen: boolean
  storyId: string
  storyTitle: string
}>()

const emit = defineEmits(['close', 'added'])

const authStore = useAuthStore()
const lists = ref<any[]>([])
const newListName = ref('')

const fetchLists = async () => {
    if (!authStore.user?.id) return
    try {
        const res = await fetch(`http://localhost:3001/api/library/${authStore.user.id}`)
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
    if (!newListName.value.trim() || !authStore.user?.id) return
    try {
        const res = await fetch('http://localhost:3001/api/library/lists', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ userId: authStore.user.id, name: newListName.value })
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
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e7e5e4;
    border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #d6d3d1;
}
</style>
