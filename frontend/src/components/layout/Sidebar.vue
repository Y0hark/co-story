<template>
  <aside class="w-64 border-r border-stone-200 bg-[#FDFBF7] flex flex-col h-screen fixed left-0 top-0">
    <div class="p-6 flex items-center gap-2">
      <Feather class="w-6 h-6 text-teal-700" stroke-width="2.5" />
      <h1 class="text-xl font-serif font-bold text-stone-900 tracking-tight">
        CoStory
      </h1>
    </div>

    <nav class="flex-1 px-4 space-y-2">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group"
        :class="[
          $route.path === item.path
            ? 'bg-stone-200/50 text-teal-700'
            : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
        ]"
      >
        <component 
          :is="item.icon" 
          class="w-5 h-5 transition-colors duration-200"
          :class="$route.path === item.path ? 'text-teal-700' : 'text-stone-400 group-hover:text-stone-600'"
        />
        {{ item.label }}
      </router-link>
    </nav>

    <div class="p-4 border-t border-stone-200">
      <button class="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all">
        <LogOut class="w-5 h-5" />
        Sign Out
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { 
  LayoutDashboard, 
  PenTool, 
  Users, 
  User, 
  LogOut,
  Feather
} from 'lucide-vue-next'

const navItems = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Studio', path: '/app/studio', icon: PenTool },
  { label: 'Community', path: '/app/community', icon: Users },
  { label: 'Profile', path: '/app/profile', icon: User },
]
</script>
