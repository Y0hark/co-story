<template>
  <div class="min-h-screen flex flex-col bg-charcoal-900 border-b border-charcoal-800">
    <!-- Header -->
    <header class="w-full py-6 px-4 md:px-8 border-b border-charcoal-800/50 backdrop-blur-sm fixed top-0 z-10 transition-all duration-300 transform" :class="{ '-translate-y-full': isScrollingDown }">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-serif font-bold tracking-tight bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text text-transparent">
          CoStory
        </h1>
        <nav class="flex gap-4">
          <router-link to="/auth/login" class="px-5 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors duration-200">
            Login
          </router-link>
          <router-link to="/auth/register" class="px-5 py-2 text-sm font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20 rounded-lg hover:bg-teal-500/20 hover:scale-105 transition-all duration-300 shadow-lg shadow-teal-500/10">
            Sign Up
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="flex-grow flex items-center justify-center pt-24 px-4 relative overflow-hidden">
      <!-- Background Decorations -->
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>

      <div class="max-w-4xl text-center z-0 animate-fade-in-up">
        <div class="inline-block mb-6 px-4 py-1.5 rounded-full bg-charcoal-800/50 border border-charcoal-700 backdrop-blur-md">
          <span class="text-xs font-medium text-teal-400 uppercase tracking-wider">Early Access Beta</span>
        </div>
        
        <h2 class="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight">
          Write <span class="text-teal-400 italic">with</span> AI,<br>
          not replaced by it.
        </h2>
        
        <p class="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Co-create stories, therapeutic journals, and personal legacies in a safe, judgment-free space.
        </p>

        <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <router-link to="/auth/register" class="group relative px-8 py-4 bg-teal-500 hover:bg-teal-400 text-charcoal-900 text-lg font-bold rounded-xl transition-all duration-300 shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transform hover:-translate-y-1 overflow-hidden">
             <span class="relative z-10 flex items-center gap-2">
               Start Writing Now
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                 <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
               </svg>
             </span>
             <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rotate-12"></div>
          </router-link>
          
          <a href="#features" class="px-8 py-4 text-zinc-300 font-medium hover:text-white transition-colors flex items-center gap-2 group">
            Learn more
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </main>

    <!-- Features Grid -->
    <section id="features" class="py-24 px-4 bg-charcoal-800/30">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8">
           <div class="p-8 rounded-2xl bg-charcoal-800/50 border border-charcoal-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300 group">
             <div class="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
               <span class="text-2xl">🤝</span>
             </div>
             <h3 class="text-xl font-bold mb-3 text-zinc-100">Co-Creation</h3>
             <p class="text-zinc-400 leading-relaxed">The AI is your coach and partner. It suggests, asks questions, and helps you flow—but you stay in control.</p>
           </div>
           
           <div class="p-8 rounded-2xl bg-charcoal-800/50 border border-charcoal-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300 group">
             <div class="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
               <span class="text-2xl">🔒</span>
             </div>
             <h3 class="text-xl font-bold mb-3 text-zinc-100">Privacy First</h3>
             <p class="text-zinc-400 leading-relaxed">Your stories are yours. Default private. Share only if and when you are ready.</p>
           </div>

           <div class="p-8 rounded-2xl bg-charcoal-800/50 border border-charcoal-700/50 backdrop-blur-sm hover:border-teal-500/30 transition-all duration-300 group">
             <div class="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
               <span class="text-2xl">🛡️</span>
             </div>
             <h3 class="text-xl font-bold mb-3 text-zinc-100">Safe Space</h3>
             <p class="text-zinc-400 leading-relaxed">A judgment-free zone perfect for therapeutic journaling, introspection, and personal growth.</p>
           </div>
        </div>
      </div>
    </section>

    <footer class="py-12 border-t border-charcoal-800 text-center text-zinc-500 text-sm">
      <p>&copy; 2026 CoStory. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Basic scroll handling for header effect
const isScrollingDown = ref(false);
let lastScrollY = 0;

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY && currentScrollY > 50) {
    isScrollingDown.value = true;
  } else {
    isScrollingDown.value = false;
  }
  lastScrollY = currentScrollY;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fade-in-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
