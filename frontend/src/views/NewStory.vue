<template>
  <div class="max-w-4xl mx-auto py-12 px-6">
    <div class="mb-8">
       <button v-if="step > 1" @click="step--" class="text-stone-400 hover:text-stone-900 flex items-center gap-2 mb-4 transition-colors font-medium text-sm">
           <ArrowLeft class="w-4 h-4" /> Back
       </button>
       <h1 class="text-3xl font-serif font-bold text-stone-900 mb-2">{{ stepTitle }}</h1>
       <p class="text-stone-500 font-medium">{{ stepDescription }}</p>
    </div>

    <!-- Step 1: Main Path Selection -->
    <div v-if="step === 1" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Path 1: Co-Creation -->
        <div 
            class="bg-white border border-stone-200 rounded-xl p-8 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer transition-all group relative overflow-hidden"
            @click="selectPath('guided')"
        >
             <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles class="w-40 h-40 text-indigo-600" />
            </div>
            <div class="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                <Sparkles class="w-7 h-7" />
            </div>
            <h3 class="text-2xl font-serif font-bold text-stone-900 mb-3 group-hover:text-indigo-700 transition-colors">Co-Creation</h3>
            <p class="text-stone-500 leading-relaxed mb-6 font-medium">
                Collaborate with our squad of specialized AI assistants. Brainstorm ideas, structure your plot, or get help writing scenes.
            </p>
            
            <!-- Assistant Preview -->
            <div class="flex items-center -space-x-3 opacity-70 group-hover:opacity-100 transition-opacity">
                <div v-for="agent in coCreationAssistants" :key="agent.id" 
                    class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm"
                    :class="[agent.avatarBg, agent.avatarText]"
                    :title="agent.name"
                >
                    {{ agent.name[0] }}
                </div>
            </div>
        </div>

        <!-- Path 2: Personal Journal -->
        <div 
            class="bg-stone-50 border border-stone-200 rounded-xl p-8 hover:border-orange-900/30 hover:bg-white hover:shadow-xl hover:shadow-orange-900/5 cursor-pointer transition-all group relative overflow-hidden"
             @click="selectPath('journal')"
        >
             <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <HeartHandshake class="w-40 h-40 text-orange-900" />
            </div>
            <div class="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center mb-6 text-stone-600 group-hover:bg-orange-100 group-hover:text-orange-800 transition-colors duration-300 group-hover:scale-110 transform">
                <HeartHandshake class="w-7 h-7" />
            </div>
            <h3 class="text-2xl font-serif font-bold text-stone-900 mb-3 group-hover:text-orange-900 transition-colors">Personal Journal</h3>
            <p class="text-stone-500 leading-relaxed mb-6 font-medium">
                A private, safe space for reflection. Sofia will guide you through your thoughts with empathy and zero judgement.
            </p>
            
            <div class="flex items-center gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                <div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm bg-orange-100 text-orange-800">
                    S
                </div>
                <span class="text-xs font-bold text-stone-600 uppercase tracking-wider">Sofia • Empathetic Partner</span>
            </div>
        </div>
    </div>

    <!-- Step 2: Configuration & Agent Selection -->
    <div v-else-if="step === 2" class="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
        
        <!-- Private Mode Indicator -->
        <div v-if="config.mode === 'journal'" class="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3 text-orange-900 text-sm font-medium">
            <Lock class="w-5 h-5 flex-shrink-0" />
            <span><strong>Private Session:</strong> This content is encrypted and will strictly never be published or shared.</span>
        </div>
        
        <!-- Config Fields -->
        <div class="space-y-6 bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
            <div>
                <label class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 ml-1">Title</label>
                <input 
                    v-model="config.title"
                    type="text"
                    class="w-full rounded-xl border-stone-200 bg-stone-50 p-3 text-stone-900 placeholder-stone-400 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all hover:border-stone-300"
                    placeholder="Enter a title..."
                />
            </div>
            
            <div v-if="config.mode === 'guided'">
                <label class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 ml-1">Topic / Concept</label>
                <textarea 
                    v-model="config.topic"
                    rows="3"
                    class="w-full rounded-xl border-stone-200 bg-stone-50 p-3 text-stone-900 placeholder-stone-400 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all hover:border-stone-300"
                    placeholder="What would you like to create today?"
                ></textarea>
            </div>

            <div v-if="config.mode === 'guided'" class="grid grid-cols-2 gap-6">
                 <div>
                    <label class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 ml-1">Genre</label>
                    <BaseSelect 
                        v-model="config.genre"
                        :options="genreOptions"
                    />
                </div>
                 <div>
                    <label class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 ml-1">Tone</label>
                    <BaseSelect 
                        v-model="config.tone"
                        :options="toneOptions"
                    />
                </div>
            </div>
        </div>

        <!-- Squad Selection (Only for Guided/Co-Creation) -->
        <div v-if="config.mode === 'guided'" class="bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
            <h3 class="text-lg font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Bot class="w-5 h-5 text-indigo-600" /> Choose your Partner
            </h3>
            
            <div class="grid grid-cols-1 gap-4">
                <div v-for="agent in coCreationAssistants" :key="agent.id"
                    class="p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 relative overflow-hidden group"
                    :class="config.aiRole === agent.id ? 'border-indigo-500 bg-indigo-50/10' : 'border-stone-100 hover:border-stone-300 bg-stone-50'"
                    @click="agent.locked ? null : (config.aiRole = agent.id)"
                >
                    <div 
                        class="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold shadow-sm"
                        :class="[agent.avatarBg, agent.avatarText]"
                    >
                        {{ agent.name[0] }}
                    </div>
                    
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-bold text-stone-900 group-hover:text-indigo-700 transition-colors">{{ agent.name }}</h4>
                            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-white border border-stone-200 text-stone-500">{{ agent.role }}</span>
                            <Lock v-if="agent.locked" class="w-3 h-3 text-stone-400" />
                        </div>
                        <p class="text-sm text-stone-500 leading-relaxed font-medium">{{ agent.description }}</p>
                    </div>

                    <div v-if="config.aiRole === agent.id" class="absolute top-4 right-4 text-indigo-600">
                        <Check class="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Journal Confirmation (Sofia) -->
        <div v-if="config.mode === 'journal'" class="bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-start gap-4">
             <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold flex-shrink-0">S</div>
             <div>
                 <h4 class="font-bold text-stone-900 mb-1">Collaborating with Sofia</h4>
                 <p class="text-sm text-stone-600 font-medium">Sofia is ready to listen. Your journal is private and secure.</p>
             </div>
        </div>

        <button @click="createStory" class="w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 hover-sketch active:scale-95 duration-200" :class="config.mode === 'journal' ? 'bg-stone-900' : 'bg-indigo-600 hover:bg-indigo-700'">
            <Sparkles class="w-5 h-5" />
            {{ config.mode === 'journal' ? 'Start Journaling' : 'Enter Studio' }}
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
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
        const response = await axios.post('http://localhost:3001/api/stories', config)
        
        const data = response.data
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
