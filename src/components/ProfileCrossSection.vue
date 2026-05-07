<template>
  <div class="mt-3 flex flex-col items-center">
    <svg :viewBox="vb" class="w-full max-w-[180px]" style="aspect-ratio: 1;">
      <!-- 将坐标系原点移到型材中心，确保完整截面可见 -->
      <g :transform="gTransform">
        <!-- 型材外轮廓：正方形 + 四面 T-slot 梯形槽 + 四角圆角 -->
        <path
          :d="outerPath"
          fill="#B8B8B8"
          stroke="#444"
          stroke-width="0.4"
        />
        <!-- 中心 Ø5.2mm 通孔 -->
        <circle
          cx="0"
          cy="0"
          :r="centerHoleR"
          fill="#2A2520"
          stroke="#666"
          stroke-width="0.3"
        />
        <!-- 内壁辅助圆（装饰性细节） -->
        <circle
          cx="0"
          cy="0"
          :r="centerHoleR * 1.6"
          fill="none"
          stroke="#888"
          stroke-width="0.15"
          opacity="0.5"
        />
      </g>
      <!-- 尺寸标注 -->
      <!-- 外形宽度标注 -->
      <line :x1="pad" :y1="size + 2" :x2="size + pad" :y2="size + 2" stroke="#B87333" stroke-width="0.5" />
      <line :x1="pad" :y1="size + 1" :x2="pad" :y2="size + 3" stroke="#B87333" stroke-width="0.5" />
      <line :x1="size + pad" :y1="size + 1" :x2="size + pad" :y2="size + 3" stroke="#B87333" stroke-width="0.5" />
      <text :x="size/2 + pad" :y="size + 5.5" text-anchor="middle" fill="#B87333" font-size="3.5" font-family="sans-serif" font-weight="bold">{{ label }}</text>
      <!-- 槽深标注（右侧竖线） -->
      <line :x1="size + pad + 4" :y1="pad" :x2="size + pad + 4" :y2="size + pad" stroke="#B87333" stroke-width="0.5" />
      <line :x1="size + pad + 3" :y1="pad" :x2="size + pad + 5" :y2="pad" stroke="#B87333" stroke-width="0.5" />
      <line :x1="size + pad + 3" :y1="size + pad" :x2="size + pad + 5" :y2="size + pad" stroke="#B87333" stroke-width="0.5" />
      <text :x="size + pad + 8" :y="size/2 + pad + 1" text-anchor="middle" fill="#B87333" font-size="3" font-family="sans-serif" transform="rotate(90, size+pad+8, size/2+pad+1)">6.3</text>
    </svg>
    <p class="text-[10px] mt-1" style="color: #8A8580;">欧标{{ label }} T-slot 截面</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  profile: string // '2020' | '3030' | '4040'
}>()

/** 型材规格对应的半宽（SVG 坐标系用） */
const p = computed(() => {
  const map: Record<string, number> = { '2020': 10, '3030': 15, '4040': 20 }
  return map[props.profile] || 10
})

const label = computed(() => props.profile)
const pad = 4  // SVG 边距

const size = computed(() => p.value * 2)
const vb = computed(() => `0 0 ${size.value + pad * 2 + 10} ${size.value + pad * 2 + 7}`)
const gTransform = computed(() => {
  const cx = p.value + pad
  const cy = p.value + pad
  return `translate(${cx}, ${cy})`
})

/** 截面几何参数 —— 与 cabinetScene.ts 中的 createTSlotShape 保持一致 */
const half = computed(() => p.value)
const cr = computed(() => p.value * 0.075)     // 四角圆角 R1.5
const so = computed(() => p.value * 0.1575)    // 槽口半宽 3.15（最窄处6.3）
const wall = computed(() => p.value * 0.07)    // 壁厚 1.4
const sb = computed(() => p.value * 0.275)     // 槽腔底部半宽 5.5（最宽处11）
const slotDepth = computed(() => p.value * 0.315) // 槽深 6.3
const sBot = computed(() => p.value - slotDepth.value) // 槽底距中心 = 3.7
const hk = computed(() => p.value * 0.03)      // 钩子外凸 0.6
const centerHoleR = computed(() => p.value * 0.13)   // 中心孔半径 2.6

