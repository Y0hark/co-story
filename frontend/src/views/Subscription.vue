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
                <span 
                    class="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border mb-3"
                    :class="currentTier.color"
                >
                    Current Plan
                </span>
                <h2 class="text-3xl font-serif font-bold mb-2 text-stone-900 capitalize">{{ currentTier.name }}</h2>
                <p class="text-stone-500 max-w-lg text-sm">
                    {{ currentTier.name === 'Novice' ? 'You are on the free tier. Great for getting started.' : 'You have unlocked premium features.' }}
                </p>
            </div>
            <div class="text-right">
                <div class="text-4xl font-bold font-mono text-stone-900">{{ currentTier.price }}<span class="text-stone-400 text-xl font-sans font-normal"> /mo</span></div>
                <div class="text-stone-400 text-xs mt-1">Next billing: {{ nextBillingDate }}</div>
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
import { ref, onMounted, computed } from 'vue';
import PricingTable from '../components/marketing/PricingTable.vue';

// Mock User ID (should be from auth store)
const USER_ID = '11111111-1111-1111-1111-111111111111';

const stats = ref<any>(null);
const loading = ref(true);

const currentTier = computed(() => {
    const tier = stats.value?.subscription?.tier || 'free';
    
    switch (tier) {
        case 'scribe':
            return { name: 'Scribe', price: '9.99', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
        case 'storyteller':
            return { name: 'Storyteller', price: '19.99', color: 'text-indigo-700 bg-indigo-50 border-indigo-100' };
        case 'architect':
            return { name: 'Architect', price: '49.99', color: 'text-purple-700 bg-purple-50 border-purple-100' };
        default:
            return { name: 'Novice', price: '0', color: 'text-stone-600 bg-stone-100 border-stone-200' };
    }
});

const nextBillingDate = computed(() => {
   if (!stats.value?.subscription?.daysUntilReset) return 'Never';
   const d = new Date();
   d.setDate(d.getDate() + stats.value.subscription.daysUntilReset);
   return d.toLocaleDateString();
});

onMounted(async () => {
    try {
        const res = await fetch(`http://localhost:3001/api/users/${USER_ID}/stats`);
        if (res.ok) {
            stats.value = await res.json();
        }
    } catch (e) {
        console.error("Failed to fetch subscription stats", e);
    } finally {
        loading.value = false;
    }
});
</script>
