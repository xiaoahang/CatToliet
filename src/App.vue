<template>
  <div class="relative" style="background-color: #0A0908;">
    <MouseTrail />
    <Header />
    <main>
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from './sections/Header.vue'
import Footer from './sections/Footer.vue'
import MouseTrail from './components/MouseTrail.vue'
</script>
