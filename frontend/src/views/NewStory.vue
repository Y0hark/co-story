<template>
  <div class="max-w-4xl mx-auto py-12 px-6">
    <div class="mb-8">
       <button v-if="step > 1" @click="step--" class="text-stone-500 hover:text-stone-800 flex items-center gap-2 mb-4 transition-colors">
           <ArrowLeft class="w-4 h-4" /> Back
       </button>
       <h1 class="text-3xl font-serif font-bold text-stone-900 mb-2">{{ stepTitle }}</h1>
       <p class="text-stone-500">{{ stepDescription }}</p>
    </div>

    <!-- Step 1: Main Path Selection -->
    <div v-if="step === 1" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Path 1: Co-Creation -->
        <div 
            class="bg-white border border-stone-200 rounded-xl p-8 hover:border-teal-500/50 hover:shadow-lg cursor-pointer transition-all group relative overflow-hidden"
            @click="selectPath('guided')"
        >
             <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles class="w-40 h-40 text-teal-600" />
            </div>
            <div class="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-6 text-teal-600">
                <Sparkles class="w-7 h-7" />
            </div>
            <h3 class="text-2xl font-serif font-bold text-stone-900 mb-3">Co-Creation</h3>
            <p class="text-stone-500 leading-relaxed mb-6">
                Collaborate with our squad of specialized AI assistants. Brainstorm ideas, structure your plot, or get help writing scenes.
            </p>
            
            <!-- Assistant Preview -->
            <div class="flex items-center -space-x-3">
                <div v-for="agent in coCreationAssistants" :key="agent.id" 
                    class="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm"
                    :class="[agent.avatarBg, agent.avatarText]"
                    :title="agent.name"
                >
                    {{ agent.name[0] }}
                </div>
            </div>
        </div>

        <!-- Path 2: Personal Journal -->
        <div 
            class="bg-stone-50 border border-stone-200 rounded-xl p-8 hover:border-amber-500/50 hover:bg-amber-50/50 hover:shadow-lg cursor-pointer transition-all group relative overflow-hidden"
             @click="selectPath('journal')"
        >
             <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <HeartHandshake class="w-40 h-40 text-amber-600" />
            </div>
            <div class="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-6 text-amber-700">
                <HeartHandshake class="w-7 h-7" />
            </div>
            <h3 class="text-2xl font-serif font-bold text-stone-900 mb-3">Personal Journal</h3>
            <p class="text-stone-500 leading-relaxed mb-6">
                A private, safe space for reflection. Sofia will guide you through your thoughts with empathy and zero judgement.
            </p>
            
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm bg-amber-100 text-amber-600">
                    S
                </div>
                <span class="text-sm font-medium text-amber-800">Sofia • Empathetic Partner</span>
            </div>
        </div>
    </div>

    <!-- Step 2: Configuration & Agent Selection -->
    <div v-else-if="step === 2" class="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
        
        <!-- Private Mode Indicator -->
        <div v-if="config.mode === 'journal'" class="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3 text-amber-800 text-sm">
            <Lock class="w-5 h-5 flex-shrink-0" />
            <span><strong>Private Session:</strong> This content is encrypted and will strictly never be published or shared.</span>
        </div>
        
        <!-- Config Fields -->
        <div class="space-y-6 bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
            <div>
                <label class="block text-sm font-medium text-stone-700 mb-2">Title</label>
                <input 
                    v-model="config.title"
                    type="text"
                    class="w-full rounded-lg border-stone-200 bg-stone-50 p-3 text-stone-900 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="Enter a title..."
                />
            </div>
            
            <div v-if="config.mode === 'guided'">
                <label class="block text-sm font-medium text-stone-700 mb-2">Topic / Concept</label>
                <textarea 
                    v-model="config.topic"
                    rows="3"
                    class="w-full rounded-lg border-stone-200 bg-stone-50 p-3 text-stone-900 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="What would you like to create today?"
                ></textarea>
            </div>

            <div v-if="config.mode === 'guided'" class="grid grid-cols-2 gap-6">
                 <div>
                    <label class="block text-sm font-medium text-stone-700 mb-2">Genre</label>
                    <BaseSelect 
                        v-model="config.genre"
                        :options="genreOptions"
                    />
                </div>
                 <div>
                    <label class="block text-sm font-medium text-stone-700 mb-2">Tone</label>
                    <BaseSelect 
                        v-model="config.tone"
                        :options="toneOptions"
                    />
                </div>
            </div>
        </div>

        <!-- Squad Selection (Only for Guided/Co-Creation) -->
        <div v-if="config.mode === 'guided'" class="bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
            <h3 class="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Bot class="w-5 h-5 text-teal-600" /> Choose your Partner
            </h3>
            
            <div class="grid grid-cols-1 gap-4">
                <div v-for="agent in coCreationAssistants" :key="agent.id"
                    class="p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 relative overflow-hidden"
                    :class="config.aiRole === agent.id ? 'border-teal-500 bg-stone-50' : 'border-stone-100 hover:border-stone-200'"
                    @click="agent.locked ? null : (config.aiRole = agent.id)"
                >
                    <div 
                        class="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold"
                        :class="[agent.avatarBg, agent.avatarText]"
                    >
                        {{ agent.name[0] }}
                    </div>
                    
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-bold text-stone-900">{{ agent.name }}</h4>
                            <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-500">{{ agent.role }}</span>
                            <Lock v-if="agent.locked" class="w-3 h-3 text-stone-400" />
                        </div>
                        <p class="text-sm text-stone-500 leading-snug">{{ agent.description }}</p>
                    </div>

                    <div v-if="config.aiRole === agent.id" class="absolute top-4 right-4 text-teal-600">
                        <Check class="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Journal Confirmation (Sofia) -->
        <div v-if="config.mode === 'journal'" class="bg-amber-50/50 p-6 rounded-xl border border-amber-100 flex items-start gap-4">
             <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold flex-shrink-0">S</div>
             <div>
                 <h4 class="font-bold text-amber-900 mb-1">Collaborating with Sofia</h4>
                 <p class="text-sm text-amber-800">Sofia is ready to listen. Your journal is private and secure.</p>
             </div>
        </div>

        <button @click="createStory" class="w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2" :class="config.mode === 'journal' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-teal-700 hover:bg-teal-800'">
            <Sparkles class="w-5 h-5" />
            {{ config.mode === 'journal' ? 'Start Journaling' : 'Enter Studio' }}
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, ArrowLeft, Bot, HeartHandshake, Lock, Check } from 'lucide-vue-next'
import BaseSelect from '../components/ui/BaseSelect.vue'
import { ASSISTANTS } from '../config/assistants'
import { GENRES, TONES } from '../config/storyOptions'

