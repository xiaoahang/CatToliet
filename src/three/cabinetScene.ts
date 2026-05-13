/**
 * 猫砂柜 3D 场景构建模块
 * 
 * 本文件负责根据用户配置参数，使用 Three.js 构建完整的铝型材猫砂柜 3D 模型。
 * 核心功能：
 * - T-slot 铝型材截面生成（欧标 2020L，梯形槽腔：开口6.3mm → 腔体11mm）
 * - 型材拉伸：4根立柱 + 顶部4根横梁 + 每层4根层板横梁
 * - 顶板渲染：木质盖板（外尺寸覆盖）或 亚克力内嵌（卡槽式）
 * - 隔间面板：前板（顶层带拱形猫门）、侧板、背板
 * - 层板：交错半宽金属网漏砂板
 * - 万向轮：2带刹车（前）+ 2不带刹车（后）
 * 
 * 坐标系说明：
 * - Y轴向上，柜体中心在 Y=0，底部在 Y=-halfH，顶部在 Y=halfH
 * - 立柱中心位于四角：(±colX, 0, ±colZ)
 * - 横梁顶部与立柱顶端齐平：y = halfH - p/2
 */

import * as THREE from 'three'
import type { CabinetConfig } from '../types/cabinet'
import { COLOR_MAP } from '../config/constants'

// ═══════════════════════════════════════════════════════════════
//  T-Slot 截面 Shape 缓存
// ═══════════════════════════════════════════════════════════════
const shapeCache = new Map<number, THREE.Shape>()

/**
 * 创建欧标 T-slot 铝型材截面 Shape
 * 
 * 基于欧标 2020L 图纸参数：
 * - 外形：20×20mm 正方形，四角 R1.5mm 圆角
 * - 壁厚：1.4mm
 * - T-slot 槽（梯形腔体）：
 *   · 开口（最窄处）：6.3mm（半宽 3.15mm）
 *   · 颈部深度：1.8mm（从外表面到腔体开始的距离）
 *   · 腔体最宽处：11mm（半宽 5.5mm）
 *   · 槽总深度：6.3mm（从外表面到槽底的距离）
 *   · 底部钩子：R0.6mm 圆弧（T-slot 螺母卡位）
 * - 中心通孔：Ø5.2mm
 * 
 * 四面各有一个 T-slot 槽，形成标准的工业铝型材截面。
 * 槽腔为梯形：开口 6.3mm（窄）→ 斜壁 → 底部 11mm（宽）。
 */
