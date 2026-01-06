<template>
  <div class="max-w-3xl mx-auto px-4 md:px-6 pt-6 md:pt-12 pb-32" :class="fontFamily">
    <div v-if="loading" class="flex items-center justify-center p-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
    </div>

    <div v-else-if="!story || !chapters.length" class="text-center p-10 md:p-20 text-stone-500">
        <p>This story has no published chapters yet.</p>
        <button class="mt-4 text-teal-600 underline" @click="$router.push('/app/community')">Back to Community</button>
    </div>

    <div v-else>
        <!-- Navigation / Header -->
        <div class="mb-8 md:mb-12 flex items-center justify-between text-stone-500 text-sm relative">
            <button class="hover:text-stone-800 flex items-center gap-2 transition-colors p-2 -ml-2 rounded-lg active:bg-stone-100" @click="$router.push('/app/community')">
                <ArrowLeft class="w-5 h-5 md:w-4 md:h-4" /> <span class="hidden md:inline">Back</span>
            </button>
            <div class="flex items-center gap-2 md:gap-4">
                <!-- Chapter Menu -->
                <div class="relative">
                    <button @click="showChapterMenu = !showChapterMenu" class="hover:text-teal-600 transition-colors flex items-center gap-2 p-2 rounded-lg active:bg-stone-100" title="Table of Contents">
                        <List class="w-5 h-5 md:w-4 md:h-4" /> <span class="text-xs md:text-sm font-medium">Chapters</span>
                    </button>
                    <!-- Mobile: Full Screen / Bottom Sheet style approx -->
                    <div v-if="showChapterMenu" class="absolute top-10 right-0 w-[calc(100vw-2rem)] md:w-72 bg-white shadow-xl rounded-xl border border-stone-100 z-50 py-2 max-h-[60vh] overflow-y-auto">
                        <button 
                            v-for="(chapter, idx) in chapters" 
                            :key="chapter.id"
                            @click="itemsJumpTo(idx)"
                            class="w-full text-left px-4 py-3 md:py-2 hover:bg-stone-50 text-sm flex items-center justify-between group border-b border-stone-50 last:border-0"
                            :class="{'text-teal-700 font-medium bg-teal-50/50': idx === currentChapterIndex}"
                        >
                            <span class="truncate flex items-center gap-3">
                                <Check v-if="chapter.is_read" class="w-4 h-4 text-teal-500" />
                                <span v-else class="w-4 h-4 block"></span> <!-- Spacer -->
                                <span class="truncate max-w-[180px]">{{ idx + 1 }}. {{ chapter.title || 'Untitled' }}</span>
                            </span>
                            <span class="text-xs text-stone-400 group-hover:text-stone-500 whitespace-nowrap ml-2">{{ estimateTime(chapter.word_count) }}</span>
                        </button>
                    </div>
                </div>

                <!-- Settings -->
                <div class="relative">
                     <button @click="showSettings = !showSettings" class="hover:text-stone-800 transition-colors p-2 rounded-lg active:bg-stone-100" title="Settings">
                        <Settings class="w-5 h-5 md:w-4 md:h-4" />
                    </button>
                    <div v-if="showSettings" class="absolute top-10 right-0 w-[calc(100vw-2rem)] md:w-72 bg-white shadow-xl rounded-xl border border-stone-100 z-50 p-4 space-y-4">
                        <div>
                            <p class="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Typography</p>
                            <div class="flex bg-stone-100 rounded-lg p-1">
                                <button @click="setFont('font-sans')" class="flex-1 py-2 md:py-1 text-sm rounded-md transition-all" :class="fontFamily === 'font-sans' ? 'bg-white shadow-sm text-teal-700 font-medium' : 'text-stone-500 hover:text-stone-700'">Sans</button>
                                <button @click="setFont('font-serif')" class="flex-1 py-2 md:py-1 text-sm rounded-md transition-all font-serif" :class="fontFamily === 'font-serif' ? 'bg-white shadow-sm text-teal-700 font-medium' : 'text-stone-500 hover:text-stone-700'">Serif</button>
                                <button @click="setFont('font-mono')" class="flex-1 py-2 md:py-1 text-sm rounded-md transition-all font-mono" :class="fontFamily === 'font-mono' ? 'bg-white shadow-sm text-teal-700 font-medium' : 'text-stone-500 hover:text-stone-700'">Mono</button>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Size</p>
                            <div class="flex items-center justify-between gap-2 bg-stone-100 rounded-lg p-1">
                                <button @click="decreaseSize" class="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all" :disabled="fontSize === 'text-sm'"><Minus class="w-5 h-5" /></button>
                                <span class="text-sm font-medium text-stone-600">{{ fontSizeLabel }}</span>
                                <button @click="increaseSize" class="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all" :disabled="fontSize === 'text-2xl'"><Plus class="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>
                    <!-- Overlay to close -->
                    <div v-if="showSettings" @click="showSettings = false" class="fixed inset-0 z-40" style="background: transparent;"></div>
                    <div v-if="showChapterMenu" @click="showChapterMenu = false" class="fixed inset-0 z-40" style="background: transparent;"></div>
                </div>
            </div>
        </div>

        <!-- Story Header -->
        <header class="text-center mb-10 md:mb-16 space-y-4">
            <div class="flex justify-center gap-2 mb-4">
                <span v-if="story.mode || story.genre" class="inline-block px-3 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-[10px] md:text-xs tracking-wider uppercase font-medium">
                    {{ story.genre || story.mode || 'Fiction' }}
                </span>
            </div>
            <h1 class="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight leading-tight px-4">{{ story.title }}</h1>
            <p class="text-stone-500 italic">
                <span v-if="currentChapter.title" class="block text-base md:text-lg mt-2 text-stone-400 not-italic sans-serif">{{ currentChapter.title }}</span>
            </p>
            
            <div class="flex items-center justify-center gap-6 mt-6">
                 <!-- Story Like Button -->
                <button @click="toggleStoryLike" class="flex items-center gap-2 text-sm font-medium transition-colors" :class="story.is_liked ? 'text-rose-500' : 'text-stone-400 hover:text-rose-500'">
                    <Heart class="w-5 h-5" :fill="story.is_liked ? 'currentColor' : 'none'" />
                    <span>{{ story.likes_count }}</span>
                </button>
                <div class="h-4 w-px bg-stone-300"></div>
                <div class="flex items-center gap-2 text-xs text-stone-400 uppercase tracking-wider font-medium">
                    <span>{{ readingStats.chapterTime }} min read</span>
                </div>
            </div>
        </header>

        <!-- Chapter Content -->
        <article class="prose prose-stone prose-lg md:prose-xl mx-auto leading-loose transition-all duration-300 px-1" :class="[fontSize, fontFamily === 'font-mono' ? 'max-w-4xl' : 'max-w-2xl']">
            <p 
                v-for="(paragraph, index) in formattedContent" 
                :key="index"
                class="mb-6 indent-6 md:indent-8 text-justify md:text-left"
                :class="{
                    'first-letter:text-4xl md:first-letter:text-5xl first-letter:float-left first-letter:mr-2 md:first-letter:mr-3 first-letter:text-teal-700 first-letter:font-bold': index === 0
                }"
                v-html="paragraph"
            >
            </p>
        </article>

        <!-- Footer / Next Chapter -->
        <div class="mt-12 md:mt-20 pt-8 md:pt-12 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 relative">
            <div class="flex items-center justify-between w-full md:w-auto order-2 md:order-1">
                 <button 
                    v-if="currentChapterIndex > 0"
                    @click="prevChapter"
                    class="w-full md:w-auto justify-center px-5 py-2.5 md:px-6 md:py-3 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 font-medium transition-all flex items-center gap-2 text-sm md:text-base"
                >
                    <ArrowLeft class="w-4 h-4" /> Previous
                </button>
                <div v-else class="hidden md:block"></div>
            </div>
           

            <div class="flex flex-col items-center gap-2 text-sm text-stone-500 font-medium text-center order-1 md:order-2">
                 <!-- Chapter Like Button -->
                <button @click="toggleChapterLike" class="flex items-center gap-1.5 transition-colors p-2" :class="currentChapter.is_liked ? 'text-rose-500' : 'text-stone-400 hover:text-rose-500'" title="Like this chapter">
                    <Heart class="w-5 h-5 md:w-4 md:h-4" :fill="currentChapter.is_liked ? 'currentColor' : 'none'" />
                    <span v-if="parseInt(currentChapter.likes_count) > 0" class="text-xs">{{ currentChapter.likes_count }}</span>
                </button>
                
                <div class="mb-1">Chapter {{ currentChapterIndex + 1 }} of {{ chapters.length }}</div>
            </div>

            <div class="flex items-center justify-end w-full md:w-auto order-3">
                <button 
                    v-if="currentChapterIndex < chapters.length - 1"
                    @click="nextChapter"
                    class="w-full md:w-auto px-6 py-3 bg-stone-900 text-stone-50 rounded-lg hover:bg-stone-800 font-medium transition-all flex items-center justify-center gap-2 group shadow-lg shadow-stone-900/10 text-sm md:text-base"
                >
                    Next Chapter <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                 <button 
                    v-else
                    @click="finishStory"
                    class="w-full md:w-auto px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20 text-sm md:text-base"
                >
                    Finish Story
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Settings, List, Minus, Plus, Heart, Check } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const USER_ID = '11111111-1111-1111-1111-111111111111' // Development user

