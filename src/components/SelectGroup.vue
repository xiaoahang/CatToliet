<template>
  <div>
    <h3 class="font-serif-cn text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 md:mb-3" style="color: #F5F0EB;">{{ label }}</h3>
    <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-3 gap-1.5 sm:gap-2">
      <button
        v-for="opt in options"
        :key="opt.value"
        @click="$emit('select', opt.value)"
        class="py-1.5 sm:py-2 px-1 sm:px-3 text-[10px] sm:text-xs font-sans-en rounded transition-all duration-300 active:scale-95 truncate"
        :style="activeButtonStyle(active === opt.value)"
        :title="opt.label"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { activeButtonStyle } from '../config/ui'

defineProps<{
  label: string
  options: { value: string; label: string }[]
  active: string
}>()

defineEmits<{
  select: [value: string]
}>()
</script>