function createTSlotShape(p: number): THREE.Shape {
  const half = p / 2              // 型材半宽（2020=10mm）
  const cr = 0.075 * p            // 四角圆角半径 R1.5mm
  const so = 0.1575 * p           // 槽口半宽 = 6.3/2 = 3.15mm（最窄处）
  const wall = 0.09 * p           // 壁厚 1.4mm
  const sb = 0.275 * p            // 槽腔底部半宽 = 11/2 = 5.5mm（最宽处）
  const slotDepth = 0.315 * p     // 槽深 6.3mm（从外表面到槽底）
  const sBot = half - slotDepth   // 槽底距中心的坐标 = 10 - 6.3 = 3.7mm
  const hk = 0.03 * p             // 钩子圆弧外凸量 ~0.6mm
  const chr = 0.13 * p            // 中心通孔半径 = 5.2/2 = 2.6mm
  const iw = half - wall          // 内壁面坐标 = 10 - 1.4 = 8.6mm

  const sh = new THREE.Shape()

  // ===== 从左上角开始，顺时针绘制 =====
  sh.moveTo(-half + cr, half)
  sh.quadraticCurveTo(-half, half, -half, half - cr)  // 左上角圆弧

  // ---- 左边缘：T-slot 槽开口朝右（+X 方向） ----
  // 槽腔为梯形：开口 6.3mm（窄）→ 斜壁 → 底部 11mm（宽）
  sh.lineTo(-half, so)           // 外表面到槽口上沿
  sh.lineTo(-iw, so)             // 颈部（宽=6.3mm，最窄处，深度1.8mm）
  // 梯形斜壁：从颈部（窄）扩宽到腔体底部（宽）
  sh.lineTo(-sBot - hk, sb)      // 斜线到达腔体底部上沿（宽=11mm，最宽处）
  sh.lineTo(-sBot, sb - hk)      // 底部钩子圆弧上沿
  sh.lineTo(-sBot, -sb + hk)     // 穿过槽底（从最宽处横贯）
  sh.lineTo(-sBot - hk, -sb)     // 底部钩子圆弧下沿
  sh.lineTo(-iw, -so)            // 斜壁收窄回到颈部下沿（回到6.3mm窄口）
  sh.lineTo(-half, -so)          // 回到外表面
  sh.lineTo(-half, -half + cr)   // 到左下角

  // 左下角圆弧
  sh.quadraticCurveTo(-half, -half, -half + cr, -half)

  // ---- 底边缘：T-slot 槽开口朝上（+Y 方向） ----
  sh.lineTo(-so, -half)
  sh.lineTo(-so, -iw)            // 颈部（窄）
  sh.lineTo(-sb, -iw)            // 斜壁扩宽
  sh.lineTo(-sb, -sBot - hk)     // 腔体底部（宽）
  sh.lineTo(-sb + hk, -sBot)     // 钩子
  sh.lineTo(sb - hk, -sBot)      // 横贯槽底
  sh.lineTo(sb, -sBot - hk)      // 钩子
  sh.lineTo(sb, -iw)             // 斜壁收窄
  sh.lineTo(so, -iw)             // 颈部
  sh.lineTo(so, -half)
  sh.lineTo(half - cr, -half)    // 到右下角

  // 右下角圆弧
  sh.quadraticCurveTo(half, -half, half, -half + cr)

  // ---- 右边缘：T-slot 槽开口朝左（-X 方向） ----
  sh.lineTo(half, -so)
  sh.lineTo(iw, -so)             // 颈部（窄）
  sh.lineTo(sBot + hk, -sb)      // 斜壁扩宽到腔体（宽）
  sh.lineTo(sBot, -sb + hk)      // 钩子
  sh.lineTo(sBot, sb - hk)       // 横贯槽底
  sh.lineTo(sBot + hk, sb)       // 钩子
  sh.lineTo(iw, so)              // 斜壁收窄
  sh.lineTo(half, so)            // 颈部
  sh.lineTo(half, half - cr)     // 到右上角

  // 右上角圆弧
  sh.quadraticCurveTo(half, half, half - cr, half)

  // ---- 顶边缘：T-slot 槽开口朝下（-Y 方向） ----
  sh.lineTo(so, half)
  sh.lineTo(so, iw)              // 颈部（窄）
  sh.lineTo(sb, iw)              // 斜壁扩宽
  sh.lineTo(sb, sBot + hk)       // 腔体底部（宽）
  sh.lineTo(sb - hk, sBot)       // 钩子
  sh.lineTo(-sb + hk, sBot)      // 横贯槽底
  sh.lineTo(-sb, sBot + hk)      // 钩子
  sh.lineTo(-sb, iw)             // 斜壁收窄
  sh.lineTo(-so, iw)             // 颈部
  sh.lineTo(-so, half)
  sh.lineTo(-half + cr, half)    // 闭合到起点

  // 中心 Ø5.2mm 通孔（安装 T-slot 螺母用）
  const hole = new THREE.Path()
  hole.absarc(0, 0, chr, 0, Math.PI * 2, true)
  sh.holes.push(hole)

  return sh
}

/** 带缓存的 T-slot Shape 获取 */
function getTSlotShape(p: number): THREE.Shape {
  if (!shapeCache.has(p)) {
    shapeCache.set(p, createTSlotShape(p))
  }
  return shapeCache.get(p)!
}

// ═══════════════════════════════════════════════════════════════
//  材质定义
// ═══════════════════════════════════════════════════════════════
let gridTexCache: THREE.CanvasTexture | null = null

/** 
 * 生成金属网孔纹理（用于层板和金属网面板）
 * 使用 Canvas 绘制方孔网格图案，作为金属网贴图
 */
