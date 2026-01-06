<template>
  <div class="flex flex-col h-full">
    <!-- Toolbar -->
    <div v-if="editor" class="flex items-center gap-1 p-2 border-b border-stone-200 bg-stone-50">
      <button 
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'bg-stone-200 text-stone-900': editor.isActive('bold'), 'text-stone-500 hover:bg-stone-200 hover:text-stone-700': !editor.isActive('bold') }"
        class="p-2 rounded transition-colors"
        title="Bold"
      >
        <Bold class="w-4 h-4" />
      </button>
      <button 
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'bg-stone-200 text-stone-900': editor.isActive('italic'), 'text-stone-500 hover:bg-stone-200 hover:text-stone-700': !editor.isActive('italic') }"
        class="p-2 rounded transition-colors"
        title="Italic"
      >
        <Italic class="w-4 h-4" />
      </button>
        <div class="w-px h-6 bg-stone-300 mx-2"></div>
      <button 
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'bg-stone-200 text-stone-900': editor.isActive('heading', { level: 1 }), 'text-stone-500 hover:bg-stone-200 hover:text-stone-700': !editor.isActive('heading', { level: 1 }) }"
        class="p-2 rounded transition-colors"
        title="Heading 1"
      >
        <Heading1 class="w-4 h-4" />
      </button>
      <button 
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'bg-stone-200 text-stone-900': editor.isActive('heading', { level: 2 }), 'text-stone-500 hover:bg-stone-200 hover:text-stone-700': !editor.isActive('heading', { level: 2 }) }"
         class="p-2 rounded transition-colors"
         title="Heading 2"
      >
        <Heading2 class="w-4 h-4" />
      </button>
      
      <div class="w-px h-6 bg-stone-300 mx-2"></div>
      
      <button 
        @click="$emit('request-ai-edit', editor.state.selection)"
        class="p-2 rounded transition-colors text-teal-600 hover:bg-teal-50 hover:text-teal-700"
        title="AI Magic Edit"
      >
        <Sparkles class="w-4 h-4" />
      </button>
    </div>

    <!-- Editor Content -->
    <editor-content :editor="editor" class="flex-1 overflow-y-auto p-8 focus:outline-none" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Heading1, Heading2, Sparkles } from 'lucide-vue-next'
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits(['update:modelValue', 'editor-created', 'request-ai-edit'])

const editor = useEditor({
  content: props.modelValue || '<p>Start writing your story...</p>',
  extensions: [
    StarterKit,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-lg prose-stone max-w-none focus:outline-none h-full font-serif',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  onCreate: ({ editor }) => {
    emit('editor-created', editor)
  },
})

// Update content if modelValue changes externally
watch(() => props.modelValue, (newValue) => {
  const isSame = editor.value?.getHTML() === newValue
  if (!isSame && newValue !== undefined) {
    editor.value?.commands.setContent(newValue, { emitUpdate: false }) 
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
/* Custom typography overrides for the editor */
.ProseMirror p.is-editor-empty:first-child::before {
  color: #52525b; /* zinc-600 */
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.ProseMirror {
    outline: none;
}
</style>