const router = useRouter()
const step = ref(1)

const genreOptions = GENRES.map(g => ({ label: g, value: g }))
const toneOptions = TONES.map(t => ({ label: t, value: t }))

const config = reactive({
    mode: '', 
    title: '',
    topic: '',
    genre: 'General',
    tone: 'Casual',
    content: '',
    aiRole: 'coauthor', 
    isPrivate: false
})

const coCreationAssistants = computed(() => ASSISTANTS.filter(a => a.mode === 'guided'))

const stepTitle = computed(() => {
    if (step.value === 1) return "Welcome to CoStory"
    return config.mode === 'journal' ? "Setup your Journal" : "Assemble your Squad"
})

const stepDescription = computed(() => {
    if (step.value === 1) return "Choose how you want to collaborate with AI today."
    return "Customize your experience before we begin."
})

const selectPath = (mode: string) => {
    config.mode = mode
    step.value = 2
    
    if (mode === 'journal') {
        config.aiRole = 'therapeutic'
        config.isPrivate = true
        config.tone = 'Reflective'
        config.genre = 'Personal'
    } else {
        config.isPrivate = false
        config.aiRole = 'coauthor' // Default to Kai
    }
}

const createStory = async () => {
    if (!config.title) config.title = config.mode === 'journal' ? 'My Journal' : 'Untitled Story'
    
    try {
        const response = await fetch('http://localhost:3001/api/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        })
        
        if (!response.ok) throw new Error('Failed to create story')
        
        const data = await response.json()
        router.push(`/app/studio/${data.id}`)
    } catch (e) {
        console.error(e)
        alert('Error creating story.')
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