export function getGridTex(): THREE.CanvasTexture {
  if (gridTexCache) return gridTexCache
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#e8e8e8'
  ctx.fillRect(0, 0, size, size)
  const gridSize = 100
  const holeSize = 80
  const gap = (gridSize - holeSize) / 2
  ctx.fillStyle = '#1a1a1a'
  for (let x = 0; x < size; x += gridSize) {
    for (let y = 0; y < size; y += gridSize) {
      ctx.fillRect(x + gap, y + gap, holeSize, holeSize)
    }
  }
  gridTexCache = new THREE.CanvasTexture(canvas)
  gridTexCache.wrapS = gridTexCache.wrapT = THREE.RepeatWrapping
  gridTexCache.repeat.set(6, 6)
  return gridTexCache
}

/**
 * 根据配置构建所有 Three.js 材质
 * - frameMat: 铝型材金属材质（根据颜色选择银白/黑/金）
 * - panelMat: 面板材质（透明亚克力/磨砂亚克力/金属网/无）
 * - shelfMat: 层板金属网材质
 */
export function buildMaterials(config: CabinetConfig) {
  const c = COLOR_MAP[config.color]
  const frameMat = new THREE.MeshStandardMaterial({
    color: c,
    metalness: config.color === 'gold' ? 0.75 : 0.6,
    roughness: config.color === 'gold' ? 0.25 : 0.35,
  })

  let panelMat: THREE.Material | null = null
  if (config.panelMaterial === 'mesh') {
    panelMat = new THREE.MeshStandardMaterial({
      map: getGridTex(),
      metalness: 0.1,
      roughness: 0.6,
      side: THREE.DoubleSide,
    })
  } else if (config.panelMaterial !== 'none') {
    const isClear = config.panelMaterial === 'acrylic-clear'
    panelMat = new THREE.MeshPhysicalMaterial({
      color: '#E8E8E8',
      metalness: 0,
      side: THREE.DoubleSide,
      roughness: isClear ? 0.02 : 0.6,
      transparent: true,
      opacity: isClear ? 0.05 : 0.35,
      transmission: isClear ? 0.95 : 0.55,
      thickness: 0.03,
      depthWrite: false,
      ior: 1.5,
    })
  }

  const shelfMat = new THREE.MeshStandardMaterial({
    map: getGridTex(),
    metalness: 0.1,
    roughness: 0.6,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  })

  return { frameMat, panelMat, shelfMat }
}

// ═══════════════════════════════════════════════════════════════
//  T-Slot 型材拉伸网格工厂
// ═══════════════════════════════════════════════════════════════
/**
 * 将 T-slot 截面 Shape 沿指定轴拉伸，生成一根型材网格
 * 
 * @param group   父级 Three.js Group
 * @param p       型材规格（20/30/40mm 转换为米）
 * @param length  型材长度（米）
 * @param pos     型材中心位置 [x, y, z]（米）
 * @param axis    拉伸方向：'y'=立柱（垂直）, 'x'=前后横梁, 'z'=左右横梁
 * @param material 材质
 */
function addProfile(
  group: THREE.Group,
  p: number,
  length: number,
  pos: [number, number, number],
  axis: 'x' | 'y' | 'z',
  material: THREE.Material,
) {
  const shape = getTSlotShape(p)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: length,
    bevelEnabled: false,
    curveSegments: 20,
  })
  const mesh = new THREE.Mesh(geo, material)
  mesh.castShadow = true

  if (axis === 'y') {
    // 垂直立柱：截面在 XZ 平面，沿 +Y 方向拉伸
    // 旋转使截面从 XY 平面转到 XZ 平面
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(pos[0], pos[1] - length / 2, pos[2])
  } else if (axis === 'x') {
    // 前后横梁（沿 X 方向）：截面在 YZ 平面
    mesh.rotation.y = Math.PI / 2
    mesh.position.set(pos[0] - length / 2, pos[1], pos[2])
  } else {
    // 左右横梁（沿 Z 方向）：截面在 XY 平面，无需旋转
    mesh.position.set(pos[0], pos[1], pos[2] - length / 2)
  }

  group.add(mesh)
}

