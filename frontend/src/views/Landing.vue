<template>
  <div class="min-h-screen flex flex-col bg-[#FDFBF7] text-stone-900 font-sans selection:bg-teal-100/50">
    <!-- Header -->
    <header class="w-full py-6 px-4 md:px-8 fixed top-0 z-10 transition-all duration-300" :class="{ 'bg-[#FDFBF7]/80 backdrop-blur-md border-b border-stone-200/50': isScrollingDown }">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-2 text-teal-700">
             <Feather class="w-6 h-6" stroke-width="2.5" />
             <h1 class="text-xl font-serif font-bold tracking-tight text-stone-900">
              CoStory
            </h1>
        </div>
       
        <nav class="flex gap-4">
          <router-link to="/auth/login" class="px-5 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors duration-200">
            Log in
          </router-link>
          <router-link to="/auth/register" class="px-5 py-2 text-sm font-medium bg-stone-900 text-stone-50 rounded-lg hover:bg-teal-700 transition-all duration-300 shadow-lg shadow-stone-900/10">
            Start Writing
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="flex-grow flex items-center justify-center pt-32 pb-20 px-4 relative overflow-hidden">
        <!-- Subtle texture -->
       <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 brightness-100 contrast-50 mix-blend-multiply"></div>
       
       <!-- Gradient blobs (Subtle/Warm) -->
       <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
       <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>

      <div class="max-w-4xl text-center z-0 animate-fade-in-up relative">
         <div class="inline-flex items-center gap-2 mb-8 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 shadow-sm">
          <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span class="text-xs font-semibold text-stone-600 uppercase tracking-widest">Now Publicly Available</span>
        </div>

        <h2 class="text-6xl md:text-8xl font-serif font-bold mb-8 leading-[0.9] text-stone-900 tracking-tight">
          Craft stories<br>
          <span class="italic text-teal-700 font-medium">that matter.</span>
        </h2>
        
        <p class="text-xl md:text-2xl text-stone-500 mb-12 max-w-xl mx-auto leading-relaxed font-serif italic">
          Your personal AI creative partner. Unblock ideas, deepen characters, and write with flow—never replacing your voice.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <router-link to="/app/dashboard" class="group px-8 py-4 bg-stone-900 text-stone-50 text-lg font-medium rounded-xl hover:bg-teal-700 transition-all duration-300 shadow-xl shadow-stone-900/10 transform hover:-translate-y-0.5">
             <span class="flex items-center gap-2">
               Start Writing Free
               <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </span>
          </router-link>
          
          <a href="#features" class="px-8 py-4 text-stone-600 font-medium hover:text-stone-900 transition-colors flex items-center gap-2">
            See how it works
          </a>
        </div>
      </div>
    </main>

    <!-- Features Grid -->
    <section id="features" class="py-24 px-4 relative z-0">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8">
           <div class="p-8 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 group">
             <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-teal-700">
                <Sparkles class="w-6 h-6" />
             </div>
             <h3 class="text-xl font-bold mb-3 text-stone-900 font-serif">Deep Co-Creation</h3>
             <p class="text-stone-500 leading-relaxed">It doesn't just write. It asks clarifying questions, suggests plot twists, and respects your style.</p>
           </div>
           
           <div class="p-8 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 group">
             <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-amber-700">
               <Lock class="w-6 h-6" />
             </div>
             <h3 class="text-xl font-bold mb-3 text-stone-900 font-serif">Private & Secure</h3>
             <p class="text-stone-500 leading-relaxed">Your drafts are your own. End-to-end encrypted logic ensures your personal stories stay personal.</p>
           </div>

           <div class="p-8 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 group">
             <div class="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-rose-700">
               <Heart class="w-6 h-6" />
             </div>
             <h3 class="text-xl font-bold mb-3 text-stone-900 font-serif">Therapeutic Flow</h3>
             <p class="text-stone-500 leading-relaxed">Designed for introspection. Use it to journal, process emotions, or simply escape into your world.</p>
           </div>
        </div>
      </div>
    </section>

    <footer class="py-12 border-t border-stone-200 text-center text-stone-400 text-sm bg-white">
      <p>&copy; 2026 CoStory. Crafted with care.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Feather, ArrowRight, Sparkles, Lock, Heart } from 'lucide-vue-next';

// Basic scroll handling for header effect
const isScrollingDown = ref(false);

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > 50) {
    isScrollingDown.value = true;
  } else {
    isScrollingDown.value = false;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-fade-in-up {
  animation: fade-in-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes fade-in-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
