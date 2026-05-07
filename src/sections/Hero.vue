<template>
  <section
    id="hero"
    class="relative min-h-screen flex items-center justify-center overflow-hidden"
    style="background-color: #0A0908;"
  >
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse at 50% 40%, rgba(184,115,51,0.06) 0%, transparent 60%);"
    />
    <div class="relative z-10 text-center px-6 max-w-4xl mx-auto">
      <p
        class="font-sans-en text-xs md:text-sm tracking-[0.3em] uppercase mb-6"
        style="color: #B87333;"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 800, delay: 200 } }"
      >
        Custom Aluminum Cat Cabinet
      </p>
      <h1
        class="font-serif-cn text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-wide"
        style="color: #F5F0EB;"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 1000, delay: 400 } }"
      >
        铝型材定制猫砂柜
      </h1>
      <p
        class="mt-6 text-base md:text-lg font-sans-en font-light"
        style="color: #8A8580;"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 800, delay: 800 } }"
      >
        根据您的空间与需求，定制专属猫砂柜
      </p>
      <div
        class="mx-auto mt-8"
        style="height: 1px; background-color: #B87333;"
        v-motion
        :initial="{ width: 0 }"
        :enter="{ width: 60, transition: { duration: 1200, delay: 1000 } }"
      />
      <button
        @click="scrollToConfigurator"
        class="mt-12 px-8 py-3 text-sm font-sans-en font-medium tracking-wide rounded-sm transition-all duration-300 hover:scale-105"
        style="background-color: transparent; border: 1px solid #B87333; color: #F5F0EB;"
        @mouseenter="e => (e.target as HTMLElement).style.backgroundColor = '#B87333'"
        @mouseleave="e => (e.target as HTMLElement).style.backgroundColor = 'transparent'"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 800, delay: 1200 } }"
      >
        开始定制
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const scrollToConfigurator = () => {
  document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' })
}
</script>
