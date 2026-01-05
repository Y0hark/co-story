<template>
  <div class="max-w-3xl mx-auto px-6 py-12">
    <!-- Navigation / Header -->
    <div class="mb-12 flex items-center justify-between text-stone-500 text-sm">
        <button class="hover:text-stone-800 flex items-center gap-2 transition-colors" @click="$router.push('/app/community')">
            <ArrowLeft class="w-4 h-4" /> Back to Community
        </button>
        <div class="flex items-center gap-4">
            <button class="hover:text-teal-600 transition-colors" title="Bookmark">
                <Bookmark class="w-4 h-4" />
            </button>
             <button class="hover:text-stone-800 transition-colors" title="Settings">
                <Settings class="w-4 h-4" />
            </button>
        </div>
    </div>

    <!-- Story Header -->
    <header class="text-center mb-16 space-y-4">
        <span class="inline-block px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-xs tracking-wider uppercase font-medium">Sci-Fi</span>
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">The Clockwork Heart</h1>
        <p class="text-stone-500 font-serif italic">by <span class="text-stone-800 font-medium not-italic">Alice V.</span></p>
    </header>

    <!-- Chapter Content -->
    <article class="prose prose-lg prose-stone mx-auto font-serif leading-loose">
        <p class="first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:text-teal-700 first-letter:font-bold">
            The gears didn't just grind; they sang. That was the first thing Elias noticed about the machine. In the oppressive silence of the under-city, where the steam pipes hissed like dying snakes and the fog tasted of coal and regret, the melodic humming was an anomaly.
        </p>
        <p>
            He wiped the grease from his goggles, adjusting the magnification lenses. "Impossible," he whispered, his breath clouding in the frigid air. The artifact sat upon the workbench, a complex dodecahedron of brass and crystal, pulsing with a faint, rhythmic blue light.
        </p>
        <p>
            It shouldn't be active. The primary valve was shattered, the ethereal conduit severed. By all mechanical laws known to the Guild of Artificers, this thing should be dead cold metal. Yet, it beat. *Thump-thump. Thump-thump.* A heartbeat of pure energy.
        </p>
        <p>
            Elias reached out, his gloved fingers trembling slightly. He wasn't afraid of the machine—he'd built engines that could crush a man in seconds—but this was different. This felt... alive. As his fingertips brushed the cold brass surface, the humming spiked in pitch, a harmonious chord that seemed to resonate in his very bones.
        </p>
        <p>
            "Hello?" The voice didn't come from the room. It bloomed in his mind, clear as a bell, tasting of ozone and old paper.
        </p>
        <p>
            Elias stumbled back, knocking over a tray of spanners. The noise was deafening in the small workshop, but the voice remained, unperturbed.
        </p>
        <p>
            "Do not be alarmed, Maker. I have been waiting for you."
        </p>
    </article>

    <!-- Footer / Next Chapter -->
    <div class="mt-20 pt-12 border-t border-stone-200 flex justify-between items-center">
        <div class="text-sm text-stone-500 font-medium">
            Chapter 1 of 8
        </div>
        <button class="px-6 py-3 bg-stone-900 text-stone-50 rounded-lg hover:bg-stone-800 font-medium transition-all flex items-center gap-2 group shadow-lg shadow-stone-900/10">
            Next Chapter <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, Bookmark, Settings } from 'lucide-vue-next'
</script>

<style scoped>
/* Typography improvements for reading experience */
article {
    max-width: 65ch;
}
</style>
