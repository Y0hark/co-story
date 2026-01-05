<template>
  <div class="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-teal-100/50">
    <Sidebar />
    
    <main class="ml-64 min-h-screen">
        <!-- Top bar or header could go here if needed -->
        <header class="h-16 border-b border-stone-200 flex items-center justify-between px-8 bg-[#FDFBF7]/80 backdrop-blur-sm sticky top-0 z-10">
            <div class="flex items-center gap-4">
                <!-- Breadcrumbs or page title -->
                <h2 class="text-sm font-medium text-stone-500 font-serif italic">{{ $route.meta.title || 'Overview' }}</h2>
            </div>
            
            <div class="flex items-center gap-4">
               <!-- User profile small or notifications -->
               <div class="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-xs font-serif font-bold text-stone-600">
                 F
               </div>
            </div>
        </header>

      <div class="p-8">
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
import Sidebar from '../components/layout/Sidebar.vue'
</script>
