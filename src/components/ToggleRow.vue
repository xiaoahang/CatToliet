<template>
  <div>
    <div class="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
      <h3 class="font-serif-cn text-xs sm:text-sm font-semibold" style="color: #F5F0EB;">{{ label }}</h3>
      <button
        @click="$emit('toggle')"
        class="relative w-10 h-5 sm:w-11 sm:h-6 md:w-10 md:h-5 rounded-full transition-colors duration-300 active:scale-95 shrink-0"
        :style="{ backgroundColor: active ? '#B87333' : 'rgba(245,240,235,0.1)' }"
      >
        <div
          class="absolute top-0.5 w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 rounded-full bg-[#F5F0EB] transition-transform duration-300"
          :style="{ transform: active ? 'translateX(20px)' : 'translateX(2px)' }"
        />
      </button>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  active: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>
