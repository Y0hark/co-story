<template>
  <div class="relative" ref="container">
    <button 
      @click="isOpen = !isOpen"
      type="button"
      class="w-full flex items-center justify-between gap-2 px-3 py-2 bg-stone-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      :class="[
        isOpen ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-stone-200 hover:border-stone-300'
      ]"
    >
      <span class="truncate" :class="modelValue ? 'text-stone-900' : 'text-stone-400'">
        {{ selectedLabel || placeholder }}
      </span>
      <ChevronDown 
        class="w-4 h-4 text-stone-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <div 
        v-if="isOpen"
        class="absolute z-50 w-full mt-1 bg-white border border-stone-100 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100 origin-top"
    >
        <div 
            v-for="option in options" 
            :key="option.value"
            @click="select(option)"
            class="px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between"
            :class="[
                modelValue === option.value ? 'bg-teal-50 text-teal-700 font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
            ]"
        >
            {{ option.label }}
            <Check v-if="modelValue === option.value" class="w-3.5 h-3.5" />
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string | number
  options: { label: string; value: string | number }[]
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const container = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const option = props.options.find(o => o.value === props.modelValue)
  return option ? option.label : ''
})

const select = (option: { label: string; value: string | number }) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

// Click outside to close
const handleClickOutside = (event: MouseEvent) => {
  if (container.value && !container.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
