<template>
  <div class="max-w-4xl mx-auto py-12 px-6">
    <div class="mb-8">
       <button v-if="step > 1" @click="step--" class="text-stone-500 hover:text-stone-800 flex items-center gap-2 mb-4 transition-colors">
           <ArrowLeft class="w-4 h-4" /> Back
       </button>
       <h1 class="text-3xl font-serif font-bold text-stone-900 mb-2">{{ stepTitle }}</h1>
       <p class="text-stone-500">{{ stepDescription }}</p>
    </div>

    <!-- Step 1: Mode Selection -->
    <div v-if="step === 1" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Option 1: Guided -->
        <div 
            class="bg-white border border-stone-200 rounded-xl p-6 hover:border-teal-500/50 hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
            @click="selectMode('guided')"
        >
             <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles class="w-24 h-24 text-teal-600" />
            </div>
            <div class="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4 text-teal-600">
                <Sparkles class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-stone-900 mb-2">Guided Creation</h3>
            <p class="text-sm text-stone-500 leading-relaxed">
                Define your themes, topics, and goals. Let AI structure the perfect starting point for you.
            </p>
        </div>

        <!-- Option 2: Blank Page -->
        <div 
            class="bg-white border border-stone-200 rounded-xl p-6 hover:border-teal-500/50 hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
             @click="selectMode('blank')"
        >
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText class="w-24 h-24 text-stone-600" />
            </div>
            <div class="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4 text-stone-600">
                <FileText class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-stone-900 mb-2">Blank Page</h3>
            <p class="text-sm text-stone-500 leading-relaxed">
                Start from scratch with a clean slate. Perfect if you already know exactly what to write.
            </p>
        </div>

        <!-- Option 3: Import -->
        <div 
            class="bg-white border border-stone-200 rounded-xl p-6 hover:border-teal-500/50 hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
             @click="selectMode('import')"
        >
             <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Upload class="w-24 h-24 text-stone-600" />
            </div>
            <div class="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4 text-stone-600">
                <Upload class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-stone-900 mb-2">Import Existing</h3>
            <p class="text-sm text-stone-500 leading-relaxed">
                Bring your draft. We'll help you refine, translate, or continue it.
            </p>
        </div>

        <!-- Option 4: Therapeutic / Journaling -->
        <div 
            class="bg-stone-50 border border-stone-200 rounded-xl p-6 hover:border-amber-500/50 hover:bg-amber-50/50 hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
             @click="selectMode('journaling')"
        >
             <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <HeartHandshake class="w-24 h-24 text-amber-600" />
            </div>
            <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-700">
                <HeartHandshake class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold text-stone-900 mb-2">Personal Journal</h3>
            <p class="text-sm text-stone-500 leading-relaxed">
                A private space for reflection. The AI acts as an empathetic therapist to guide your thoughts.
            </p>
        </div>
    </div>

    <!-- Step 2: Configuration & AI Role -->
    <div v-else-if="step === 2" class="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
        
        <!-- Private Mode Indicator -->
        <div v-if="config.mode === 'journaling'" class="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3 text-amber-800 text-sm">
            <Lock class="w-5 h-5 flex-shrink-0" />
            <span><strong>Private Session:</strong> This content is encrypted and will strictly never be published or shared.</span>
        </div>
        
        <!-- Guided Form Fields -->
        <div v-if="config.mode === 'guided'" class="space-y-6 bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-2">Story Title</label>
                <input 
                    v-model="config.title"
                    type="text"
                    class="w-full rounded-lg border-stone-200 bg-stone-50 p-3 text-stone-900 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="The Chronicles of..."
                />
            </div>
            
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-2">Story Concept / Topic</label>
                <textarea 
                    v-model="config.topic"
                    rows="3"
                    class="w-full rounded-lg border-stone-200 bg-stone-50 p-3 text-stone-900 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="e.g. A cyberpunk detective story set in Neo-Tokyo regarding a missing android..."
                ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-6">
                 <div>
                    <label class="block text-sm font-medium text-stone-700 mb-2">Genre / Theme</label>
                    <BaseSelect 
                        v-model="config.genre"
                        :options="[
                            { label: 'Sci-Fi', value: 'Sci-Fi' },
                            { label: 'Fantasy', value: 'Fantasy' },
                            { label: 'Mystery', value: 'Mystery' },
                            { label: 'Romance', value: 'Romance' },
                            { label: 'Non-Fiction', value: 'Non-Fiction' }
                        ]"
                    />
                </div>
                 <div>
                    <label class="block text-sm font-medium text-stone-700 mb-2">Tone / Style</label>
                    <BaseSelect 
                        v-model="config.tone"
                        :options="[
                            { label: 'Dark & Gritty', value: 'Dark & Gritty' },
                            { label: 'Light & Humorous', value: 'Light & Humorous' },
                            { label: 'Formal & Academic', value: 'Formal & Academic' },
                            { label: 'Poetic & Lyrical', value: 'Poetic & Lyrical' }
                        ]"
                    />
                </div>
            </div>
        </div>

        <div v-else-if="config.mode === 'import'" class="bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
             <label class="block text-sm font-medium text-stone-700 mb-2">Paste your draft</label>
             <textarea 
                v-model="config.content"
                rows="6"
                class="w-full rounded-lg border-stone-200 bg-stone-50 p-3 text-stone-900 focus:border-teal-500 focus:ring-teal-500"
                placeholder="Paste your existing content here..."
            ></textarea>
        </div>

        <!-- AI Role Selection -->
        <div class="bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
            <h3 class="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Bot class="w-5 h-5 text-teal-600" /> AI Collaboration Style
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="config.mode !== 'journaling'"
                    class="p-4 rounded-lg border-2 cursor-pointer transition-all"
                    :class="config.aiRole === 'writer' ? 'border-teal-500 bg-teal-50' : 'border-stone-100 hover:border-stone-300'"
                    @click="config.aiRole = 'writer'"
                >
                    <div class="font-bold text-stone-900 mb-1">Co-Writer</div>
                    <p class="text-xs text-stone-500">I'll provide milestones, you write the content. I fill in the blanks.</p>
                </div>

                <div v-if="config.mode !== 'journaling'"
                    class="p-4 rounded-lg border-2 cursor-pointer transition-all"
                    :class="config.aiRole === 'editor' ? 'border-teal-500 bg-teal-50' : 'border-stone-100 hover:border-stone-300'"
                    @click="config.aiRole = 'editor'"
                >
                    <div class="font-bold text-stone-900 mb-1">Editor & Assistant</div>
                    <p class="text-xs text-stone-500">I write the draft. You correct grammar, polish tone, and fix consistency.</p>
                </div>

                <div v-if="config.mode === 'journaling'"
                    class="p-4 rounded-lg border-2 border-amber-500 bg-amber-50 cursor-pointer transition-all col-span-2"
                    @click="config.aiRole = 'therapist'"
                >
                    <div class="font-bold text-stone-900 mb-1">Empathetic Partner</div>
                    <p class="text-xs text-stone-500">I listen without judgement, ask reflective questions, and help you process your thoughts. I never judge or critique.</p>
                </div>
            </div>
        </div>

        <button @click="createStory" class="w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2" :class="config.mode === 'journaling' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-teal-700 hover:bg-teal-800'">
            <Sparkles class="w-5 h-5" />
            {{ config.mode === 'journaling' ? 'Start Private Journal' : 'Create Story' }}
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, FileText, Upload, ArrowLeft, Bot, HeartHandshake, Lock } from 'lucide-vue-next'
import BaseSelect from '../components/ui/BaseSelect.vue'