// ═══════════════════════════════════════════════════════════════
//  主入口：构建完整猫砂柜
// ═══════════════════════════════════════════════════════════════
export function buildCabinet(config: CabinetConfig): THREE.Group {
  const { frameMat, panelMat, shelfMat } = buildMaterials(config)
  // 型材规格转换为米（2020=0.02m, 3030=0.03m, 4040=0.04m）
  const p = (config.profile === '2020' ? 20 : config.profile === '3030' ? 30 : 40) / 1000
  const W = config.width / 1000    // 柜体宽度（米）
  const H = config.height / 1000   // 柜体高度（米）
  const D = config.depth / 1000    // 柜体深度（米）
  const halfH = H / 2              // 半高，用于定位

  const group = new THREE.Group()

  // ── 1. 四根垂直立柱 ──
  // 立柱中心位于四角，距边缘 p/2（型材中心到外表面的距离）
  const colX = W / 2 - p / 2
  const colZ = D / 2 - p / 2
  const colPositions: [number, number][] = [
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ]
  colPositions.forEach(([sx, sz]) => {
    addProfile(
      group, p, H,
      [sx * colX, 0, sz * colZ],
      'y', frameMat,
    )
  })

  // ── 2. 顶部四根横梁 ──
  // 横梁上表面与立柱顶端齐平：y = halfH - p/2
  const beamY = halfH - p / 2
  // 前后横梁（沿 X 方向）
  addProfile(group, p, W - 2 * p, [0, beamY, -colZ], 'x', frameMat)
  addProfile(group, p, W - 2 * p, [0, beamY,  colZ], 'x', frameMat)
  // 左右纵梁（沿 Z 方向）
  addProfile(group, p, D - 2 * p, [-colX, beamY, 0], 'z', frameMat)
  addProfile(group, p, D - 2 * p, [ colX, beamY, 0], 'z', frameMat)

  // ── 3. 层板系统 ──
  const shelfLevels: number[] = []
  if (config.hasShelf) {
    for (let i = 0; i < config.shelfCount; i++) {
      // 层板在可用高度内均匀分布（不含底部开口区域）
      const yPos = -halfH + p + ((H - 2 * p) / (config.shelfCount + 1)) * (i + 1)
      shelfLevels.push(yPos)

      // 每层层板由 4 根型材横梁组成（前后左右）
      addProfile(group, p, W - 2 * p, [0, yPos, -colZ], 'x', frameMat)
      addProfile(group, p, W - 2 * p, [0, yPos,  colZ], 'x', frameMat)
      addProfile(group, p, D - 2 * p, [-colX, yPos, 0], 'z', frameMat)
      addProfile(group, p, D - 2 * p, [ colX, yPos, 0], 'z', frameMat)

      // 层板板面：交错半宽金属网（左→右→左→右，便于猫咪跳跃时漏砂）
      const isLeft = i % 2 === 0
      const shelfW = (W - 2 * p - 0.01) * 0.5
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(shelfW, 0.02, D - 2 * p - 0.01),
        shelfMat,
      )
      plate.position.set(isLeft ? -shelfW / 2 : shelfW / 2, yPos, 0)
      group.add(plate)

      // 层板边缘加强条
      const edgeGeo = new THREE.BoxGeometry(0.008, 0.025, D - 2 * p - 0.01)
      const le = new THREE.Mesh(edgeGeo, shelfMat)
      le.position.set((isLeft ? -shelfW / 2 : shelfW / 2) - shelfW / 2, yPos, 0)
      group.add(le)
      const re = new THREE.Mesh(edgeGeo, shelfMat)
      re.position.set((isLeft ? -shelfW / 2 : shelfW / 2) + shelfW / 2, yPos, 0)
      group.add(re)
    }
  }

  // ── 4. 万向轮 ──
  if (config.hasWheels) {
    addCasters(group, colPositions, W, D, halfH, p)
  }

  // ── 5. 顶板 ──
  addTopPanel(group, config, W, D, halfH, p)

  // ── 6. 隔间面板（前/侧/背板）──
  addCompartmentPanels(group, config, W, H, D, halfH, p, shelfLevels, panelMat)

  return group
}

// ═══════════════════════════════════════════════════════════════
//  万向轮渲染
// ═══════════════════════════════════════════════════════════════
/**
 * 在立柱底部添加工业万向轮
 * 布局：前左+前右 = 带刹车（橙色刹车片），后左+后右 = 无刹车
 */
