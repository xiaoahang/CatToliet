/**
 * 材料清单（BOM）计算模块
 * 
 * 根据用户配置参数，自动计算所需的所有材料和配件清单。
 * 所有面板尺寸均包含卡槽余量（+2×6.3mm），边缘卡入 T-slot 槽内固定。
 * 
 * 角码计算规则：
 * - 顶部四角：每角 2 个角码（双面固定），共 8 个
 * - 每层板：4 角 × 2 个 = 8 个角码
 * - 每个角码配 2 个 T 型螺母 + 2 个螺丝
 */

import { computed } from 'vue'
import type { CabinetConfig, MaterialItem } from '../types/cabinet'
import { PROFILE_SIZES, PANEL_PRICES } from '../config/constants'

export function useBill(config: CabinetConfig) {
  return computed<MaterialItem[]>(() => {
    const items: MaterialItem[] = []
    const profile = PROFILE_SIZES[config.profile]
    const pw = profile.w  // 型材截面宽度（20/30/40mm）

    // ===== 1. 立柱（4根垂直型材） =====
    items.push({
      name: `铝型材 ${config.profile}`,
      spec: `${config.height}mm × 4根`,
      position: '四角立柱',
      count: 4,
      unitPrice: profile.pricePerM * (config.height / 1000),
      total: Math.round(profile.pricePerM * (config.height / 1000) * 4 * 100) / 100,
    })

    // ===== 2. 顶部横梁（前后2根 + 左右2根） =====
    const tw = config.width - 2 * pw
    items.push({
      name: `铝型材 ${config.profile}`,
      spec: `${tw}mm × 2根 (横)`,
      position: '顶部前、后横梁',
      count: 2,
      unitPrice: profile.pricePerM * (tw / 1000),
      total: Math.round(profile.pricePerM * (tw / 1000) * 2 * 100) / 100,
    })
    const td = config.depth - 2 * pw
    items.push({
      name: `铝型材 ${config.profile}`,
      spec: `${td}mm × 2根 (纵)`,
      position: '顶部左、右纵梁',
      count: 2,
      unitPrice: profile.pricePerM * (td / 1000),
      total: Math.round(profile.pricePerM * (td / 1000) * 2 * 100) / 100,
    })

    // ===== 3. 层板型材横梁 =====
    if (config.hasShelf && config.shelfCount > 0) {
      const sw = config.width - 2 * pw
      const sd = config.depth - 2 * pw
      items.push({
        name: `铝型材 ${config.profile}`,
        spec: `${sw}mm × ${2 * config.shelfCount}根 (横)`,
        position: '层板前、后横梁',
        count: 2 * config.shelfCount,
        unitPrice: profile.pricePerM * (sw / 1000),
        total: Math.round(profile.pricePerM * (sw / 1000) * 2 * config.shelfCount * 100) / 100,
      })
      items.push({
        name: `铝型材 ${config.profile}`,
        spec: `${sd}mm × ${2 * config.shelfCount}根 (纵)`,
        position: '层板左、右纵梁',
        count: 2 * config.shelfCount,
        unitPrice: profile.pricePerM * (sd / 1000),
        total: Math.round(profile.pricePerM * (sd / 1000) * 2 * config.shelfCount * 100) / 100,
      })
    }

    // ===== 4. 角码连接件 =====
    // 顶部四角：每角 2 个角码（双面固定），共 8 个
    // 每增加一层板：4 角 × 2 个 = 8 个角码
    const bc = 8 + (config.hasShelf ? config.shelfCount * 8 : 0)
    items.push({
      name: '角码连接件',
      spec: `${config.profile}专用`,
      position: '顶部四角×2' + (config.hasShelf ? ' + 层板四角×2' : ''),
      count: bc,
      unitPrice: 2.5,
      total: bc * 2.5,
    })

    // ===== 5. T 型螺母 + 螺丝 =====
    // 每个角码需要 2 个 T 型螺母 + 2 个 M6 螺丝
    const sc = bc * 2
    items.push({
      name: 'T型螺母+螺丝',
      spec: 'M6×16mm',
      position: '全部连接点',
      count: sc,
      unitPrice: 0.8,
      total: sc * 0.8,
    })

    // ===== 6. 面板（前板/侧板/背板） =====
    if (config.panelMaterial !== 'none') {
      const pl = config.panelMaterial === 'acrylic-clear' ? '透明亚克力'
        : config.panelMaterial === 'acrylic-frosted' ? '磨砂亚克力' : '金属网'

      // T-slot 槽深 6.3mm — 面板边缘卡入槽内固定
      const SLOT_DEEP = 6.3
      // 面板尺寸 = 内开口宽 + 2×槽深（两边各伸入槽内 6.3mm）
      const panelW = config.width - 2 * pw + SLOT_DEEP * 2
      const panelD = config.depth - 2 * pw + SLOT_DEEP * 2

      const usableH = config.height - 2 * pw
      const shelfSpacing = config.hasShelf && config.shelfCount > 0 ? usableH / (config.shelfCount + 1) : 0
      const upperShelfY = pw + shelfSpacing * (config.shelfCount || 0)
      const upperH = config.height - upperShelfY - pw

      // ===== 6.1 顶板 =====
      const topArea = ((config.width - 2 * pw) * (config.depth - 2 * pw)) / 1000000
      if (config.topPanelType === 'wood-cover') {
        // 木质盖板：外尺寸覆盖整个框架顶部
        items.push({
          name: '顶板 (木质桌面盖板)',
          spec: `${Math.round(config.width)}×${Math.round(config.depth)}mm (覆盖式)`,
          position: '顶部覆盖',
          count: 1,
          unitPrice: 180 * topArea,
          total: Math.round(180 * topArea * 100) / 100,
        })
      } else {
        // 亚克力内嵌：开口 + 2×槽深，边缘卡入 T-slot 槽
        const acW = Math.round(config.width - 2 * pw + SLOT_DEEP * 2)
        const acD = Math.round(config.depth - 2 * pw + SLOT_DEEP * 2)
        items.push({
          name: '顶板 (亚克力内嵌)',
          spec: `${acW}×${acD}mm (嵌入式·卡槽)`,
          position: '顶部嵌装',
          count: 1,
          unitPrice: PANEL_PRICES['acrylic-clear'] * topArea,
          total: Math.round(PANEL_PRICES['acrylic-clear'] * topArea * 100) / 100,
        })
      }

      // ===== 6.2 前板 =====
      if (upperH > 0) {
        const frontArea = (upperH * panelW) / 1000000
        items.push({
          name: `前板 (${pl})`,
          spec: `${Math.round(panelW)}×${Math.round(upperH)}mm (顶层·带拱形洞口·卡槽)`,
          position: '正面上层入口',
          count: 1,
          unitPrice: PANEL_PRICES[config.panelMaterial] * frontArea,
          total: Math.round(PANEL_PRICES[config.panelMaterial] * frontArea * 100) / 100,
        })
      }

      // 中层前板（层板之间的全封闭前板）
      if (config.hasShelf && config.shelfCount >= 2) {
        const midH = shelfSpacing
        const midFrontArea = (midH * panelW) / 1000000
        const midCount = config.shelfCount - 1
        if (midCount > 0 && midFrontArea > 0) {
          items.push({
            name: `前板 (${pl})`,
            spec: `${Math.round(panelW)}×${Math.round(midH)}mm (中层·完整·卡槽)`,
            position: `正面中层×${midCount}`,
            count: midCount,
            unitPrice: PANEL_PRICES[config.panelMaterial] * midFrontArea,
            total: Math.round(PANEL_PRICES[config.panelMaterial] * midFrontArea * midCount * 100) / 100,
          })
        }
      }

      // ===== 6.3 侧板 =====
      if (upperH > 0) {
        items.push({
          name: `侧板 (${pl})`,
          spec: `${Math.round(upperH)}×${Math.round(panelD)}mm (上层·卡槽)`,
          position: '上层左右两侧',
          count: 2,
          unitPrice: PANEL_PRICES[config.panelMaterial] * (upperH * panelD / 1000000),
          total: Math.round(PANEL_PRICES[config.panelMaterial] * (upperH * panelD / 1000000) * 2 * 100) / 100,
        })
      }

      // ===== 6.4 背板 =====
      if (upperH > 0) {
        items.push({
          name: `背板 (${pl})`,
          spec: `${Math.round(panelW)}×${Math.round(upperH)}mm (上层·卡槽)`,
          position: '上层背面',
          count: 1,
          unitPrice: PANEL_PRICES[config.panelMaterial] * (upperH * panelW / 1000000),
          total: Math.round(PANEL_PRICES[config.panelMaterial] * (upperH * panelW / 1000000) * 100) / 100,
        })
      }

      // ===== 6.5 各层高度列表 =====
      if (config.hasShelf && config.shelfCount > 0) {
        for (let i = 0; i < config.shelfCount; i++) {
          const layerH = Math.round(shelfSpacing)
          const layerNum = config.shelfCount - i  // 从上往下数：顶层=第 shelfCount 层
          items.push({
            name: `第${layerNum}层高度`,
            spec: `${layerH}mm`,
            position: `层板间距`,
            count: 1,
            unitPrice: 0,
            total: 0,
          })
        }
      }
    }

    // ===== 7. 层板（金属网漏砂板） =====
    if (config.hasShelf) {
      const sw = Math.round((config.width - 2 * pw - 2) * 0.5)
      const sD = config.depth - 2 * pw - 2
      items.push({
        name: '层板 (金属网漏砂)',
        spec: `${sw}×${Math.round(sD)}mm (半宽${config.shelfCount > 1 ? '·交错' : ''})`,
        position: '内部隔层',
        count: config.shelfCount,
        unitPrice: PANEL_PRICES['mesh'] * (sw * sD / 1000000),
        total: Math.round(PANEL_PRICES['mesh'] * (sw * sD / 1000000) * config.shelfCount * 100) / 100,
      })
    }

    // ===== 8. 万向轮 =====
    if (config.hasWheels) {
      items.push({ name: '万向轮 (带刹车)', spec: '工业脚轮 M8×2', position: '底部前左 + 前右', count: 2, unitPrice: 15, total: 30 })
      items.push({ name: '万向轮 (无刹车)', spec: '工业脚轮 M8×2', position: '底部后左 + 后右', count: 2, unitPrice: 12, total: 24 })
    }

    return items
  })
}

/** 计算材料清单总价 */
export function useTotalPrice(bill: ReturnType<typeof useBill>) {
  return computed(() => Math.round(bill.value.reduce((s, i) => s + i.total, 0) * 100) / 100)
}

/** 估算总重量（基于型材线密度 + 配件） */
export function useTotalWeight(config: CabinetConfig) {
  return computed(() => {
    const pw = PROFILE_SIZES[config.profile]
    const wMap: Record<string, number> = { '2020': 0.6, '3030': 1.2, '4040': 2.0 }
    // 所有型材总长度（米）
    let tl = (config.height * 4 + (config.width - 2 * pw.w) * 2 + (config.depth - 2 * pw.w) * 2) / 1000
    if (config.hasShelf) {
      tl += ((config.width - 2 * pw.w) * 2 + (config.depth - 2 * pw.w) * 2) * config.shelfCount / 1000
    }
    let w = tl * wMap[config.profile]
    if (config.hasWheels) w += 1.2
    return Math.round(w * 10) / 10
  })
}
