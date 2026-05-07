<template>
  <div class="relative" style="background-color: #0A0908;">
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
</script>