const story = ref<any>(null)
const chapters = ref<any[]>([])
const currentChapterIndex = ref(0)
const loading = ref(true)
const storyId = route.params.id as string

// ... Settings logic (loadSettings, saveSettings, setFont, increaseSize, decreaseSize) ...
// (Keeping previous settings logic but re-implementing briefly for context or assuming it's merged if I don't replace everything. I am replacing everything.)
const showSettings = ref(false)
const showChapterMenu = ref(false)
const fontFamily = ref('font-serif')
const fontSize = ref('text-xl')

const loadSettings = () => {
    const saved = localStorage.getItem('co_story_reader_settings')
    if (saved) {
        const parsed = JSON.parse(saved)
        fontFamily.value = parsed.fontFamily || 'font-serif'
        fontSize.value = parsed.fontSize || 'text-xl'
    }
}
const saveSettings = () => {
    localStorage.setItem('co_story_reader_settings', JSON.stringify({
        fontFamily: fontFamily.value,
        fontSize: fontSize.value
    }))
}
const setFont = (font: string) => { fontFamily.value = font; saveSettings(); }
const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl']
const fontSizeLabel = computed(() => {
    const labels: Record<string, string> = { 'text-sm': 'Small', 'text-base': 'Medium', 'text-lg': 'Large', 'text-xl': 'X-Large', 'text-2xl': 'Huge' }
    return labels[fontSize.value] || 'Medium'
})
const increaseSize = () => {
    const idx = sizes.indexOf(fontSize.value)
    if (idx < sizes.length - 1) { fontSize.value = sizes[idx + 1]; saveSettings(); }
}
const decreaseSize = () => {
    const idx = sizes.indexOf(fontSize.value)
    if (idx > 0) { fontSize.value = sizes[idx - 1]; saveSettings(); }
}