function addCasters(
  group: THREE.Group,
  cols: [number, number][],
  W: number,
  D: number,
  halfH: number,
  p: number,
) {
  const mountMat = new THREE.MeshStandardMaterial({ color: '#999', metalness: 0.95, roughness: 0.1 })
  const stemMat = new THREE.MeshStandardMaterial({ color: '#888', metalness: 0.85, roughness: 0.15 })
  const forkMat = new THREE.MeshStandardMaterial({ color: '#ccc', metalness: 0.9, roughness: 0.15 })
  const brakeMat = new THREE.MeshStandardMaterial({ color: '#B87333', metalness: 0.7, roughness: 0.3 })
  const wheelMat = new THREE.MeshStandardMaterial({ color: '#555', metalness: 0.3, roughness: 0.7 })
  const hubMat = new THREE.MeshStandardMaterial({ color: '#aaa', metalness: 0.9, roughness: 0.1 })

  cols.forEach(([sx, sz]) => {
    const isFront = sz > 0          // 前方（猫砂柜正面）
    const hasBrake = isFront        // 前面两个轮子带刹车
    const cx = sx * (W / 2 - p / 2)
    const cz = sz * (D / 2 - p / 2)

    // 安装盘（连接型材底部）
    const mount = new THREE.Mesh(new THREE.CylinderGeometry(p * 0.85, p * 0.7, 0.008, 8), mountMat)
    mount.position.set(cx, -halfH - 0.005, cz)
    group.add(mount)

    // 轮轴杆
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.018, 12), stemMat)
    stem.position.set(cx, -halfH - 0.018, cz)
    group.add(stem)

    // 轮叉（Y 形支架）
    const fork = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.035, 0.012), forkMat)
    fork.position.set(cx, -halfH - 0.04, cz)
    group.add(fork)

    // 刹车片（仅前面两轮）
    if (hasBrake) {
      const brake = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.008, 0.018), brakeMat)
      brake.position.set(cx + 0.025, -halfH - 0.03, cz)
      group.add(brake)
    }

    // 橡胶轮
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.008, 8, 20), wheelMat)
    wheel.position.set(cx, -halfH - 0.055, cz)
    wheel.rotation.y = Math.PI / 2
    group.add(wheel)

    // 轮毂
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.022, 8), hubMat)
    hub.position.set(cx, -halfH - 0.055, cz)
    hub.rotation.x = Math.PI / 2
    group.add(hub)
  })
}

// ═══════════════════════════════════════════════════════════════
//  顶板渲染
// ═══════════════════════════════════════════════════════════════
/**
 * 渲染柜体顶板
 * - 木质盖板：外尺寸 W×D，覆盖在整个框架顶部，厚度 12mm
 * - 亚克力内嵌：嵌入顶部横梁的 T-slot 槽内，顶面与横梁齐平
 */
