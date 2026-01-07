<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-2 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-2 opacity-0"
  >
    <div 
      v-if="isVisible"
      class="absolute z-50 bg-stone-900/90 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl border border-stone-700 max-w-xs text-xs"
      :class="positionClasses"
    >
      <div class="flex items-start gap-2">
        <div class="flex-1">
          <h4 v-if="title" class="font-bold mb-1 text-teal-300">{{ title }}</h4>
          <p class="leading-relaxed opacity-90"><slot></slot></p>
        </div>
        <button 
          @click="dismiss" 
          class="shrink-0 text-stone-400 hover:text-white transition-colors"
          title="Dismiss"
        >
          <X class="w-3 h-3" />
        </button>
      </div>
      <div class="absolute w-2 h-2 bg-stone-900/90 rotate-45" :class="arrowClasses"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  id: string // Unique ID for persistence
  title?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}>()

const isVisible = ref(false)

onMounted(() => {
  // Check if dismissed previously
  const dismissed = localStorage.getItem(`tutorial_dismissed_${props.id}`)
  if (!dismissed) {
    // Small delay for better UX (don't pop immediately on load)
    setTimeout(() => {
      isVisible.value = true
    }, 1000)
  }
})

const dismiss = () => {
  isVisible.value = false
  localStorage.setItem(`tutorial_dismissed_${props.id}`, 'true')
}

const positionClasses = computed(() => {
    switch (props.position) {
        case 'top': return 'bottom-full mb-2 left-1/2 -translate-x-1/2'
        case 'bottom': return 'top-full mt-2 left-1/2 -translate-x-1/2'
        case 'left': return 'right-full mr-2 top-1/2 -translate-y-1/2'
        case 'right': return 'left-full ml-2 top-1/2 -translate-y-1/2'
        default: return 'top-full mt-2 left-1/2 -translate-x-1/2' // default bottom
    }
})

const arrowClasses = computed(() => {
    switch (props.position) {
        case 'top': return '-bottom-1 left-1/2 -translate-x-1/2'
        case 'bottom': return '-top-1 left-1/2 -translate-x-1/2'
        case 'left': return '-right-1 top-1/2 -translate-y-1/2'
        case 'right': return '-left-1 top-1/2 -translate-y-1/2'
        default: return '-top-1 left-1/2 -translate-x-1/2'
    }
})
</script>