// ... Stats logic ...
const WPM = 250
const countWords = (text: string) => text ? text.trim().split(/\s+/).length : 0
const estimateTime = (words: number) => Math.ceil(words / WPM) + ' min'

const currentChapter = computed(() => {
    if (!chapters.value.length) return null
    return chapters.value[currentChapterIndex.value]
})

const readingStats = computed(() => {
    if (!currentChapter.value) return { chapterTime: 0, words: 0, storyTimeLeft: 0 }
    
    // Chapter Stats
    const chapterWords = currentChapter.value.word_count || countWords(currentChapter.value.content)
    const chapterTime = Math.ceil(chapterWords / WPM)

    // Story Stats (Remaining)
    let wordsLeft = 0
    if (chapters.value.length) {
        for (let i = currentChapterIndex.value; i < chapters.value.length; i++) {
             wordsLeft += chapters.value[i].word_count || 0
        }
    }
    const storyTimeLeft = Math.ceil(wordsLeft / WPM)
    return { chapterTime, words: chapterWords, storyTimeLeft }
})


// Api Actions
const toggleStoryLike = async () => {
    if (!story.value) return;
    try {
        const res = await fetch(`http://localhost:3001/api/likes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID, resourceId: story.value.id, resourceType: 'story' })
        });
        const data = await res.json();
        story.value.is_liked = data.liked;
        story.value.likes_count = data.count;
    } catch (e) { console.error(e) }
}

const toggleChapterLike = async () => {
    if (!currentChapter.value) return;
    try {
        const res = await fetch(`http://localhost:3001/api/likes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID, resourceId: currentChapter.value.id, resourceType: 'chapter' })
        });
        const data = await res.json();
        currentChapter.value.is_liked = data.liked;
        currentChapter.value.likes_count = data.count; // Assuming API returns generic 'count'
    } catch (e) { console.error(e) }
}