function addTopPanel(
  group: THREE.Group,
  config: CabinetConfig,
  W: number,
  D: number,
  halfH: number,
  p: number,
) {
  if (config.topPanelType === 'wood-cover') {
    // 木质桌面盖板：覆盖整个框架外尺寸
    const woodThick = 0.012
    const wood = new THREE.Mesh(
      new THREE.BoxGeometry(W, woodThick, D),
      new THREE.MeshStandardMaterial({ color: '#8B6914', roughness: 0.7, metalness: 0.05 }),
    )
    wood.position.set(0, halfH + woodThick / 2, 0)
    wood.castShadow = true
    group.add(wood)
  } else {
    // 亚克力内嵌板：顶面与横梁顶面齐平（y = halfH - acThick/2）
    const acThick = 0.012
    const acMat = new THREE.MeshPhysicalMaterial({
      color: '#E8F0FF',
      metalness: 0,
      roughness: 0.08,
      transparent: true,
      opacity: 0.4,
      transmission: 0.75,
      thickness: 0.03,
      side: THREE.DoubleSide,
      depthWrite: false,
      ior: 1.5,
    })

    // 亚克力板尺寸略小于开口，留出间隙嵌入槽内
    const insetGap = 0.004
    const ac = new THREE.Mesh(
      new THREE.BoxGeometry(W - 2 * p - insetGap, acThick, D - 2 * p - insetGap),
      acMat,
    )
    ac.position.set(0, halfH - acThick / 2, 0)
    group.add(ac)

    // 极细边缘高光线条（仅作边界提示，避免"两层"视觉）
    const edgeMat = new THREE.MeshStandardMaterial({
      color: '#C0D0E0',
      metalness: 0.3,
      roughness: 0.2,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    })
    const edgeThick = 0.001

    const ef = new THREE.Mesh(new THREE.BoxGeometry(W - 2 * p - insetGap, edgeThick, edgeThick), edgeMat)
    ef.position.set(0, halfH - acThick / 2, D / 2 - p - insetGap / 2)
    group.add(ef)

    const eb = new THREE.Mesh(new THREE.BoxGeometry(W - 2 * p - insetGap, edgeThick, edgeThick), edgeMat)
    eb.position.set(0, halfH - acThick / 2, -(D / 2 - p - insetGap / 2))
    group.add(eb)

    const el = new THREE.Mesh(new THREE.BoxGeometry(edgeThick, edgeThick, D - 2 * p - insetGap), edgeMat)
    el.position.set(-(W / 2 - p - insetGap / 2), halfH - acThick / 2, 0)
    group.add(el)

    const er = new THREE.Mesh(new THREE.BoxGeometry(edgeThick, edgeThick, D - 2 * p - insetGap), edgeMat)
    er.position.set(W / 2 - p - insetGap / 2, halfH - acThick / 2, 0)
    group.add(er)
  }
}

// ═══════════════════════════════════════════════════════════════
//  隔间面板渲染（前板/侧板/背板）
// ═══════════════════════════════════════════════════════════════
/**
 * 渲染猫砂柜各隔间的面板
 * 
 * 结构说明（以 2 层层板为例）：
 * - 顶层（最上层隔间）：前板带拱形猫门洞，侧板+背板封闭
 * - 中层（层板之间）：前板/侧板/背板全封闭
 * - 底层：完全开放（无底板，猫咪从下方进出）
 * 
 * 面板尺寸 = 内开口宽 + 2×槽深（边缘卡入 T-slot 槽内固定）
 * 槽深 6.3mm，每边各伸入 6.3mm
 */
