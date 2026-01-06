<template>
  <div class="fixed bottom-0 left-0 w-full z-50 md:bottom-6 md:w-auto md:left-1/2 md:-translate-x-1/2">
    <div class="flex items-center justify-around md:justify-start md:gap-2 px-6 py-4 md:px-3 md:py-2 bg-white/80 backdrop-blur-md border-t md:border border-stone-200/50 md:rounded-full shadow-lg shadow-stone-200/20 transition-all md:hover:scale-[1.02] hover:shadow-xl">
      
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="relative p-2 md:p-3 rounded-full transition-all duration-300 group hover:bg-white flex flex-col items-center gap-1 md:block"
        :class="$route.path.startsWith(item.path) ? 'text-teal-600' : 'text-stone-400 hover:text-stone-700'"
      >
        <component 
          :is="item.icon" 
          class="w-6 h-6 md:w-6 md:h-6 transition-transform duration-300 group-hover:-translate-y-1" 
          stroke-width="2"
        />
        
        <!-- Tooltip (Desktop Only) -->
        <span class="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-stone-900 text-stone-50 text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {{ item.label }}
        </span>

        <!-- Active Indicator -->
        <span 
          v-if="$route.path.startsWith(item.path)"
          class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full md:block hidden"
        ></span>
      </router-link>

      <div class="hidden md:block w-px h-6 bg-stone-200 mx-2"></div>

      <button 
        class="relative p-2 md:p-3 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group hidden md:block"
      >
        <LogOut class="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" stroke-width="2" />
        <span class="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-stone-900 text-stone-50 text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Sign Out
        </span>
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  LayoutDashboard, 
  PenTool, 
  Users, 
  User, 
  LogOut,
  Library
} from 'lucide-vue-next'

const navItems = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Library', path: '/app/library', icon: Library },
  { label: 'Studio', path: '/app/studio', icon: PenTool },
  { label: 'Community', path: '/app/community', icon: Users },
  { label: 'Profile', path: '/app/profile', icon: User },
]
</script>
