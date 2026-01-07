<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" @click="close"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-stone-100 transform transition-all">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
            <h3 class="text-lg font-serif font-bold text-stone-900">{{ title }}</h3>
            <button @click="close" class="text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-full hover:bg-stone-100">
                <X class="w-4 h-4" />
            </button>
        </div>

        <!-- Body -->
        <div class="p-6">
            <p v-if="description" class="text-sm text-stone-500 mb-4 leading-relaxed">
                {{ description }}
            </p>
            <slot></slot>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-stone-50 flex justify-end gap-3">
            <button 
                @click="close"
                class="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
            >
                {{ cancelText }}
            </button>
            <button 
                @click="confirm"
                class="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-all transform active:scale-95 flex items-center gap-2"
                :class="isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-600 hover:bg-teal-700'"
            >
                <Trash2 v-if="isDestructive" class="w-4 h-4" />
                {{ confirmText }}
            </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { X, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Confirmation'
  },
  description: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  isDestructive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const close = () => emit('close')
const confirm = () => emit('confirm')
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .transform,
.modal-leave-active .transform {
  transition: all 0.2s ease-out;
}

.modal-enter-from .transform,
.modal-leave-to .transform {
  opacity: 0;
  transform: scale(0.95);
}
</style>
