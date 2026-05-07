<template>
  <section id="configurator" class="relative py-24 md:py-32" style="background-color: #0A0908;">
    <div class="max-w-7xl mx-auto px-6 md:px-10">
      <!-- Section header -->
      <div class="text-center mb-16" v-intersect="{ once: true, margin: '-100px', onEnter: onHeaderEnter }">
        <p class="font-sans-en text-xs tracking-[0.3em] uppercase mb-4" style="color: #B87333;">
          Interactive Configurator
        </p>
        <h2 class="font-serif-cn text-3xl md:text-4xl font-bold tracking-wide" style="color: #F5F0EB;">
          定制设计器
        </h2>
        <div class="mx-auto mt-6" style="width: 40px; height: 1px; background-color: #B87333;" />
        <p class="mt-4 text-sm" style="color: #8A8580;">调整参数，实时预览您的专属猫砂柜</p>
      </div>

      <div class="grid lg:grid-cols-12 gap-8">
        <!-- Left panel - Controls -->
        <div class="lg:col-span-4 space-y-6">
          <div class="p-6 rounded-lg space-y-6" style="background-color: rgba(245,240,235,0.02); border: 1px solid rgba(245,240,235,0.06);">
            <!-- Dimensions -->
            <div>
              <h3 class="font-serif-cn text-sm font-semibold mb-4" style="color: #F5F0EB;">尺寸参数</h3>
              <div class="space-y-4">
                <div v-for="dim in dimensions" :key="dim.key">
                  <div class="flex justify-between mb-2">
                    <label class="text-xs" style="color: #8A8580;">{{ dim.label }}</label>
                    <span class="text-xs font-sans-en" style="color: #B87333;">{{ config[dim.key] }}mm</span>
                  </div>
                  <input
                    type="range"
                    :min="dim.min"
                    :max="dim.max"
                    step="10"
                    :value="config[dim.key]"
                    @input="e => updateConfig(dim.key, Number((e.target as HTMLInputElement).value))"
                    class="w-full rounded-full appearance-none cursor-pointer"
                    style="height: 6px;"
                    :style="{ background: `linear-gradient(to right, #B87333 0%, #B87333 ${((config[dim.key] - dim.min) / (dim.max - dim.min)) * 100}%, rgba(245,240,235,0.1) ${((config[dim.key] - dim.min) / (dim.max - dim.min)) * 100}%)` }"
                  />
                </div>
              </div>
            </div>

            <div style="height: 1px; background-color: rgba(245,240,235,0.06);" />

            <!-- Profile type -->
            <div>
              <h3 class="font-serif-cn text-sm font-semibold mb-3" style="color: #F5F0EB;">型材规格</h3>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="p in (['2020', '3030', '4040'] as const)"
                  :key="p"
                  @click="updateConfig('profile', p as '2020' | '3030' | '4040')"
                  class="py-2 px-3 text-xs font-sans-en rounded transition-all duration-300"
                  :style="buttonStyle(config.profile === p)"
                >
                  {{ p }}
                </button>
              </div>
            </div>

            <div style="height: 1px; background-color: rgba(245,240,235,0.06);" />

            <!-- Panel material -->
            <div>
              <h3 class="font-serif-cn text-sm font-semibold mb-3" style="color: #F5F0EB;">板材材质</h3>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="m in panelMaterials"
                  :key="m.value"
                  @click="updateConfig('panelMaterial', m.value)"
                  class="py-2 px-3 text-xs rounded transition-all duration-300"
                  :style="buttonStyle(config.panelMaterial === m.value)"
                >
                  {{ m.label }}
                </button>
              </div>
            </div>

            <div style="height: 1px; background-color: rgba(245,240,235,0.06);" />

            <!-- Top panel type -->
            <div>
              <h3 class="font-serif-cn text-sm font-semibold mb-3" style="color: #F5F0EB;">顶板材质</h3>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="t in topPanelTypes"
                  :key="t.value"
                  @click="updateConfig('topPanelType', t.value)"
                  class="py-2 px-3 text-xs rounded transition-all duration-300"
                  :style="buttonStyle(config.topPanelType === t.value)"
                >
                  {{ t.label }}
                </button>
              </div>
            </div>

            <div style="height: 1px; background-color: rgba(245,240,235,0.06);" />

            <!-- Color -->
            <div>
              <h3 class="font-serif-cn text-sm font-semibold mb-3" style="color: #F5F0EB;">型材颜色</h3>
              <div class="flex gap-3">
                <button
                  v-for="c in colors"
                  :key="c.value"
                  @click="updateConfig('color', c.value)"
                  class="flex flex-col items-center gap-1 transition-all duration-300"
                  :title="c.label"
                >
                  <div
                    class="w-8 h-8 rounded-full transition-all duration-300"
                    :style="{
                      backgroundColor: c.color,
                      border: `2px solid ${config.color === c.value ? '#B87333' : 'rgba(245,240,235,0.15)'}`,
                      boxShadow: config.color === c.value ? '0 0 0 2px rgba(184,115,51,0.3)' : 'none',
                      transform: config.color === c.value ? 'scale(1.1)' : 'scale(1)',
                    }"
                  />
                  <span class="text-[10px]" :style="{ color: config.color === c.value ? '#F5F0EB' : '#8A8580' }">
                    {{ c.label }}
                  </span>
                </button>
              </div>
            </div>

            <div style="height: 1px; background-color: rgba(245,240,235,0.06);" />

            <!-- Wheels -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-serif-cn text-sm font-semibold" style="color: #F5F0EB;">底部万向轮</h3>
                <button
                  @click="updateConfig('hasWheels', !config.hasWheels)"
                  class="relative w-10 h-5 rounded-full transition-colors duration-300"
                  :style="{ backgroundColor: config.hasWheels ? '#B87333' : 'rgba(245,240,235,0.1)' }"
                >
                  <div
                    class="absolute top-0.5 w-4 h-4 rounded-full bg-[#F5F0EB] transition-transform duration-300"
                    :style="{ transform: config.hasWheels ? 'translateX(20px)' : 'translateX(2px)' }"
                  />
                </button>
              </div>
              <p class="text-[10px]" style="color: #8A8580;">万向轮直接连接型材立柱底部（2个带刹车 + 2个不带）</p>
            </div>

            <div style="height: 1px; background-color: rgba(245,240,235,0.06);" />

            <!-- Shelves -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-serif-cn text-sm font-semibold" style="color: #F5F0EB;">内部层板</h3>
                <button
                  @click="updateConfig('hasShelf', !config.hasShelf)"
                  class="relative w-10 h-5 rounded-full transition-colors duration-300"
                  :style="{ backgroundColor: config.hasShelf ? '#B87333' : 'rgba(245,240,235,0.1)' }"
                >
                  <div
                    class="absolute top-0.5 w-4 h-4 rounded-full bg-[#F5F0EB] transition-transform duration-300"
                    :style="{ transform: config.hasShelf ? 'translateX(20px)' : 'translateX(2px)' }"
                  />
                </button>
              </div>
              <div v-if="config.hasShelf" class="overflow-hidden">
                <div class="flex justify-between mb-1">
                  <label class="text-xs" style="color: #8A8580;">层板数量（金属网·交错半宽）</label>
                  <span class="text-xs font-sans-en" style="color: #B87333;">{{ config.shelfCount }}层</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  :value="config.shelfCount"
                  @input="e => updateConfig('shelfCount', Number((e.target as HTMLInputElement).value))"
                  class="w-full rounded-full appearance-none cursor-pointer"
                  style="height: 6px;"
                  :style="{ background: `linear-gradient(to right, #B87333 0%, #B87333 ${(config.shelfCount / 4) * 100}%, rgba(245,240,235,0.1) ${(config.shelfCount / 4) * 100}%)` }"
                />
                <p class="text-[10px] mt-1" style="color: #8A8580;">金属网漏砂板，半宽交替左右分布</p>
              </div>
            </div>

            <!-- Summary -->
            <div class="p-4 rounded-lg" style="background-color: rgba(184,115,51,0.08); border: 1px solid rgba(184,115,51,0.2);">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-xs" style="color: #8A8580;">预估重量</p>
                  <p class="text-sm font-sans-en font-semibold" style="color: #F5F0EB;">{{ totalWeight }} kg</p>
                </div>
                <div class="text-right">
                  <p class="text-xs" style="color: #8A8580;">预估价格</p>
                  <p class="text-xl font-sans-en font-bold" style="color: #B87333;">¥{{ totalPrice.toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right panel - 3D Preview & Bill -->
        <div class="lg:col-span-8 space-y-6">
          <!-- 3D Preview -->
          <div class="rounded-lg overflow-hidden" style="height: 450px; background-color: rgba(245,240,235,0.02); border: 1px solid rgba(245,240,235,0.06);">
            <div class="flex items-center justify-between px-4 py-2 border-b" style="border-color: rgba(245,240,235,0.06);">
              <span class="text-xs" style="color: #8A8580;">3D 实时预览 · 上层拱门 + 底部开放</span>
              <span class="text-[10px] font-sans-en" style="color: #8A8580;">拖拽旋转 · 滚轮缩放</span>
            </div>
            <div ref="canvasContainer" style="height: calc(100% - 36px);">
              <canvas ref="threeCanvas" style="width: 100%; height: 100%; display: block;" />
            </div>
          </div>

          <!-- Bill of Materials -->
          <div class="rounded-lg overflow-hidden" style="background-color: rgba(245,240,235,0.02); border: 1px solid rgba(245,240,235,0.06);">
            <button @click="showBill = !showBill" class="w-full flex items-center justify-between px-6 py-4 transition-colors duration-300 hover:bg-[rgba(245,240,235,0.03)]">
              <div class="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#B87333" stroke-width="1.5">
                  <path d="M3 4h14M3 8h14M3 12h10M3 16h7" />
                </svg>
                <span class="font-serif-cn text-sm font-semibold" style="color: #F5F0EB;">材料清单</span>
                <span class="text-xs font-sans-en px-2 py-0.5 rounded" style="background-color: rgba(184,115,51,0.15); color: #B87333;">
                  {{ bill.length }} 项
                </span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8A8580" stroke-width="1.5" :style="{ transform: showBill ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>

            <div :style="{ height: showBill ? 'auto' : '0', opacity: showBill ? 1 : 0, overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }">
              <div class="px-6 pb-4 overflow-x-auto">
                <table class="w-full min-w-[640px]">
                  <thead>
                    <tr style="border-bottom: 1px solid rgba(245,240,235,0.08);">
                      <th v-for="h in tableHeaders" :key="h.key" class="py-3 text-[11px] font-sans-en font-medium tracking-wider" :class="h.align" :style="{ color: '#8A8580' }">
                        {{ h.label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, i) in bill" :key="i" style="border-bottom: 1px solid rgba(245,240,235,0.04);" class="hover:bg-[rgba(245,240,235,0.02)] transition-colors duration-200">
                      <td class="py-3 text-xs whitespace-nowrap" style="color: #F5F0EB;">{{ item.name }}</td>
                      <td class="py-3 text-xs" style="color: #8A8580;">{{ item.spec }}</td>
                      <td class="py-3 text-xs" style="color: #B87333;">{{ item.position }}</td>
                      <td class="py-3 text-xs text-center font-sans-en" style="color: #F5F0EB;">{{ item.count }}</td>
                      <td class="py-3 text-xs text-right font-sans-en" style="color: #8A8580;">¥{{ item.unitPrice.toFixed(2) }}</td>
                      <td class="py-3 text-xs text-right font-sans-en font-semibold" style="color: #B87333;">¥{{ item.total.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="4" />
                      <td class="py-4 text-xs font-serif-cn font-semibold text-right" style="color: #F5F0EB;">合计</td>
                      <td class="py-4 text-lg font-sans-en font-bold text-right" style="color: #B87333;">¥{{ totalPrice.toFixed(2) }}</td>
                    </tr>
                  </tfoot>
                </table>

                <div class="flex gap-3 mt-4">
                  <button class="flex-1 py-3 text-xs font-sans-en font-medium rounded transition-all duration-300 hover:scale-[1.02]" style="background-color: #B87333; color: #F5F0EB;" @click="copyBill">
                    复制清单
                  </button>
                  <button class="flex-1 py-3 text-xs font-sans-en font-medium rounded transition-all duration-300 hover:scale-[1.02]" style="background-color: transparent; border: 1px solid rgba(245,240,235,0.15); color: #F5F0EB;" @click="exportCSV">
                    导出 CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ─── Types ─────────────────────────────────────────
interface CabinetConfig {
  width: number; height: number; depth: number
  profile: '2020' | '3030' | '4040'
  panelMaterial: 'acrylic-clear' | 'acrylic-frosted' | 'mesh' | 'none'
  color: 'silver-white' | 'black' | 'gold'
  hasShelf: boolean; shelfCount: number
  hasWheels: boolean; topPanelType: 'wood-cover' | 'acrylic-inset'
}

interface MaterialItem {
  name: string; spec: string; position: string
  count: number; unitPrice: number; total: number
}

// ─── Constants ─────────────────────────────────────
const PROFILE_SIZES = {
  '2020': { w: 20, pricePerM: 12 },
  '3030': { w: 30, pricePerM: 18 },
  '4040': { w: 40, pricePerM: 28 },
}
const PANEL_PRICES: Record<string, number> = {
  'acrylic-clear': 120, 'acrylic-frosted': 140, 'mesh': 60, 'none': 0,
}
const COLOR_MAP: Record<string, string> = {
  'silver-white': '#E8E8E8', black: '#1A1A1A', gold: '#D4956A',
}

// ─── Config State ──────────────────────────────────
const config = reactive<CabinetConfig>({
  width: 800, height: 1000, depth: 400, profile: '2020',
  panelMaterial: 'acrylic-frosted', color: 'silver-white',
  hasShelf: true, shelfCount: 2, hasWheels: true,
  topPanelType: 'wood-cover',
})
const showBill = ref(true)

const updateConfig = <K extends keyof CabinetConfig>(key: K, value: CabinetConfig[K]) => {
  (config as any)[key] = value
}

const onHeaderEnter = () => { /* header animation handled by CSS */ }

// ─── UI Helpers ────────────────────────────────────
const dimensions = [
  { key: 'width' as const, label: '宽度 (mm)', min: 300, max: 1200 },
  { key: 'height' as const, label: '高度 (mm)', min: 300, max: 1500 },
  { key: 'depth' as const, label: '深度 (mm)', min: 300, max: 800 },
]
const panelMaterials = [
  { value: 'acrylic-clear' as const, label: '透明亚克力' },
  { value: 'acrylic-frosted' as const, label: '磨砂亚克力' },
  { value: 'mesh' as const, label: '金属网' },
  { value: 'none' as const, label: '无' },
]
const topPanelTypes = [
  { value: 'wood-cover' as const, label: '木质桌面盖板' },
  { value: 'acrylic-inset' as const, label: '亚克力板内嵌' },
]
const colors = [
  { value: 'silver-white' as const, label: '银白色', color: '#E8E8E8' },
  { value: 'black' as const, label: '黑色', color: '#1A1A1A' },
  { value: 'gold' as const, label: '金色', color: '#D4956A' },
]
const buttonStyle = (active: boolean) => ({
  backgroundColor: active ? '#B87333' : 'rgba(245,240,235,0.04)',
  color: active ? '#F5F0EB' : '#8A8580',
  border: `1px solid ${active ? '#B87333' : 'rgba(245,240,235,0.08)'}`,
})
const tableHeaders = [
  { key: 'name', label: '材料名称', align: 'text-left' },
  { key: 'spec', label: '规格', align: 'text-left' },
  { key: 'position', label: '用途/位置', align: 'text-left' },
  { key: 'count', label: '数量', align: 'text-center' },
  { key: 'unitPrice', label: '单价', align: 'text-right' },
  { key: 'total', label: '小计', align: 'text-right' },
]

// ─── Grid Texture (cached) ─────────────────────────
let gridTexCache: THREE.CanvasTexture | null = null
function getGridTex(): THREE.CanvasTexture {
  if (gridTexCache) return gridTexCache
  const size = 512, canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#e8e8e8'; ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#1a1a1a'
  for (let x = 0; x < size; x += 32) {
    for (let y = 0; y < size; y += 32) {
      ctx.beginPath(); ctx.arc(x + 16, y + 16, 11, 0, Math.PI * 2); ctx.fill()
    }
  }
  gridTexCache = new THREE.CanvasTexture(canvas)
  gridTexCache.wrapS = gridTexCache.wrapT = THREE.RepeatWrapping
  gridTexCache.repeat.set(4, 4)
  return gridTexCache
}

// ─── Bill of Materials ─────────────────────────────
const bill = computed<MaterialItem[]>(() => {
  const items: MaterialItem[] = []
  const profile = PROFILE_SIZES[config.profile]
  const pw = profile.w

  // Columns
  items.push({
    name: `铝型材 ${config.profile}`, spec: `${config.height}mm × 4根`,
    position: '四角立柱', count: 4,
    unitPrice: profile.pricePerM * (config.height / 1000),
    total: Math.round(profile.pricePerM * (config.height / 1000) * 4 * 100) / 100,
  })
  // Top horizontals
  const tw = config.width - 2 * pw
  items.push({ name: `铝型材 ${config.profile}`, spec: `${tw}mm × 2根 (横)`, position: '顶部前、后横梁', count: 2, unitPrice: profile.pricePerM * (tw / 1000), total: Math.round(profile.pricePerM * (tw / 1000) * 2 * 100) / 100 })
  const td = config.depth - 2 * pw
  items.push({ name: `铝型材 ${config.profile}`, spec: `${td}mm × 2根 (纵)`, position: '顶部左、右纵梁', count: 2, unitPrice: profile.pricePerM * (td / 1000), total: Math.round(profile.pricePerM * (td / 1000) * 2 * 100) / 100 })
  // Shelf frames
  if (config.hasShelf && config.shelfCount > 0) {
    const sw = config.width - 2 * pw, sd = config.depth - 2 * pw
    items.push({ name: `铝型材 ${config.profile}`, spec: `${sw}mm × ${2 * config.shelfCount}根 (横)`, position: '层板前、后横梁', count: 2 * config.shelfCount, unitPrice: profile.pricePerM * (sw / 1000), total: Math.round(profile.pricePerM * (sw / 1000) * 2 * config.shelfCount * 100) / 100 })
    items.push({ name: `铝型材 ${config.profile}`, spec: `${sd}mm × ${2 * config.shelfCount}根 (纵)`, position: '层板左、右纵梁', count: 2 * config.shelfCount, unitPrice: profile.pricePerM * (sd / 1000), total: Math.round(profile.pricePerM * (sd / 1000) * 2 * config.shelfCount * 100) / 100 })
  }
  // Brackets
  const bc = 4 + (config.hasShelf ? config.shelfCount * 4 : 0)
  items.push({ name: '角码连接件', spec: `${config.profile}专用`, position: '顶部四角' + (config.hasShelf ? ' + 层板四角' : ''), count: bc, unitPrice: 2.5, total: bc * 2.5 })
  const sc = bc * 2
  items.push({ name: 'T型螺母+螺丝', spec: 'M6×16mm', position: '全部连接点', count: sc, unitPrice: 0.8, total: sc * 0.8 })

  // Panels
  if (config.panelMaterial !== 'none') {
    const pl = config.panelMaterial === 'acrylic-clear' ? '透明亚克力' : config.panelMaterial === 'acrylic-frosted' ? '磨砂亚克力' : '金属网'
    const usableH = config.height - 2 * pw
    const shelfSpacing = config.hasShelf && config.shelfCount > 0 ? usableH / (config.shelfCount + 1) : 0
    const upperShelfY = pw + shelfSpacing * (config.shelfCount || 0)
    const upperH = config.height - upperShelfY - pw

    // Top panel
    const topArea = ((config.width - 2 * pw) * (config.depth - 2 * pw)) / 1000000
    if (config.topPanelType === 'wood-cover') {
      items.push({ name: '顶板 (木质桌面盖板)', spec: `${Math.round(config.width - 2 * pw + 10)}×${Math.round(config.depth - 2 * pw + 10)}mm (覆盖式)`, position: '顶部覆盖', count: 1, unitPrice: 180 * topArea, total: Math.round(180 * topArea * 100) / 100 })
    } else {
      items.push({ name: '顶板 (亚克力内嵌)', spec: `${Math.round(config.width - 2 * pw - 4)}×${Math.round(config.depth - 2 * pw - 4)}mm (嵌入式)`, position: '顶部嵌装', count: 1, unitPrice: PANEL_PRICES['acrylic-clear'] * topArea, total: Math.round(PANEL_PRICES['acrylic-clear'] * topArea * 100) / 100 })
    }
    // Arch door (upper section)
    const dh = Math.round(upperH * 0.85), dw = config.width - 2 * pw - 2
    items.push({ name: `拱门入口 (${pl})`, spec: `${dw}×${dh}mm (拱形·直接挖洞)`, position: '正面上层入口', count: 1, unitPrice: PANEL_PRICES[config.panelMaterial] * (dw * dh / 1000000), total: Math.round(PANEL_PRICES[config.panelMaterial] * (dw * dh / 1000000) * 100) / 100 })
    // Side panels (upper section only - NO bottom compartment)
    if (upperH > 0) {
      items.push({ name: `侧板 (${pl})`, spec: `${Math.round(upperH)}×${Math.round(config.depth - 2 * pw)}mm (上层)`, position: '上层左右两侧', count: 2, unitPrice: PANEL_PRICES[config.panelMaterial] * (upperH * (config.depth - 2 * pw) / 1000000), total: Math.round(PANEL_PRICES[config.panelMaterial] * (upperH * (config.depth - 2 * pw) / 1000000) * 2 * 100) / 100 })
    }
    // Back panel (upper section only)
    if (upperH > 0) {
      items.push({ name: `背板 (${pl})`, spec: `${Math.round(config.width - 2 * pw)}×${Math.round(upperH)}mm (上层)`, position: '上层背面', count: 1, unitPrice: PANEL_PRICES[config.panelMaterial] * (upperH * (config.width - 2 * pw) / 1000000), total: Math.round(PANEL_PRICES[config.panelMaterial] * (upperH * (config.width - 2 * pw) / 1000000) * 100) / 100 })
    }
  }
  // Shelves
  if (config.hasShelf) {
    const sw = Math.round((config.width - 2 * pw - 2) * 0.5), sD = config.depth - 2 * pw - 2
    items.push({ name: '层板 (金属网漏砂)', spec: `${sw}×${Math.round(sD)}mm (半宽${config.shelfCount > 1 ? '·交错' : ''})`, position: '内部隔层', count: config.shelfCount, unitPrice: PANEL_PRICES['mesh'] * (sw * sD / 1000000), total: Math.round(PANEL_PRICES['mesh'] * (sw * sD / 1000000) * config.shelfCount * 100) / 100 })
  }
  // Casters (2 braked + 2 free)
  if (config.hasWheels) {
    items.push({ name: '万向轮 (带刹车)', spec: '工业脚轮 M8×2', position: '底部前左 + 前右', count: 2, unitPrice: 15, total: 30 })
    items.push({ name: '万向轮 (无刹车)', spec: '工业脚轮 M8×2', position: '底部后左 + 后右', count: 2, unitPrice: 12, total: 24 })
  }
  return items
})

const totalPrice = computed(() => Math.round(bill.value.reduce((s, i) => s + i.total, 0) * 100) / 100)
const totalWeight = computed(() => {
  const pw = PROFILE_SIZES[config.profile]
  const wMap: Record<string, number> = { '2020': 0.6, '3030': 1.2, '4040': 2.0 }
  let tl = (config.height * 4 + (config.width - 2 * pw.w) * 2 + (config.depth - 2 * pw.w) * 2) / 1000
  if (config.hasShelf) tl += ((config.width - 2 * pw.w) * 2 + (config.depth - 2 * pw.w) * 2) * config.shelfCount / 1000
  let w = tl * wMap[config.profile]
  if (config.hasWheels) w += 1.2
  return Math.round(w * 10) / 10
})

const copyBill = () => {
  const content = bill.value.map(i => `${i.name}\t${i.spec}\t${i.position}\t${i.count}\t¥${i.unitPrice.toFixed(2)}\t¥${i.total.toFixed(2)}`).join('\n')
  navigator.clipboard.writeText(`猫砂柜材料清单\n\n${content}\n合计\t\t\t\t\t¥${totalPrice.value.toFixed(2)}`)
  alert('材料清单已复制到剪贴板')
}
const exportCSV = () => {
  const csv = [
    ['材料名称', '规格', '用途/位置', '数量', '单价', '小计'],
    ...bill.value.map(i => [i.name, i.spec, i.position, String(i.count), `¥${i.unitPrice.toFixed(2)}`, `¥${i.total.toFixed(2)}`]),
    ['合计', '', '', '', '', `¥${totalPrice.value.toFixed(2)}`]
  ].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `猫砂柜材料清单_${config.width}x${config.height}x${config.depth}.csv`
  link.click()
}

// ─── Three.js 3D Rendering ─────────────────────────
const threeCanvas = ref<HTMLCanvasElement | null>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)

onMounted(() => {
  initThreeJS()
})

let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, controls: OrbitControls
let cabinetGroup: THREE.Group

function initThreeJS() {
  const canvas = threeCanvas.value
  const container = canvasContainer.value
  if (!canvas || !container) return

  const w = container.clientWidth, h = container.clientHeight

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#0A0908')

  // Camera
  camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100)
  camera.position.set(1.4, 0.6, 1.6)

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.minDistance = 0.6
  controls.maxDistance = 4
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.5
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const d1 = new THREE.DirectionalLight(0xffffff, 1.0)
  d1.position.set(5, 5, 5); scene.add(d1)
  const d2 = new THREE.DirectionalLight(0xd4c5b0, 0.4)
  d2.position.set(-3, 3, -3); scene.add(d2)
  const p1 = new THREE.PointLight(0xB87333, 0.5, 10)
  p1.position.set(0, 2, 2); scene.add(p1)

  // Ground shadow
  const groundGeo = new THREE.PlaneGeometry(8, 8)
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -config.height / 2000 - (config.hasWheels ? 0.035 : 0.01)
  ground.receiveShadow = true
  scene.add(ground)

  // Build initial cabinet
  buildCabinet()

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  // Resize
  const onResize = () => {
    const cw = container.clientWidth, ch = container.clientHeight
    camera.aspect = cw / ch
    camera.updateProjectionMatrix()
    renderer.setSize(cw, ch)
  }
  window.addEventListener('resize', onResize)

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    renderer.dispose()
    controls.dispose()
  })
}

// Watch config changes and rebuild
watch(config, () => {
  if (scene) buildCabinet()
}, { deep: true })

function buildCabinet() {
  // Remove old cabinet
  if (cabinetGroup) {
    scene.remove(cabinetGroup)
    cabinetGroup.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose())
        else child.material.dispose()
      }
    })
  }

  const p = PROFILE_SIZES[config.profile].w / 1000
  const W = config.width / 1000, H = config.height / 1000, D = config.depth / 1000

  cabinetGroup = new THREE.Group()

  // Material
  const c = COLOR_MAP[config.color]
  const frameMat = new THREE.MeshStandardMaterial({
    color: c, metalness: config.color === 'gold' ? 0.7 : 0.5,
    roughness: config.color === 'gold' ? 0.3 : 0.4,
  })

  // Panel material
  let panelMat: THREE.Material | null = null
  if (config.panelMaterial === 'mesh') {
    panelMat = new THREE.MeshStandardMaterial({ map: getGridTex(), metalness: 0.1, roughness: 0.6, side: THREE.DoubleSide })
  } else if (config.panelMaterial !== 'none') {
    panelMat = new THREE.MeshPhysicalMaterial({
      color: '#E8E8E8', metalness: 0,
      roughness: config.panelMaterial === 'acrylic-frosted' ? 0.8 : 0.1,
      transparent: true, opacity: config.panelMaterial === 'acrylic-frosted' ? 0.5 : 0.35,
      transmission: config.panelMaterial === 'acrylic-clear' ? 0.7 : 0.3, thickness: 0.005,
    })
  }

  // Shelf material (grid, visible from both sides)
  const shelfMat = new THREE.MeshStandardMaterial({
    map: getGridTex(), metalness: 0.1, roughness: 0.6,
    side: THREE.DoubleSide, transparent: true, opacity: 0.9,
  })

  // Columns
  const cols = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
  cols.forEach(([sx, sz]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(p, H, p), frameMat)
    col.position.set(sx * (W / 2 - p / 2), 0, sz * (D / 2 - p / 2))
    col.castShadow = true
    cabinetGroup.add(col)
  })

  // Top horizontals
  const topBeams = [
    [0, H - p / 2, -D / 2 + p / 2, W - 2 * p, p, p],
    [0, H - p / 2, D / 2 - p / 2, W - 2 * p, p, p],
    [-W / 2 + p / 2, H - p / 2, 0, p, p, D - 2 * p],
    [W / 2 - p / 2, H - p / 2, 0, p, p, D - 2 * p],
  ]
  topBeams.forEach(([x, y, z, sx, sy, sz]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(sx as number, sy as number, sz as number), frameMat)
    b.position.set(x as number, y as number, z as number)
    b.castShadow = true
    cabinetGroup.add(b)
  })

  // Shelf levels
  const shelfLevels: number[] = []
  if (config.hasShelf) {
    for (let i = 0; i < config.shelfCount; i++) {
      const yPos = ((H - 2 * p) / (config.shelfCount + 1)) * (i + 1) + p - H / 2
      shelfLevels.push(yPos)
      // Shelf frame beams
      const sb = [
        [0, yPos, -D / 2 + p / 2, W - 2 * p, p, p],
        [0, yPos, D / 2 - p / 2, W - 2 * p, p, p],
        [-W / 2 + p / 2, yPos, 0, p, p, D - 2 * p],
        [W / 2 - p / 2, yPos, 0, p, p, D - 2 * p],
      ]
      sb.forEach(([x, y, z, sx, sy, sz]) => {
        const bm = new THREE.Mesh(new THREE.BoxGeometry(sx as number, sy as number, sz as number), frameMat)
        bm.position.set(x as number, y as number, z as number)
        cabinetGroup.add(bm)
      })
      // Shelf plate (staggered half-width, thick for visibility)
      const isLeft = i % 2 === 0
      const shelfW = (W - 2 * p - 0.01) * 0.5
      const shelfGroup = new THREE.Group()
      // Main plate
      const plate = new THREE.Mesh(new THREE.BoxGeometry(shelfW, 0.02, D - 2 * p - 0.01), shelfMat)
      plate.position.set(isLeft ? -shelfW / 2 : shelfW / 2, yPos, 0)
      shelfGroup.add(plate)
      // Edge borders for visibility from behind
      const edgeGeo = new THREE.BoxGeometry(0.008, 0.025, D - 2 * p - 0.01)
      const leftEdge = new THREE.Mesh(edgeGeo, shelfMat)
      leftEdge.position.set((isLeft ? -shelfW / 2 : shelfW / 2) - shelfW / 2, yPos, 0)
      shelfGroup.add(leftEdge)
      const rightEdge = new THREE.Mesh(edgeGeo, shelfMat)
      rightEdge.position.set((isLeft ? -shelfW / 2 : shelfW / 2) + shelfW / 2, yPos, 0)
      shelfGroup.add(rightEdge)
      cabinetGroup.add(shelfGroup)
    }
  }

  // Casters (2 braked front, 2 free back) - industrial style
  if (config.hasWheels) {
    cols.forEach(([sx, sz]) => {
      const isFront = sz > 0
      const hasBrake = isFront // front two have brakes
      const cx = sx * (W / 2 - p / 2), cz = sz * (D / 2 - p / 2)

      // Plate mount flush with column
      const mount = new THREE.Mesh(
        new THREE.CylinderGeometry(p * 0.85, p * 0.7, 0.008, 8),
        new THREE.MeshStandardMaterial({ color: '#999', metalness: 0.95, roughness: 0.1 })
      )
      mount.position.set(cx, -H / 2 - 0.005, cz)
      cabinetGroup.add(mount)

      // Short stem
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.018, 12),
        new THREE.MeshStandardMaterial({ color: '#888', metalness: 0.85, roughness: 0.15 })
      )
      stem.position.set(cx, -H / 2 - 0.018, cz)
      cabinetGroup.add(stem)

      // Swivel bracket (fork shape)
      const forkMat = new THREE.MeshStandardMaterial({ color: '#ccc', metalness: 0.9, roughness: 0.15 })
      const fork = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.035, 0.012), forkMat)
      fork.position.set(cx, -H / 2 - 0.04, cz)
      cabinetGroup.add(fork)

      // Brake lever (for front casters)
      if (hasBrake) {
        const brake = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.008, 0.018),
          new THREE.MeshStandardMaterial({ color: '#B87333', metalness: 0.7, roughness: 0.3 })
        )
        brake.position.set(cx + 0.025, -H / 2 - 0.03, cz)
        cabinetGroup.add(brake)
      }

      // Wheel (PU rubber)
      const wheelGeo = new THREE.TorusGeometry(0.022, 0.008, 8, 20)
      const wheelMat = new THREE.MeshStandardMaterial({ color: '#555', metalness: 0.3, roughness: 0.7 })
      const wheel = new THREE.Mesh(wheelGeo, wheelMat)
      wheel.position.set(cx, -H / 2 - 0.055, cz)
      wheel.rotation.y = Math.PI / 2
      cabinetGroup.add(wheel)

      // Wheel hub
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.022, 8),
        new THREE.MeshStandardMaterial({ color: '#aaa', metalness: 0.9, roughness: 0.1 })
      )
      hub.position.set(cx, -H / 2 - 0.055, cz)
      hub.rotation.x = Math.PI / 2
      cabinetGroup.add(hub)
    })
  }

  // Top panel
  if (config.topPanelType === 'wood-cover') {
    const wood = new THREE.Mesh(
      new THREE.BoxGeometry(W - 2 * p + 0.01, 0.018, D - 2 * p + 0.01),
      new THREE.MeshStandardMaterial({ color: '#8B6914', roughness: 0.7, metalness: 0.05 })
    )
    wood.position.set(0, H - p / 2 + 0.01, 0)
    wood.castShadow = true
    cabinetGroup.add(wood)
  } else {
    const ac = new THREE.Mesh(
      new THREE.BoxGeometry(W - 2 * p - 0.02, 0.005, D - 2 * p - 0.02),
      new THREE.MeshPhysicalMaterial({ color: '#E8E8E8', roughness: 0.1, transparent: true, opacity: 0.35, transmission: 0.7, thickness: 0.005 })
    )
    ac.position.set(0, H - p / 2 - 0.002, 0)
    cabinetGroup.add(ac)
  }

  // Upper section calculations
  const usableH = H - 2 * p
  const shelfSpacing = config.hasShelf && config.shelfCount > 0 ? usableH / (config.shelfCount + 1) : 0
  const upperShelfY = p + shelfSpacing * (config.shelfCount || 0) - H / 2
  const upperSecH = H / 2 - upperShelfY - p

  // Arch door - upper section, right-offset, inside frame
  if (panelMat && upperSecH > 0.05) {
    const doorH = upperSecH * 0.85
    const doorW = (W - 2 * p - 0.01) * 0.45
    const archR = doorW * 0.5
    const shape = new THREE.Shape()
    const hw = doorW / 2
    shape.moveTo(-hw, 0)
    shape.lineTo(-hw, doorH - archR)
    shape.quadraticCurveTo(-hw, doorH, -hw + archR, doorH)
    shape.lineTo(hw - archR, doorH)
    shape.quadraticCurveTo(hw, doorH, hw, doorH - archR)
    shape.lineTo(hw, 0)
    shape.lineTo(-hw, 0)

    const doorGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.005, bevelEnabled: false })
    const door = new THREE.Mesh(doorGeo, panelMat)
    // Right-offset, inside frame
    const xOff = (W - 2 * p - 0.01) * 0.12
    door.position.set(xOff, upperShelfY + (upperSecH - doorH) * 0.1, D / 2 + 0.003)
    cabinetGroup.add(door)
  }

  // Side & back panels - ONLY upper section (no bottom compartment panels)
  if (panelMat && config.hasShelf && config.shelfCount > 0 && upperSecH > 0) {
    // Top compartment sides+back
    const sideH = upperSecH
    const leftSide = new THREE.Mesh(new THREE.BoxGeometry(0.005, sideH, D - 2 * p - 0.01), panelMat)
    leftSide.position.set(-W / 2 + p / 2, H / 2 - p - sideH / 2, 0)
    cabinetGroup.add(leftSide)

    const rightSide = new THREE.Mesh(new THREE.BoxGeometry(0.005, sideH, D - 2 * p - 0.01), panelMat)
    rightSide.position.set(W / 2 - p / 2, H / 2 - p - sideH / 2, 0)
    cabinetGroup.add(rightSide)

    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(W - 2 * p - 0.01, sideH, 0.005), panelMat)
    backPanel.position.set(0, H / 2 - p - sideH / 2, -D / 2 + p / 2)
    cabinetGroup.add(backPanel)

    // Middle compartments (between shelves) - sides + back
    for (let i = 0; i < shelfLevels.length - 1; i++) {
      const yBottom = shelfLevels[i]
      const yTop = shelfLevels[i + 1]
      const segH = yTop - yBottom
      const midY = (yBottom + yTop) / 2

      const ls = new THREE.Mesh(new THREE.BoxGeometry(0.005, segH, D - 2 * p - 0.01), panelMat)
      ls.position.set(-W / 2 + p / 2, midY, 0)
      cabinetGroup.add(ls)

      const rs = new THREE.Mesh(new THREE.BoxGeometry(0.005, segH, D - 2 * p - 0.01), panelMat)
      rs.position.set(W / 2 - p / 2, midY, 0)
      cabinetGroup.add(rs)

      const bp = new THREE.Mesh(new THREE.BoxGeometry(W - 2 * p - 0.01, segH, 0.005), panelMat)
      bp.position.set(0, midY, -D / 2 + p / 2)
      cabinetGroup.add(bp)
    }
  }

  // If no shelves, full panels
  if (panelMat && (!config.hasShelf || config.shelfCount === 0)) {
    const ls = new THREE.Mesh(new THREE.BoxGeometry(0.005, H - 2 * p - 0.01, D - 2 * p - 0.01), panelMat)
    ls.position.set(-W / 2 + p / 2, 0, 0); cabinetGroup.add(ls)
    const rs = new THREE.Mesh(new THREE.BoxGeometry(0.005, H - 2 * p - 0.01, D - 2 * p - 0.01), panelMat)
    rs.position.set(W / 2 - p / 2, 0, 0); cabinetGroup.add(rs)
    const bp = new THREE.Mesh(new THREE.BoxGeometry(W - 2 * p - 0.01, H - 2 * p - 0.01, 0.005), panelMat)
    bp.position.set(0, 0, -D / 2 + p / 2); cabinetGroup.add(bp)
  }

  scene.add(cabinetGroup)

  // Update ground position
  scene.traverse(child => {
    if (child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry && child.receiveShadow) {
      child.position.y = -H / 2 - (config.hasWheels ? 0.065 : 0.01)
    }
  })
}
</script>
