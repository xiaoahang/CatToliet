// ---------1. 型材参数 ---------------------------------------------
// 尺寸参数
export const DIMENSIONS = [
  { key: 'width' as const, label: '宽度 (mm)', min: 300, max: 1200 },
  { key: 'height' as const, label: '高度 (mm)', min: 300, max: 1500 },
  { key: 'depth' as const, label: '深度 (mm)', min: 300, max: 800 },
]

// 型材规格

export const PROFILES = ['2020', '3030', '4040'] as const

// 型材颜色
export const COLORS = [
  { value: 'silver-white' as const, label: '银白色', color: '#E8E8E8' },
  { value: 'black' as const, label: '黑色', color: '#1A1A1A' },
  { value: 'gold' as const, label: '金色', color: '#D4956A' },
]

// ---------2. 板材参数 ---------------------------------------------
// 板材材质
export const PANEL_MATERIALS = [
  { value: 'acrylic-clear' as const, label: '透明亚克力' },
  { value: 'acrylic-frosted' as const, label: '磨砂亚克力' },
  { value: 'mesh' as const, label: '金属网' },
  { value: 'none' as const, label: '无' },
]

// 顶板材质
export const TOP_PANEL_TYPES = [
  { value: 'wood-cover' as const, label: '木质桌面盖板' },
  { value: 'acrylic-inset' as const, label: '亚克力板内嵌' },
]


// ---------3. 材料清单 ---------------------------------------------
export const TABLE_HEADERS = [
  { key: 'name', label: '材料名称', align: 'text-left' },
  { key: 'spec', label: '规格', align: 'text-left' },
  { key: 'position', label: '用途/位置', align: 'text-left' },
  { key: 'count', label: '数量', align: 'text-center' },
  { key: 'unitPrice', label: '单价', align: 'text-right' },
  { key: 'total', label: '小计', align: 'text-right' },
]

// 交互
// 开关按钮
export function activeButtonStyle(active: boolean) {
  return {
    backgroundColor: active ? '#B87333' : 'rgba(245,240,235,0.04)',
    color: active ? '#F5F0EB' : '#8A8580',
    border: `1px solid ${active ? '#B87333' : 'rgba(245,240,235,0.08)'}`,
  }
}
// 滑块bar
export function sliderBg(value: number, min: number, max: number) {
  const pct = ((value - min) / (max - min)) * 100
  return `linear-gradient(to right, #B87333 0%, #B87333 ${pct}%, rgba(245,240,235,0.1) ${pct}%)`
}

export function shelfSliderBg(count: number) {
  const pct = ((count - 1) / 3) * 100
  return `linear-gradient(to right, #B87333 0%, #B87333 ${pct}%, rgba(245,240,235,0.1) ${pct}%)`
}