function addCompartmentPanels(
  group: THREE.Group,
  config: CabinetConfig,
  W: number,
  H: number,
  D: number,
  halfH: number,
  p: number,
  shelfLevels: number[],
  panelMat: THREE.Material | null,
) {
  if (!panelMat) return

  // T-slot 槽深 6.3mm = 0.0063m，面板每边伸入槽内 6.3mm
  const slotDeep = 0.0063
  const panelW = W - 2 * p + slotDeep * 2   // 面板宽度（含卡槽）
  const panelD = D - 2 * p + slotDeep * 2   // 面板深度（含卡槽）

  // 最上层隔间参数
  const upperShelfY =
    config.hasShelf && shelfLevels.length > 0
      ? shelfLevels[shelfLevels.length - 1]
      : -halfH + p
  const upperSecH = halfH - upperShelfY - p  // 最上层隔间高度

  // ---- 前板渲染 ----
  if (config.hasShelf && config.shelfCount > 0) {
    // 最上层前板：带拱形猫门洞
    if (upperSecH > 0.05) {
      const doorH = upperSecH * 0.85           // 猫门高度（占隔间高度的 85%）
      const doorW = panelW * 0.45              // 猫门宽度（占面板宽的 45%）
      const archR = Math.min(doorW * 0.5, doorH * 0.5)  // 拱顶圆弧半径
      const fw = panelW / 2                    // 前板半宽
      const isEven = config.shelfCount % 2 === 0
      // 拱形门洞水平偏移（偏向一侧，不与中层半宽层板对齐）
      const xOff = isEven ? panelW * 0.22 : -panelW * 0.22

      const shape = new THREE.Shape()
      shape.moveTo(-fw, 0)
      shape.lineTo(-fw, upperSecH)
      shape.lineTo(fw, upperSecH)
      shape.lineTo(fw, 0)
      shape.lineTo(-fw, 0)

      // 拱形门洞（底部直线 + 顶部半圆弧）
      const hole = new THREE.Path()
      const hw = doorW / 2
      hole.moveTo(-hw + xOff, 0)
      hole.lineTo(-hw + xOff, doorH - archR)
      // 左侧拱顶圆弧
      hole.quadraticCurveTo(-hw + xOff, doorH, -hw + xOff + archR, doorH)
      // 拱顶横线
      hole.lineTo(hw + xOff - archR, doorH)
      // 右侧拱顶圆弧
      hole.quadraticCurveTo(hw + xOff, doorH, hw + xOff, doorH - archR)
      hole.lineTo(hw + xOff, 0)
      hole.lineTo(-hw + xOff, 0)
      shape.holes.push(hole)

      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.005, bevelEnabled: false })
      const mesh = new THREE.Mesh(geo, panelMat)
      mesh.position.set(0, upperShelfY, D / 2 - 0.002)
      group.add(mesh)
    }

    // 中层前板：全封闭（层板之间的隔间）
    for (let i = 0; i < shelfLevels.length - 1; i++) {
      const yB = shelfLevels[i]
      const yT = shelfLevels[i + 1]
      const segH = yT - yB
      const midY = (yB + yT) / 2
      const fp = new THREE.Mesh(new THREE.BoxGeometry(panelW, segH, 0.005), panelMat)
      fp.position.set(0, midY, D / 2 - p / 2)
      group.add(fp)
    }
  }

  // ---- 最上层侧板 + 背板 ----
  if (config.hasShelf && config.shelfCount > 0 && upperSecH > 0) {
    const ls = new THREE.Mesh(new THREE.BoxGeometry(0.005, upperSecH, panelD), panelMat)
    ls.position.set(-W / 2 + p / 2, upperShelfY + upperSecH / 2, 0)
    group.add(ls)

    const rs = new THREE.Mesh(new THREE.BoxGeometry(0.005, upperSecH, panelD), panelMat)
    rs.position.set(W / 2 - p / 2, upperShelfY + upperSecH / 2, 0)
    group.add(rs)

    const bp = new THREE.Mesh(new THREE.BoxGeometry(panelW, upperSecH, 0.005), panelMat)
    bp.position.set(0, upperShelfY + upperSecH / 2, -D / 2 + p / 2)
    group.add(bp)
  }

  // ---- 中层侧板 + 背板 ----
  if (config.hasShelf && shelfLevels.length > 0) {
    for (let i = 0; i < shelfLevels.length - 1; i++) {
      const yB = shelfLevels[i]
      const yT = shelfLevels[i + 1]
      const segH = yT - yB
      const midY = (yB + yT) / 2

      const ls = new THREE.Mesh(new THREE.BoxGeometry(0.005, segH, panelD), panelMat)
      ls.position.set(-W / 2 + p / 2, midY, 0)
      group.add(ls)

      const rs = new THREE.Mesh(new THREE.BoxGeometry(0.005, segH, panelD), panelMat)
      rs.position.set(W / 2 - p / 2, midY, 0)
      group.add(rs)

      const bp = new THREE.Mesh(new THREE.BoxGeometry(panelW, segH, 0.005), panelMat)
      bp.position.set(0, midY, -D / 2 + p / 2)
      group.add(bp)
    }
  }

  // ---- 无层板时的整面面板（全封闭，仅上层）----
  if (!config.hasShelf || config.shelfCount === 0) {
    const hFull = H - 2 * p
    const ls = new THREE.Mesh(new THREE.BoxGeometry(0.005, hFull, panelD), panelMat)
    ls.position.set(-W / 2 + p / 2, 0, 0)
    group.add(ls)
    const rs = new THREE.Mesh(new THREE.BoxGeometry(0.005, hFull, panelD), panelMat)
    rs.position.set(W / 2 - p / 2, 0, 0)
    group.add(rs)
    const bp = new THREE.Mesh(new THREE.BoxGeometry(panelW, hFull, 0.005), panelMat)
    bp.position.set(0, 0, -D / 2 + p / 2)
    group.add(bp)
  }
}
