<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Quick Action Card -->
      <div class="bg-white border border-stone-200 rounded-xl p-6 hover:border-teal-500/30 hover:shadow-md transition-all cursor-pointer group" @click="$router.push('/app/new-story')">
        <div class="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
          <PenTool class="w-5 h-5 text-teal-700" />
        </div>
        <h3 class="text-lg font-bold font-serif text-stone-900">Start Writing</h3>
        <p class="text-stone-500 text-sm mt-2">Create a new story or continue where you left off.</p>
      </div>

      <!-- Stats Card -->
       <div class="bg-white border border-stone-200 rounded-xl p-6">
        <div class="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center mb-4">
          <Activity class="w-5 h-5 text-amber-700" />
        </div>
        <h3 class="text-lg font-bold font-serif text-stone-900">Weekly Progress</h3>
        <p class="text-stone-500 text-sm mt-2">0 words written this week.</p>
      </div>
    </div>

    <!-- Recent Stories List Placeholder -->
    <div>
        <h3 class="text-lg font-serif font-bold text-stone-800 mb-4">Recent Stories</h3>
        <div class="bg-white border border-stone-200 border-dashed rounded-xl p-12 text-center text-stone-400">
            No stories yet. Start your first one!
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PenTool, Activity } from 'lucide-vue-next'
</script>
