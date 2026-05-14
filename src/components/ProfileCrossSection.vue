<template>
  <div class="mt-3 flex flex-col items-center">
    <svg :viewBox="viewBox" class="w-full max-w-[180px]" style="aspect-ratio: 1;">
      <!-- 将坐标系原点移到型材中心，确保完整截面可见 -->
      <g :transform="groupTransform">
        <!-- 型材外轮廓：正方形 + 四面 T-slot 梯形槽 + 四角圆角 -->
        <path :d="outerPath" fill="#B8B8B8" stroke="#444" stroke-width="0.4" />
        <!-- 中心 Ø5.2mm 通孔 -->
        <circle cx="0" cy="0" :r="spec.centerHoleR" fill="#2A2520" stroke="#666" stroke-width="0.3" />
      </g>
      <!-- 尺寸标注 -->
      <!-- 外形宽度标注（下方横线） -->
      <text font-size=2>outerSize{{ outerSize }} pad{{ pad }}</text> 
      <line :x1="pad" :y1="outerSize + pad  +2" :x2="outerSize + pad" :y2="outerSize + 6" stroke="#B87333" stroke-width="0.5" />
      <line :x1="pad" :y1="outerSize + 5" :x2="pad" :y2="outerSize + 7" stroke="#B87333" stroke-width="0.5" />
      <line :x1="outerSize + pad" :y1="outerSize + 5" :x2="outerSize + pad" :y2="outerSize + 7" stroke="#B87333" stroke-width="0.5" />
      <text :x="outerSize / 2 + pad" :y="outerSize + 10" text-anchor="middle" fill="#B87333" font-size="2" font-family="sans-serif" font-weight="bold">
        {{ 2 * spec.p }}mm
      </text>

      <!-- 槽口宽标注（右侧竖线） -->
      <line :x1="outerSize + pad + 3" :y1="pad + spec.p - bottleNeck" :x2="outerSize + pad + 3" :y2="bottleNeck + spec.p + pad" stroke="#B87333" stroke-width="0.5" />
      <line :x1="outerSize + pad + 2" :y1="pad + spec.p - bottleNeck" :x2="outerSize + pad + 4" :y2="pad + spec.p - bottleNeck" stroke="#B87333" stroke-width="0.5" />
      <line :x1="outerSize + pad + 2" :y1="bottleNeck + spec.p + pad" :x2="outerSize + pad + 4" :y2="bottleNeck + spec.p + pad" stroke="#B87333" stroke-width="0.5" />
      <text :x="outerSize + pad + 9" :y="outerSize / 2 + pad + 1" text-anchor="middle" fill="#B87333" font-size="2" font-family="sans-serif"
        :transform="`rotate(90, ${outerSize + pad + 8}, ${outerSize / 2 + pad + 1})`">
        {{ 2 * bottleNeck }}mm
      </text>
    </svg>
    <p class="text-[10px] mt-1" style="color: #8A8580;">欧标{{ spec.label }}L T-slot 截面</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ProfileSpec {
  label: string
  p: number        // 半宽
  h: number        // 半高（等于 p）
  wallThickness: number
  pad: number      // SVG 绘图边距
  centerHoleR: number
}

const PROFILE_MAP: Record<string, Omit<ProfileSpec, 'label' | 'h' | 'centerHoleR'>> = {
  '2020': { p: 10, wallThickness: 1.4, pad: 4 },
  '3030': { p: 15, wallThickness: 2.2, pad: 6 },
  '4040': { p: 20, wallThickness: 2.2, pad: 8 },
}

const props = defineProps<{
  profile: string // '2020' | '3030' | '4040'
}>()

const spec = computed<ProfileSpec>(() => {
  const base = PROFILE_MAP[props.profile] ?? PROFILE_MAP['2020']
  return {
    label: props.profile,
    ...base,
    h: base.p,
    centerHoleR: base.p * 0.25,
  }
})

const pad = computed(() => spec.value.pad)
const outerSize = computed(() => spec.value.p * 2)
const viewBox = computed(() => `0 0 ${outerSize.value + pad.value * 2 + 10} ${outerSize.value + pad.value * 2 + 7}`)
const groupTransform = computed(() => `translate(${spec.value.p + pad.value}, ${spec.value.p + pad.value})`)
const bottleNeck = computed(() => spec.value.p * 0.315)

/** 生成单条边缘的点序列（左上 → 左下、左下 → 右下、右下 → 右上、右上 → 左上） */
function buildOuterPath(h: number, r: number, wall: number, slopeWall: number): string {
  const neckDepth = h * 0.63
  const maxNeckWidth = h * 1.1

  // 关键 x 坐标（从中心向外）
  const x0 = (h - neckDepth) - slopeWall   // 槽口内侧
  const x1 = h - neckDepth                 // 槽底内侧
  const x2 = maxNeckWidth / 2              // 槽腔半宽
  const x3 = x2 + slopeWall                // 槽腔外侧
  const x4 = h - wall                      // 外壁内侧
  const x5 = h                             // 外轮廓

  // 四角圆角辅助函数
  const corner = (sx: number, sy: number, ex: number, ey: number) =>
    `Q ${sx} ${sy} ${ex} ${ey}`

  // 单条边缘的 polyline：接收 11 个 [x, y] 点，生成 "L x y ..."
  const edge = (pts: [number, number][]) =>
    pts.map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')

  // 逆时针方向：左上 → 左下 → 右下 → 右上 → 回到左上
  // 每条边包含两个对称的 T-slot 槽（上下槽或左右槽）
  const leftEdge: [number, number][] = [
    [-x5, -x0],
    [-x4, -x0],
    [-x4, -x2],
    [-x3, -x2],
    [-x1, -x0],
    [-x1,  x0],
    [-x3,  x2],
    [-x4,  x2],
    [-x4,  x0],
    [-x5,  x0],
    [-x5,  x5 - r],
  ]

  const bottomEdge: [number, number][] = [
    [-x0,  x5],
    [-x0,  x4],
    [-x2,  x4],
    [-x2,  x3],
    [-x0,  x1],
    [ x0,  x1],
    [ x2,  x3],
    [ x2,  x4],
    [ x0,  x4],
    [ x0,  x5],
    [ x5 - r, x5],
  ]

  const rightEdge: [number, number][] = [
    [ x5,  x0],
    [ x4,  x0],
    [ x4,  x2],
    [ x3,  x2],
    [ x1,  x0],
    [ x1, -x0],
    [ x3, -x2],
    [ x4, -x2],
    [ x4, -x0],
    [ x5, -x0],
    [ x5, -x5 + r],
  ]

  const topEdge: [number, number][] = [
    [ x0, -x5],
    [ x0, -x4],
    [ x2, -x4],
    [ x2, -x3],
    [ x0, -x1],
    [-x0, -x1],
    [-x2, -x3],
    [-x2, -x4],
    [-x0, -x4],
    [-x0, -x5],
    [-x5 + r, -x5],
  ]

  // 从左上角圆角开始，逆时针闭合
  return [
    `M ${(-h + r).toFixed(2)} ${-h}`,
    corner(-h, -h, -h, -h + r),
    edge(leftEdge),
    corner(-h, h, -h + r, h),
    edge(bottomEdge),
    corner(h, h, h, h - r),
    edge(rightEdge),
    corner(h, -h, h - r, -h),
    edge(topEdge),
    'Z',
  ].join(' ')
}

const outerPath = computed(() => {
  const { p: h, wallThickness } = spec.value
  const r = h * 0.075
  const wall = h * 0.18
  const slopeWall = wallThickness / 1.414

  return buildOuterPath(h, r, wall, slopeWall)
})
</script>
