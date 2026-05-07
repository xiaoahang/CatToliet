<template>
  <header
    class="fixed top-0 left-0 w-full z-50 transition-all duration-500"
    :style="headerStyle"
  >
    <div class="max-w-7xl mx-auto px-4 md:px-10 h-14 md:h-20 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-2 md:gap-3">
        <div class="w-7 h-7 md:w-8 md:h-8 rounded-sm flex items-center justify-center" style="background-color: #B87333;">
          <span class="font-serif-cn text-xs md:text-sm font-bold" style="color: #0A0908;">铝</span>
        </div>
        <span class="font-serif-cn text-base md:text-lg font-semibold tracking-wide" style="color: #F5F0EB;">
          猫砂柜工坊
        </span>
      </div>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-8">
        <button
          @click="scrollTo('configurator')"
          class="text-sm transition-colors duration-300 hover:text-[#F5F0EB] tracking-wide"
          style="color: #8A8580;"
        >
          定制设计
        </button>
      </nav>

      <!-- Mobile hamburger + CTA -->
      <div class="flex items-center gap-2">
        <button
          @click="scrollTo('configurator')"
          class="px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-sans-en font-medium rounded-sm transition-all duration-300 hover:scale-105"
          style="background-color: #B87333; color: #F5F0EB;"
        >
          <span class="hidden md:inline">开始定制</span>
          <span class="md:hidden">定制</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)

const headerStyle = computed(() => ({
  backgroundColor: scrolled.value ? 'rgba(10,9,8,0.9)' : 'transparent',
  backdropFilter: scrolled.value ? 'blur(12px)' : 'none',
  borderBottom: scrolled.value ? '1px solid rgba(245,240,235,0.06)' : '1px solid transparent',
}))

const onScroll = () => { scrolled.value = window.scrollY > 80 }

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>
