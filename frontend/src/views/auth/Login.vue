<template>
  <div class="min-h-screen flex items-center justify-center bg-charcoal-900 px-4">
    <div class="w-full max-w-md bg-charcoal-800 border border-charcoal-700 rounded-2xl shadow-xl p-8 animate-fade-in-up">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-serif font-bold text-teal-400 mb-2">Welcome Back</h1>
        <p class="text-zinc-400">Continue your story.</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div v-if="error" class="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium text-zinc-300 mb-2">Email</label>
          <input 
            v-model="email" 
            type="email" 
            class="w-full bg-charcoal-900 border border-charcoal-600 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
            placeholder="you@example.com"
            required
          >
        </div>

        <div>
           <label class="block text-sm font-medium text-zinc-300 mb-2">Password</label>
           <input 
             v-model="password" 
             type="password" 
             class="w-full bg-charcoal-900 border border-charcoal-600 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
             required
           >
        </div>

        <button 
          type="submit" 
          class="w-full bg-teal-500 hover:bg-teal-400 text-charcoal-900 font-bold py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-teal-500/20"
          :disabled="loading"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="mt-8 text-center text-zinc-500 text-sm">
        Don't have an account? 
        <router-link to="/auth/register" class="text-teal-400 hover:text-teal-300 font-medium">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
    loading.value = true;
    try {
        await authStore.login({ email: email.value, password: password.value });
        await authStore.login({ email: email.value, password: password.value });
        router.push('/app'); // Redirect to main app
    } catch (err: any) {
        console.error(err);
        error.value = err.response?.data?.error || 'Invalid credentials';
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
