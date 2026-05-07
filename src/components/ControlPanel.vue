<template>
  <div class="p-3 sm:p-4 md:p-6 rounded-lg space-y-3 sm:space-y-4 md:space-y-6" style="background-color: rgba(245,240,235,0.02); border: 1px solid rgba(245,240,235,0.06);">
    <!-- Dimensions -->
    <div>
      <h3 class="font-serif-cn text-xs sm:text-sm font-semibold mb-2 sm:mb-3 md:mb-4" style="color: #F5F0EB;">尺寸参数</h3>
      <div class="space-y-2 sm:space-y-3 md:space-y-4">
        <div v-for="dim in DIMENSIONS" :key="dim.key">
          <div class="flex justify-between mb-1 sm:mb-1.5 md:mb-2">
            <label class="text-[10px] sm:text-xs" style="color: #8A8580;">{{ dim.label }}</label>
            <span class="text-[10px] sm:text-xs font-sans-en tabular-nums" style="color: #B87333;">{{ config[dim.key] }}mm</span>
          </div>
          <input
            type="range"
            :min="dim.min"
            :max="dim.max"
            step="10"
            :value="config[dim.key]"
            @input="e => onUpdate(dim.key, Number((e.target as HTMLInputElement).value))"
            class="w-full rounded-full appearance-none cursor-pointer"
            style="height: 8px;"
            :style="{ background: sliderBg(config[dim.key as keyof CabinetConfig] as number, dim.min, dim.max) }"
          />
        </div>
      </div>
    </div>

    <div class="divider" />

    <!-- Profile -->
    <SelectGroup label="型材规格" :options="PROFILES.map(p => ({ value: p, label: p }))" :active="config.profile" @select="v => onUpdate('profile', v)" />
    <ProfileCrossSection :profile="config.profile" />

    <div class="divider" />

    <!-- Shelves（内部层板 — 移到板材材质上方） -->
    <ToggleRow label="内部层板" :active="config.hasShelf" @toggle="onUpdate('hasShelf', !config.hasShelf)">
      <div v-if="config.hasShelf">
        <div class="flex justify-between mb-1 sm:mb-1.5 md:mb-2">
          <label class="text-[10px] sm:text-xs" style="color: #8A8580;">层板数量（金属网·交错半宽）</label>
          <span class="text-[10px] sm:text-xs font-sans-en tabular-nums" style="color: #B87333;">{{ config.shelfCount }}层</span>
        </div>
        <input
          type="range"
          min="1"
          max="4"
          step="1"
          :value="config.shelfCount"
          @input="e => onUpdate('shelfCount', Number((e.target as HTMLInputElement).value))"
          class="w-full rounded-full appearance-none cursor-pointer"
          style="height: 8px;"
          :style="{ background: shelfSliderBg(config.shelfCount) }"
        />
        <p class="text-[9px] sm:text-[10px] mt-1" style="color: #8A8580;">金属网漏砂板，半宽交替左右分布</p>
      </div>
    </ToggleRow>

    <div class="divider" />

    <!-- Panel material（板材材质 — 在层板下方） -->
    <SelectGroup label="板材材质" :options="PANEL_MATERIALS" :active="config.panelMaterial" @select="v => onUpdate('panelMaterial', v)" />

    <div class="divider" />

    <!-- Top panel -->
    <SelectGroup label="顶板材质" :options="TOP_PANEL_TYPES" :active="config.topPanelType" @select="v => onUpdate('topPanelType', v)" />

    <div class="divider" />

    <!-- Color -->
    <div>
      <h3 class="font-serif-cn text-xs sm:text-sm font-semibold mb-2 sm:mb-3" style="color: #F5F0EB;">型材颜色</h3>
      <div class="flex gap-2 sm:gap-3">
        <button
          v-for="c in COLORS"
          :key="c.value"
          @click="onUpdate('color', c.value)"
          class="flex flex-col items-center gap-1 transition-all duration-300"
          :title="c.label"
        >
          <div
            class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full transition-all duration-300"
            :style="{
              backgroundColor: c.color,
              border: `2px solid ${config.color === c.value ? '#B87333' : 'rgba(245,240,235,0.15)'}`,
              boxShadow: config.color === c.value ? '0 0 0 2px rgba(184,115,51,0.3)' : 'none',
              transform: config.color === c.value ? 'scale(1.1)' : 'scale(1)',
            }"
          />
          <span class="text-[9px] sm:text-[10px]" :style="{ color: config.color === c.value ? '#F5F0EB' : '#8A8580' }">{{ c.label }}</span>
        </button>
      </div>
    </div>

    <div class="divider" />

    <!-- Wheels -->
    <ToggleRow label="底部万向轮" :active="config.hasWheels" @toggle="onUpdate('hasWheels', !config.hasWheels)">
      <p class="text-[9px] sm:text-[10px]" style="color: #8A8580;">万向轮直接连接型材立柱底部（2带刹车+2不带）</p>
    </ToggleRow>

    <!-- Summary -->
    <div class="p-2.5 sm:p-3 md:p-4 rounded-lg" style="background-color: rgba(184,115,51,0.08); border: 1px solid rgba(184,115,51,0.2);">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-[10px] sm:text-xs" style="color: #8A8580;">预估重量</p>
          <p class="text-xs sm:text-sm font-sans-en font-semibold tabular-nums" style="color: #F5F0EB;">{{ totalWeight }} kg</p>
        </div>
        <div class="text-right">
          <p class="text-[10px] sm:text-xs" style="color: #8A8580;">预估价格</p>
          <p class="text-base sm:text-lg md:text-xl font-sans-en font-bold tabular-nums" style="color: #B87333;">¥{{ totalPrice.toFixed(2) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CabinetConfig } from '../types/cabinet'
import { DIMENSIONS, PROFILES, PANEL_MATERIALS, TOP_PANEL_TYPES, COLORS, sliderBg, shelfSliderBg } from '../config/ui'
import SelectGroup from './SelectGroup.vue'
import ToggleRow from './ToggleRow.vue'
import ProfileCrossSection from './ProfileCrossSection.vue'

defineProps<{
  config: CabinetConfig
  totalPrice: number
  totalWeight: number
}>()

const emit = defineEmits<{
  update: [key: keyof CabinetConfig, value: any]
}>()

const onUpdate = (key: keyof CabinetConfig, value: any) => {
  emit('update', key, value)
}
</script>

<style scoped>
.divider { height: 1px; background-color: rgba(245,240,235,0.06); }
.tabular-nums { font-variant-numeric: tabular-nums; }
</style>
