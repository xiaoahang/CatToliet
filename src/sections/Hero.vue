<template>
  <section
    id="hero"
    class="relative min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden px-4"
    style="background-color: #0A0908;"
  >
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse at 50% 40%, rgba(184,115,51,0.06) 0%, transparent 60%);"
    />
    <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
      <p
        class="font-sans-en text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4 md:mb-6"
        style="color: #B87333;"
      >
        Custom Aluminum Cat Cabinet
      </p>
      <h1
        class="font-serif-cn text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-wide"
        style="color: #F5F0EB;"
      >
        铝型材定制猫砂柜
      </h1>
      <p
        class="mt-4 md:mt-6 text-sm md:text-lg font-sans-en font-light"
        style="color: #8A8580;"
      >
        根据您的空间与需求，定制专属猫砂柜
      </p>
      <div
        class="mx-auto mt-6 md:mt-8"
        style="height: 1px; background-color: #B87333; width: 60px;"
      />
      <button
        @click="scrollToConfigurator"
        class="mt-8 md:mt-12 px-6 py-2.5 md:px-8 md:py-3 text-sm font-sans-en font-medium tracking-wide rounded-sm transition-all duration-300 hover:scale-105 active:scale-95"
        style="background-color: transparent; border: 1px solid #B87333; color: #F5F0EB;"
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