/**
 * SVG path —— 完整的四面 T-slot 梯形截面
 * 
 * 梯形槽腔特征：
 * - 开口/颈部：6.3mm（最窄，半宽 so=3.15）
 * - 斜壁扩宽 → 腔体底部：11mm（最宽，半宽 sb=5.5）
 * - 底部钩子：R0.6 圆弧（T-slot 螺母卡位）
 */
const outerPath = computed(() => {
  const h = half.value
  const iw = h - wall.value
  const bot = sBot.value
  const o = so.value
  const b = sb.value
  const k = hk.value
  const r = cr.value

  // 顺时针从左上角绘制
  let d = `M ${-h + r} ${-h}`
  d += ` Q ${-h} ${-h} ${-h} ${-h + r}`  // 左上角

  // 左边缘（槽朝右）：梯形 — 开口窄 → 斜壁 → 底部宽
  d += ` L ${-h} ${-o}`
  d += ` L ${-iw} ${-o}`           // 颈部（窄 6.3）
  d += ` L ${-bot - k} ${b}`       // 斜壁 → 腔体底部（宽 11）
  d += ` L ${-bot} ${b - k}`       // 钩子上
  d += ` L ${-bot} ${-b + k}`      // 横贯槽底
  d += ` L ${-bot - k} ${-b}`      // 钩子下
  d += ` L ${-iw} ${o}`            // 斜壁收窄 → 颈部（回到 6.3 窄）
  d += ` L ${-h} ${o}`
  d += ` L ${-h} ${h - r}`         // 左下角

  d += ` Q ${-h} ${h} ${-h + r} ${h}`

  // 底边缘（槽朝上）：梯形
  d += ` L ${-o} ${h}`
  d += ` L ${-o} ${iw}`            // 颈部（窄）
  d += ` L ${-b} ${iw}`            // 斜壁 → 宽
  d += ` L ${-b} ${bot + k}`
  d += ` L ${-b + k} ${bot}`       // 钩子
  d += ` L ${b - k} ${bot}`        // 横贯
  d += ` L ${b} ${bot + k}`        // 钩子
  d += ` L ${b} ${iw}`             // 斜壁 → 窄
  d += ` L ${o} ${iw}`             // 颈部
  d += ` L ${o} ${h}`
  d += ` L ${h - r} ${h}`          // 右下角

  d += ` Q ${h} ${h} ${h} ${h - r}`

  // 右边缘（槽朝左）：梯形
  d += ` L ${h} ${o}`
  d += ` L ${iw} ${o}`             // 颈部（窄）
  d += ` L ${bot + k} ${-b}`       // 斜壁 → 宽
  d += ` L ${bot} ${-b + k}`       // 钩子
  d += ` L ${bot} ${b - k}`        // 横贯
  d += ` L ${bot + k} ${b}`        // 钩子
  d += ` L ${iw} ${-o}`            // 斜壁 → 窄
  d += ` L ${h} ${-o}`             // 颈部
  d += ` L ${h} ${-h + r}`         // 右上角

  d += ` Q ${h} ${-h} ${h - r} ${-h}`

  // 顶边缘（槽朝下）：梯形
  d += ` L ${o} ${-h}`
  d += ` L ${o} ${-iw}`            // 颈部（窄）
  d += ` L ${b} ${-iw}`            // 斜壁 → 宽
  d += ` L ${b} ${-bot - k}`
  d += ` L ${b - k} ${-bot}`       // 钩子
  d += ` L ${-b + k} ${-bot}`      // 横贯
  d += ` L ${-b} ${-bot - k}`      // 钩子
  d += ` L ${-b} ${-iw}`           // 斜壁 → 窄
  d += ` L ${-o} ${-iw}`           // 颈部
  d += ` L ${-o} ${-h}`
  d += ` Z`

  return d
})
</script>
