<template>
  <div class="min-h-screen flex items-center justify-center bg-stone-50 px-4">
    <div class="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-xl p-8 animate-fade-in-up md:p-10 relative overflow-hidden">
      <!-- Decorative background hint -->
      <div class="absolute top-0 right-0 p-16 bg-indigo-50/50 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none"></div>

      <div class="text-center mb-8 relative z-10">
        <h1 class="text-3xl font-serif font-bold text-stone-900 mb-2">Welcome Back</h1>
        <p class="text-stone-500 font-medium">Continue your story.</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6 relative z-10">
        <div v-if="error" class="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
          {{ error }}
        </div>

        <div>
          <label class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 ml-1">Email</label>
          <input 
            v-model="email" 
            type="email" 
            class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all hover:border-stone-300"
            placeholder="you@example.com"
            required
          >
        </div>

        <div>
           <label class="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 ml-1">Password</label>
           <input 
             v-model="password" 
             type="password" 
             class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all hover:border-stone-300"
             required
           >
        </div>

        <button 
          type="submit" 
          class="w-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold py-3.5 rounded-xl transition-all duration-300 transform active:scale-95 shadow-lg shadow-stone-900/10 hover-sketch flex items-center justify-center gap-2"
          :disabled="loading"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <!-- Divider -->
      <div class="flex items-center gap-4 my-6 relative z-10">
        <div class="h-px bg-stone-200 flex-1"></div>
        <span class="text-xs font-bold text-stone-400 uppercase tracking-widest">Or</span>
        <div class="h-px bg-stone-200 flex-1"></div>
      </div>

      <!-- Google Login Button -->
      <div class="flex justify-center relative z-10">
        <GoogleLogin :callback="handleGoogleLogin" />
      </div>

      <p class="mt-8 text-center text-stone-500 text-sm relative z-10">
        Don't have an account? 
        <router-link to="/auth/register" class="text-indigo-600 hover:text-indigo-800 font-bold hover:underline decoration-2 underline-offset-2">Sign up</router-link>
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
        router.push('/app/dashboard'); // Redirect to dashboard
    } catch (err: any) {
        console.error(err);
        error.value = err.response?.data?.error || 'Invalid credentials';
    } finally {
        loading.value = false;
    }
}

const handleGoogleLogin = async (response: any) => {
    loading.value = true;
    try {
        await authStore.googleLogin(response.credential);
        router.push('/app/dashboard');
    } catch (err: any) {
        console.error(err);
        error.value = 'Google sign-in failed';
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
