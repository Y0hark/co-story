<template>
  <div class="max-w-5xl mx-auto space-y-8">
    <!-- Header / Banner -->
    <div class="relative">
      <div class="h-48 rounded-2xl bg-gradient-to-r from-teal-100 to-amber-100 border border-stone-200 overflow-hidden relative">
          <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-multiply"></div>
      </div>
      
      <div class="absolute -bottom-16 left-8 flex items-end gap-6">
        <div class="w-32 h-32 rounded-full border-4 border-[#FDFBF7] bg-white flex items-center justify-center overflow-hidden shadow-lg">
            <!-- Placeholder Avatar -->
            <img src="https://api.dicebear.com/7.x/big-ears/svg?seed=Felix" alt="Avatar" class="w-full h-full object-cover" />
        </div>
        
        <div class="mb-2">
            <h1 class="text-3xl font-serif font-bold text-stone-900">Felix The Writer</h1>
            <p class="text-stone-500">@felix_writes • Joined January 2026</p>
        </div>
      </div>

      <div class="absolute bottom-4 right-8">
          <button class="px-4 py-2 rounded-lg bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900 transition-all font-medium text-sm shadow-sm">
              Edit Profile
          </button>
      </div>
    </div>

    <div class="pt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Stats & Bio -->
        <div class="space-y-6">
            <div class="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                <h3 class="font-serif font-bold text-stone-900 mb-4">About</h3>
                <p class="text-stone-600 text-sm leading-relaxed">
                    Sci-fi enthusiast and aspiring novelist. Using AI to break through writer's block and build worlds.
                </p>
                
                <div class="mt-6 flex flex-wrap gap-2">
                    <span class="px-2 py-1 rounded-md bg-stone-100 text-xs text-stone-600 border border-stone-200">Sci-Fi</span>
                    <span class="px-2 py-1 rounded-md bg-stone-100 text-xs text-stone-600 border border-stone-200">Cyberpunk</span>
                </div>
            </div>

            <div class="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                <h3 class="font-serif font-bold text-stone-900 mb-4">Stats</h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-stone-500">Words Written</span>
                        <span class="text-stone-800 font-mono">42,503</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-stone-500">Stories Published</span>
                        <span class="text-stone-800 font-mono">3</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-stone-500">Reading List</span>
                        <span class="text-stone-800 font-mono">12</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column: Recent Activity / Stories -->
        <div class="lg:col-span-2 space-y-6">
            <div class="flex items-center gap-6 border-b border-stone-200 pb-1">
                <button class="pb-3 text-teal-700 border-b-2 border-teal-700 font-medium text-sm">My Stories</button>
                <button class="pb-3 text-stone-500 hover:text-stone-800 font-medium text-sm transition-colors">Drafts</button>
                <button class="pb-3 text-stone-500 hover:text-stone-800 font-medium text-sm transition-colors">Saved</button>
            </div>

            <div class="space-y-4">
                <!-- Story Card 1 -->
                <div class="bg-white border border-stone-200 p-6 rounded-xl hover:border-teal-500/30 hover:shadow-md transition-all group cursor-pointer">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-serif font-bold text-stone-900 group-hover:text-teal-700 transition-colors">Echoes of Silhouette</h3>
                        <span class="text-xs text-stone-400 font-mono">Updated 2h ago</span>
                    </div>
                    <p class="text-stone-500 text-sm mb-4 line-clamp-2">
                        In a city where memories are currency, a young broker discovers a forgotten archive that could bring down the entire exchange.
                    </p>
                    <div class="flex items-center gap-4 text-xs text-stone-400">
                        <span class="flex items-center gap-1"><BookOpen class="w-3 h-3" /> 12 Chapters</span>
                        <span class="flex items-center gap-1"><Heart class="w-3 h-3" /> 84 Likes</span>
                    </div>
                </div>

                <!-- Story Card 2 -->
                <div class="bg-white border border-stone-200 p-6 rounded-xl hover:border-teal-500/30 hover:shadow-md transition-all group cursor-pointer">
                     <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-serif font-bold text-stone-900 group-hover:text-teal-700 transition-colors">The Last Botanist</h3>
                        <span class="text-xs text-stone-400 font-mono">Updated 1d ago</span>
                    </div>
                    <p class="text-stone-500 text-sm mb-4 line-clamp-2">
                        Terraforming Mars was supposed to be the new beginning. Instead, something ancient began to wake up beneath the red soil.
                    </p>
                    <div class="flex items-center gap-4 text-xs text-stone-400">
                        <span class="flex items-center gap-1"><BookOpen class="w-3 h-3" /> 5 Chapters</span>
                         <span class="flex items-center gap-1"><Heart class="w-3 h-3" /> 121 Likes</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Heart } from 'lucide-vue-next'
</script>
