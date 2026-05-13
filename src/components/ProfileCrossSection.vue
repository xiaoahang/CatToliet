<template>
  <div class="mt-3 flex flex-col items-center">
    <svg :viewBox="vb" class="w-full max-w-[180px]" style="aspect-ratio: 1;">
      <!-- 将坐标系原点移到型材中心，确保完整截面可见 -->
      <g :transform="gTransform">
        <!-- 型材外轮廓：正方形 + 四面 T-slot 梯形槽 + 四角圆角 -->
        <path :d="outerPath" fill="#B8B8B8" stroke="#444" stroke-width="0.4" />
        <!-- 中心 Ø5.2mm 通孔 -->
        <circle cx="0" cy="0" :r="centerHoleR" fill="#2A2520" stroke="#666" stroke-width="0.3" />
        <!-- 内壁辅助圆（装饰性细节） -->
        <circle cx="0" cy="0" :r="centerHoleR * 1.6" fill="none" stroke="#888" stroke-width="0.15" opacity="0.5" />
      </g>
      <!-- 尺寸标注 -->
      <!-- 外形宽度标注 -->
      <line :x1="pad" :y1="size + 6" :x2="size + pad" :y2="size + 6" stroke="#B87333" stroke-width="0.5" />
      <line :x1="pad" :y1="size + 5" :x2="pad" :y2="size + 7" stroke="#B87333" stroke-width="0.5" />
      <line :x1="size + pad" :y1="size + 5" :x2="size + pad" :y2="size + 7" stroke="#B87333" stroke-width="0.5" />
      <text :x="size / 2 + pad" :y="size + 10" text-anchor="middle" fill="#B87333" font-size="2"
        font-family="sans-serif" font-weight="bold">{{ 2 * p }}mm</text>
      <!-- 槽深标注（右侧竖线） -->
      <line :x1="size + pad + 3" :y1="pad + p - bottle_neck" :x2="size + pad + 3" :y2="bottle_neck + p + pad"
        stroke="#B87333" stroke-width="0.5" />
      <line :x1="size + pad + 2" :y1="pad + p - bottle_neck" :x2="size + pad + 4" :y2="pad + p - bottle_neck"
        stroke="#B87333" stroke-width="0.5" />
      <line :x1="size + pad + 2" :y1="bottle_neck + p + pad" :x2="size + pad + 4" :y2="bottle_neck + p + pad"
        stroke="#B87333" stroke-width="0.5" />
      <text :x="size + pad + 9" :y="size / 2 + pad + 1" text-anchor="middle" fill="#B87333" font-size="2"
        font-family="sans-serif" transform="rotate(90, size+pad+8, size/2+pad+1)"> {{ 2 * bottle_neck }}mm</text>
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
// const pad = 4  // SVG 边距
const pad = computed(() => {
  const map: Record<string, number> = { '2020': 4, '3030': 6, '4040': 8 }
  return map[props.profile]
}).value

const size = computed(() => p.value * 2)
const vb = computed(() => `0 0 ${size.value + pad * 2 + 10} ${size.value + pad * 2 + 7}`)
const gTransform = computed(() => {
  const cx = p.value + pad
  const cy = p.value + pad
  return `translate(${cx}, ${cy})`
})

/** 截面几何参数 —— 与 cabinetScene.ts 中的 createTSlotShape 保持一致 */
const half = computed(() => p.value)
const corner_r = computed(() => p.value * 0.075)     // 四角圆角 R1.5
const min_neck = computed(() => p.value * 0.1575)    // 槽口半宽 3.15（最窄处6.3）
const bottle_neck = computed(() => p.value * 0.315)   // 瓶颈 3.15
const wall = computed(() => p.value * 0.09)    // 壁厚 1.4
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
  const h = half.value // 10
  const r = corner_r.value // 2.6
  const min_neck = h * 0.315
  const neck_depth = h * 0.63

  const x0 = min_neck // = 0.315 * 10 = 3.15
  const x1 = h - neck_depth // = 10 - 6.3 = 3.7
  const x2 = h - x0 // = 10 - 3.15 = 6.85
  const x3 = 0.7 * h
  // const x4 = h - w // = 10 - 1.8 = 8.2
  const x4 = h - 1.8 // = 10 - 1.8 = 8.2
  const x5 = h // =10


  // 逆时针从左上角绘制
  // bug 这玩意纵坐标方向是向下的
  let d = `M ${-h + r} ${-h}`
  d += ` Q ${-h} ${-h} ${-h} ${-h + r}`  // 左上角

  // 左边缘
  d += `L ${-x5} ${-x0}`
  d += `L ${-x4} ${-x0}`
  d += `L ${-x4} ${-x2}`
  d += `L ${-x3} ${-x2}`
  d += `L ${-x1} ${-x1}`
  d += `L ${-x1} ${x1}`
  d += `L ${-x3} ${x2}`
  d += `L ${-x4} ${x2}`
  d += `L ${-x4} ${x0}`
  d += `L ${-x5} ${x0}`
  d += `L ${-x5} ${x5 - r}`

  // 左下角
  d += ` Q ${-h} ${h} ${-h + r} ${h}`

  // 下边缘
  d += `L ${-x0} ${x5} `
  d += `L ${-x0} ${x4} `
  d += `L ${-x2} ${x4}`
  d += `L ${-x2} ${x3}`
  d += `L ${-x1} ${x1}`
  d += `L ${x1} ${x1}`
  d += `L ${x2} ${x3}`
  d += `L ${x2} ${x4}`
  d += `L ${x0} ${x4}`
  d += `L ${x0} ${x5}`
  d += `L ${x5 - r} ${x5}`


  // 右下角
  d += ` Q ${h} ${h} ${h} ${h - r}`

  // 右边缘
  d += `L ${x5} ${x0}`
  d += `L ${x4} ${x0}`
  d += `L ${x4} ${x2}`
  d += `L ${x3} ${x2}`
  d += `L ${x1} ${x1}`
  d += `L ${x1} ${-x1}`
  d += `L ${x3} ${-x2}`
  d += `L ${x4} ${-x2}`
  d += `L ${x4} ${-x0}`
  d += `L ${x5} ${-x0}`
  d += `L ${x5} ${-x5 + r}`

  // 右上角
  d += ` Q ${h} ${-h} ${h - r} ${-h}`

  // 顶边缘（槽朝下）：梯形
  d += `L ${x0} ${-x5} `
  d += `L ${x0} ${-x4} `
  d += `L ${x2} ${-x4}`
  d += `L ${x2} ${-x3}`
  d += `L ${x1} ${-x1}`
  d += `L ${-x1} ${-x1}`
  d += `L ${-x2} ${-x3}`
  d += `L ${-x2} ${-x4}`
  d += `L ${-x0} ${-x4}`
  d += `L ${-x0} ${-x5}`
  d += `L ${-x5 + r} ${-x5}`


  d += ` Z`

  return d
})
</script>
