<template>
  <div class="space-y-8 pb-24">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900">Subscription Plan</h1>
        <p class="text-stone-500 mt-2">Manage your current plan and unlock new capabilities.</p>
      </div>
    </div>

    <!-- Current Plan Banner (Mock) -->
    <div class="bg-white border border-stone-200 rounded-xl p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <span class="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest rounded-full border border-teal-100 mb-3">Current Plan</span>
                <h2 class="text-3xl font-serif font-bold mb-2 text-stone-900">Novice</h2>
                <p class="text-stone-500 max-w-lg text-sm">You are on the free tier. Great for getting started.</p>
            </div>
            <div class="text-right">
                <div class="text-4xl font-bold font-mono text-stone-900">0<span class="text-stone-400 text-xl font-sans font-normal"> /mo</span></div>
                <div class="text-stone-400 text-xs mt-1">Next billing: Never</div>
            </div>
        </div>
        
        <!-- Decoration -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
    </div>

    <!-- Pricing Table -->
    <div class="pt-8 border-t border-stone-200">
        <h3 class="text-xl font-bold text-stone-900 mb-6 font-serif">Choisissez votre plume. Écrivez votre légende.</h3>
        <PricingTable />
    </div>
  </div>
</template>

<script setup lang="ts">
import PricingTable from '../components/marketing/PricingTable.vue';
</script>
