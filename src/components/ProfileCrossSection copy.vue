<template>
  <div class="mt-3 flex flex-col items-center">
    <svg :viewBox="vb" class="w-full max-w-[180px]" style="aspect-ratio: 1;">
      <!-- 将坐标系原点移到型材中心，确保完整截面可见 -->
      <g :transform="gTransform">
        <!-- 型材外轮廓：正方形 + 四面 T-slot 梯形槽 + 四角圆角 -->
        <path :d="outerPath" fill="#B8B8B8" stroke="#444" stroke-width="0.4" />
        <!-- 中心 Ø5.2mm 通孔 -->
        <circle cx="0" cy="0" :r="centerHoleR" fill="#2A2520" stroke="#666" stroke-width="0.3" />
      </g>
      <!-- 尺寸标注 -->
      <!-- 外形宽度标注 （下方横线） -->
      <line :x1="pad" :y1="size + 6" :x2="size + pad" :y2="size + 6" stroke="#B87333" stroke-width="0.5" />
      <line :x1="pad" :y1="size + 5" :x2="pad" :y2="size + 7" stroke="#B87333" stroke-width="0.5" />
      <line :x1="size + pad" :y1="size + 5" :x2="size + pad" :y2="size + 7" stroke="#B87333" stroke-width="0.5" />
      <text :x="size / 2 + pad" :y="size + 9" text-anchor="middle" fill="#B87333" font-size="2" font-family="sans-serif"
        font-weight="bold">{{ 2 * p }}mm</text>
      <!-- 槽口宽标注（右侧竖线） -->
      <line :x1="size + pad + 3" :y1="pad + p - bottle_neck" :x2="size + pad + 3" :y2="bottle_neck + p + pad"
        stroke="#B87333" stroke-width="0.5" />
      <line :x1="size + pad + 2" :y1="pad + p - bottle_neck" :x2="size + pad + 4" :y2="pad + p - bottle_neck"
        stroke="#B87333" stroke-width="0.5" />
      <line :x1="size + pad + 2" :y1="bottle_neck + p + pad" :x2="size + pad + 4" :y2="bottle_neck + p + pad"
        stroke="#B87333" stroke-width="0.5" />
      <text :x="size + pad + 9" :y="size / 2 + pad + 1" text-anchor="middle" fill="#B87333" font-size="2"
        font-family="sans-serif" transform="rotate(90, size+pad+8, size/2+pad+1)"> {{ 2 * bottle_neck }}mm</text>
    </svg>
    <p class="text-[10px] mt-1" style="color: #8A8580;">欧标{{ label }}L T-slot 截面</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/** 型材规格对应的属性 */
const props = defineProps<{
  profile: string // '2020' | '3030' | '4040'
}>()
const label = computed(() => props.profile)


/** 型材规格对应的半宽（SVG 坐标系用） */
const p = computed(() => {
  const map: Record<string, number> = { '2020': 10, '3030': 15, '4040': 20 }
  return map[props.profile] || 10
})

/** 型材规格对应的斜壁厚度 */
const slope_wall_thickness = computed(() => {
  const map: Record<string, number> = { '2020': 1.4, '3030': 2.2, '4040': 2.2 }
  return map[props.profile] || 1.4
})



/** 型材规格对应的截面尺寸 */
const centerHoleR = computed(() => p.value * 0.25)   // 中心孔半径 2.6

const pad = computed(() => { // 绘图外边距padding区域
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
const bottle_neck = computed(() => p.value * 0.315)   // 瓶颈 3.15

/**
 * SVG path —— 完整的四面 T-slot 梯形截面
 * 
 * 梯形槽腔特征：
 * - 开口/颈部：6.3mm（最窄，半宽 so=3.15）
 * - 斜壁扩宽 → 腔体底部：11mm（最宽，半宽 sb=5.5）
 * - 底部钩子：R0.6 圆弧（T-slot 螺母卡位）
 */
const outerPath = computed(() => {
  const h = p.value // 10
  const r = p.value * 0.075 // 四角圆角 R1.5
  const wall = p.value * 0.18
  const neck_depth = h * 0.63
  const max_neck_width = 1.1 * h
  const slope_wall = slope_wall_thickness.value / 1.414

  const x1 = h - neck_depth // = 10 - 6.3 = 3.7
  const x0 = x1 - slope_wall // 斜壁厚度1.4，开根号

  const x2 = max_neck_width / 2
  const x3 = x2 + slope_wall // 斜壁厚度1.4，开根号

  const x4 = h - wall // = 10 - 1.8 = 8.2
  const x5 = h // =10

  // 逆时针从左上角绘制
  // bug 这玩意纵坐标方向是向下的
  let d = `M ${-h + r} ${-h}`

  const edge = (a: number[], b: number[]) => {
    for (let i = 0; i < 11; i++) {
      d += `L ${a[i]} ${b[i]} `
    }
  }

  const x_neg = [-x5, -x4, -x4, -x3, -x1, -x1, -x3, -x4, -x4, -x5, -x5]
  const y_neg = [-x0, -x0, -x2, -x2, -x0, x0, x2, x2, x0, x0, x5 - r]
  const x_pos = [x5, x4, x4, x3, x1, x1, x3, x4, x4, x5, x5]
  const y_pos = [x0, x0, x2, x2, x0, -x0, -x2, -x2, -x0, -x0, -x5 + r]


  d += ` Q ${-h} ${-h} ${-h} ${-h + r}`  // 左上角
  edge(x_neg, y_neg) // 左边缘
  d += ` Q ${-h} ${h} ${-h + r} ${h}`// 左下角
  edge(y_neg, x_pos)   // 下边缘
  d += ` Q ${h} ${h} ${h} ${h - r}`  // 右下角
  edge(x_pos, y_pos)// 右边缘
  d += ` Q ${h} ${-h} ${h - r} ${-h}`  // 右上角
  edge(y_pos, x_neg)  // 顶边缘（槽朝下）：梯形


  d += ` Z`

  return d
})
</script>
