<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    <div 
      v-for="tier in tiers" 
      :key="tier.name"
      class="relative p-6 rounded-2xl border bg-white transition-all duration-300 flex flex-col"
      :class="[
        tier.highlight 
          ? 'border-indigo-200 shadow-xl shadow-indigo-100 md:scale-105 z-10' 
          : 'border-stone-200 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50'
      ]"
    >
      <!-- Badge -->
      <div v-if="tier.badge" class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-widest rounded-full shadow-sm">
        {{ tier.badge }}
      </div>

      <!-- Header -->
      <div class="mb-6 text-center">
        <!-- Icon logic: Simple dark/grey for normal, Indigo for highlight -->
        <div 
          class="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center transition-colors border border-stone-100"
          :class="tier.highlight ? 'bg-indigo-50 text-indigo-700' : 'bg-transparent text-stone-700'"
        >
          <component :is="tier.iconComponent" class="w-6 h-6" stroke-width="2" />
        </div>
        <h3 class="text-xl font-bold font-serif text-stone-900">{{ tier.name }}</h3>
        <p class="text-xs text-stone-500 font-medium uppercase tracking-wider mt-1" v-if="tier.subtitle">{{ tier.subtitle }}</p>
      </div>

      <!-- Price -->
      <div class="mb-6 text-center">
        <div class="flex items-baseline justify-center">
          <span class="text-3xl font-bold text-stone-900">{{ tier.price }}</span>
          <!-- Parse the period if it contains <small> -->
           <span v-if="tier.period" class="text-stone-500 ml-1 text-sm font-normal" v-html="tier.period"></span>
        </div>
        <p class="text-sm text-stone-600 mt-2 leading-relaxed px-2">
            {{ tier.description }}
        </p>
      </div>

      <!-- Features -->
      <div class="space-y-3 mb-8 flex-grow">
        <div v-for="(feature, idx) in tier.features" :key="idx" class="flex items-start gap-3 text-sm text-stone-600">
           <Check class="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
           <span class="leading-snug" v-html="feature"></span> <!-- Allow HTML in features for styling -->
        </div>
      </div>

      <!-- CTA -->
      <button 
        @click="handleSelectTier(tier)"
        class="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 shadow-sm border hover-sketch flex items-center justify-center gap-2"
        :class="[
            tier.highlight
                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                : 'bg-white text-stone-900 border-stone-200 hover:bg-stone-50 hover:text-stone-900 hover:border-stone-300',
            loadingTier === tier.name ? 'opacity-80 pointer-events-none' : ''
        ]"
        :disabled="loadingTier !== null"
      >
        <span v-if="loadingTier === tier.name" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        {{ loadingTier === tier.name ? 'Chargement...' : tier.cta }}
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Feather, Scroll, BookOpen, Crown, Check } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import axios from 'axios';

const authStore = useAuthStore();
const router = useRouter();
const loadingTier = ref<string | null>(null);

const tiers = [
  {
    name: "Novice", 
    id: "novice",
    priceId: null, // Free
    subtitle: "Page Blanche",
    price: "Gratuit",
    description: "L'étincelle initiale. Idéal pour découvrir la co-création sans risque.",
    features: [
      "✨ 1 Chapitre offert <small class='text-stone-400 block'>(~3 000 mots)</small>",
      "Lecture illimitée",
      "1 Catégorie de bibliothèque",
      "Auto-pilote <small class='text-stone-400'>(Meilleur modèle)</small>"
    ],
    cta: "Commencer l'aventure",
    highlight: false,
    iconComponent: Feather
  },
  {
    name: "Scribe",
    id: "scribe",
    priceId: "price_1SnKNH7uiRaz63ESwhD0EgQO", 
    subtitle: "La Plume Régulière",
    price: "6.99€",
    period: "<small class='text-stone-500'>/mois</small>",
    description: "Pour l'écrivain régulier qui souhaite bâtir son style et avancer ses projets.",
    features: [
      "✒️ 30 Chapitres / mois <small class='text-stone-400 block'>(~90 000 mots)</small>",
      "3 Catégories de bibliothèque",
      "Auto-pilote <small class='text-stone-400'>(Meilleur modèle)</small>"
    ],
    cta: "Devenir Scribe",
    highlight: false,
    iconComponent: Scroll
  },
  {
    name: "Storyteller",
    id: "storyteller",
    priceId: "price_1SnKNn7uiRaz63ESPeIERk7t",
    subtitle: "Le Maître Conteur",
    price: "9.99€",
    period: "<small class='text-stone-500'>/mois</small>",
    description: "Le choix des passionnés. Maîtrisez votre récit sans contraintes.",
    features: [
      "📖 100 Chapitres / mois <small class='text-stone-400 block'>(~300 000 mots)</small>",
      "♾️ Bibliothèque Illimitée",
      "Auto-pilote <small class='text-stone-400'>(Meilleur modèle)</small>",
      "🧠 Mentor Atlas (IA)",
      "🏆 Badge 'Featured Creator'"
    ],
    cta: "Rejoindre les Storytellers",
    highlight: true, 
    badge: "Le plus populaire",
    iconComponent: BookOpen
  },
  {
    name: "Architect",
    id: "architect",
    priceId: "price_1SnKOB7uiRaz63ESrUpiLHyh",
    subtitle: "Le Bâtisseur de Mondes",
    price: "19.99€",
    period: "<small class='text-stone-500'>/mois</small>",
    description: "Pour les créateurs prolifiques qui bâtissent des univers entiers.",
    features: [
      "🏛️ 300 Chapitres / mois <small class='text-stone-400 block'>(~900 000 mots)</small>",
      "♾️ Bibliothèque Illimitée",
      "Auto-pilote <small class='text-stone-400'>(Meilleur modèle)</small>",
      "🧠 Mentor Atlas (IA)",
      "👑 Badge 'Architecte'",
      "🚀 Accès Anticipé"
    ],
    cta: "Rejoindre les Bâtisseurs",
    highlight: false,
    iconComponent: Crown 
  }
]

const handleSelectTier = async (tier: any) => {
    if (!authStore.isAuthenticated) {
        router.push('/auth/register');
        return;
    }

    if (!tier.priceId) {
        // Free tier
        router.push('/app/dashboard');
        return;
    }

    loadingTier.value = tier.name;
    try {
        const response = await axios.post('http://localhost:3001/api/payments/create-checkout-session', 
            { priceId: tier.priceId },
            { headers: { Authorization: `Bearer ${authStore.token}` } }
        );
        
        if (response.data.url) {
            window.location.href = response.data.url;
        }
    } catch (error) {
        console.error('Checkout failed:', error);
        alert('Failed to start checkout'); // Simple alert for now
    } finally {
        loadingTier.value = null;
    }
}
</script>
