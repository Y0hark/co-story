<template>
  <div class="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-teal-100/50">
    <Navbar_Floating />
    
      <main class="min-h-screen pb-24 md:pb-0">
        <header class="hidden md:flex h-20 items-center justify-between px-10 bg-gradient-to-b from-[#FDFBF7] to-[#FDFBF7]/90 backdrop-blur-sm sticky top-0 z-10 transition-all duration-300">
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity cursor-default group">
                    <div class="p-2 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-100/50 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <Feather class="w-5 h-5 text-teal-700" stroke-width="2.5" />
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-stone-900 tracking-tight leading-none font-serif">CoStory</h1>
                        <span class="text-[10px] font-medium text-teal-600/80 tracking-widest uppercase ml-0.5">Studio</span>
                    </div>
                </div>
                
                <div class="h-8 w-px bg-stone-200/50 mx-2"></div>
                
                <!-- Page Title / Context -->
                <h2 class="text-stone-500 font-serif text-lg italic animate-fade-in">
                    {{ $route.meta.title || 'Overview' }}
                </h2>
            </div>

             <button 
                @click="createStory"
                class="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md transform active:scale-95"
            >
                <Feather class="w-4 h-4" />
                <span>New Story</span>
            </button>
        </header>

        <!-- Mobile Header -->
        <header class="md:hidden flex items-center justify-between px-4 py-4 bg-[#FDFBF7]/90 backdrop-blur-sm sticky top-0 z-10">
             <div class="flex items-center gap-2">
                 <Feather class="w-5 h-5 text-teal-700" stroke-width="2.5" />
                 <h1 class="text-lg font-bold text-stone-900 font-serif">CoStory</h1>
             </div>
        </header>

      <div :class="$route.name === 'Studio' ? 'p-0' : 'p-4 md:p-8'">
        <router-view v-slot="{ Component }">
          <transition 
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Navbar_Floating from '../components/layout/Navbar_Floating.vue'
import { Feather } from 'lucide-vue-next'

const router = useRouter()

const createStory = () => {
    router.push('/app/new-story')
}
</script>