const router = useRouter()
const step = ref(1)

const config = reactive({
    mode: '', // 'guided', 'blank', 'import', 'journaling'
    title: '',
    topic: '',
    genre: 'Sci-Fi',
    tone: 'Dark & Gritty',
    content: '',
    aiRole: 'writer', // 'writer', 'editor', 'therapist'
    isPrivate: false
})

const stepTitle = computed(() => {
    if (step.value === 1) return "How would you like to start?"
    return "Configure your Story"
})

const stepDescription = computed(() => {
    if (step.value === 1) return "Choose the best way to begin your new masterpiece."
    return "Tell us a bit more so we can set up the perfect environment."
})

const selectMode = (mode: string) => {
    config.mode = mode
    step.value = 2
    
    // Set defaults based on mode
    if (mode === 'journaling') {
        config.aiRole = 'therapist'
        config.isPrivate = true
        config.tone = 'Reflective'
        config.genre = 'Personal'
    } else {
        config.isPrivate = false
        // Reset defaults if needed
        if (config.aiRole === 'therapist') config.aiRole = 'writer'
    }
}

const createStory = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        })
        
        if (!response.ok) throw new Error('Failed to create story')
        
        const data = await response.json()
        console.log("Story created:", data)
        
        // Redirect to Studio with the new Story ID
        // Note: Studio needs to support :id param
        router.push(`/app/studio/${data.id}`)
    } catch (e) {
        console.error(e)
        alert('Error creating story. Please check console.')
    }
}
</script>

<style scoped>
.animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