const saveProgress = async (chapterIndex: number) => {
    const chap = chapters.value[chapterIndex];
    if (!chap) return;
    
    // Optimistic update (for UI)
    // Mark previous chapters as read in UI
    for (let i = 0; i <= chapterIndex; i++) {
         if (!chapters.value[i].is_read) chapters.value[i].is_read = true;
    }

    try {
        await fetch(`http://localhost:3001/api/progress/chapter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID, chapterId: chap.id, storyId: storyId })
        });
    } catch (e) {
        console.error("Failed to save progress", e);
    }
}


const nextChapter = async () => {
    if (currentChapterIndex.value < chapters.value.length - 1) {
        // Mark current as read before moving
        await saveProgress(currentChapterIndex.value + 1); // Pass next index? No, strictly logic: we finished current, so mark up to current? Or wait, user requests "store latest read chapter... considered before ones as read".
        // If I move to Ch 2, Ch 1 is read.
        // So I should save progress for the TARGET chapter? Or the one I just finished?
        // Usually, opening a chapter marks it as "being read" or "reached".
        // Use "reached" logic. If I open Ch 2, Ch 1 is finished.
        // The API `progress/chapter` marks "chapterId and ancestors".
        // So if I call it for Ch 2 (newly opened), it marks 1 and 2 as read?
        // Let's assume "Read" means "Completed" or "Reached".
        // If I jump to Ch 5, I assume 1-4 are read. Ch 5 is "current".
        // Let's call saveProgress for the NEW chapter index.
        currentChapterIndex.value++;
        
        // Save progress for the NEW chapter (marking it and previous as 'read/reached')
        saveProgress(currentChapterIndex.value); 
        window.scrollTo(0, 0);
    }
}



const prevChapter = () => {
    if (currentChapterIndex.value > 0) {
        currentChapterIndex.value--
        window.scrollTo(0, 0)
    }
}

const itemsJumpTo = (index: number) => {
    currentChapterIndex.value = index
    showChapterMenu.value = false
    saveProgress(index);
    window.scrollTo(0, 0)
}

const finishStory = async () => {
    await saveProgress(currentChapterIndex.value);
    router.push('/app/community');
}

const formattedContent = computed(() => {
    if (!currentChapter.value?.content) return []
    return currentChapter.value.content.split('\n').filter((p: string) => p.trim())
})

// Fetch Data
const fetchData = async () => {
    try {
        loading.value = true
        loadSettings()

        // 1. Fetch Story
        const storyRes = await fetch(`http://localhost:3001/api/stories/${storyId}?userId=${USER_ID}`)
        if (storyRes.ok) story.value = await storyRes.json()

        // 2. Fetch Chapters
        const chaptersRes = await fetch(`http://localhost:3001/api/chapters/story/${storyId}?userId=${USER_ID}`)
        if (chaptersRes.ok) {
            const allChapters = await chaptersRes.json()
            chapters.value = allChapters.filter((c: any) => c.status === 'published')
        }
        
        // 3. Resume Progress based on Backend Data
        // Find the first chapter that is NOT read? Or the LAST chapter that IS read?
        // "Store latest read chapter".
        // If 1,2,3 are read, I probably want to resume at 4 (if exists) or 3 (if re-reading).
        // Common pattern: Resume at (Last Read Index); or if completed, stay at end.
        // Let's find the highest index with `is_read`.
        if (chapters.value.length > 0) {
            // Check if any read
            const readIndices = chapters.value.map((c, i) => c.is_read ? i : -1).filter(i => i !== -1);
            if (readIndices.length > 0) {
                const maxRead = Math.max(...readIndices);
                // If there is a next chapter, go there? Or verify user intent? 
                // Usually "Resume" takes you to the *next* unread chapter.
                if (maxRead < chapters.value.length - 1) {
                    currentChapterIndex.value = maxRead + 1;
                } else {
                    currentChapterIndex.value = maxRead; // Finished, stay at end
                }
            } else {
                 currentChapterIndex.value = 0;
            }
        }
        
    } catch (e) {
        console.error("Failed to load reader data", e)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped>
/* Typography improvements for reading experience */
article {
    max-width: 65ch;
}
</style>
