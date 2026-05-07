<template>
  <div class="rounded-lg overflow-hidden h-[45vh] sm:h-[50vh] md:h-[450px]" style="background-color: rgba(245,240,235,0.02); border: 1px solid rgba(245,240,235,0.06);">
    <div class="flex items-center justify-between px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border-b" style="border-color: rgba(245,240,235,0.06);">
      <span class="text-[9px] sm:text-[10px] md:text-xs truncate" style="color: #8A8580;">
        <span class="sm:hidden">3D预览</span>
        <span class="hidden sm:inline md:hidden">3D 实时预览</span>
        <span class="hidden md:inline">3D 实时预览 · 上层拱门 + 底部开放</span>
      </span>
      <span class="text-[8px] sm:text-[9px] md:text-[10px] font-sans-en shrink-0 ml-2" style="color: #8A8580;">
        <span class="sm:hidden">单指旋 · 双指缩</span>
        <span class="hidden sm:inline">单指旋转 · 双指缩放</span>
      </span>
    </div>
    <div ref="container" style="height: calc(100% - 30px);" class="touch-none">
      <canvas ref="canvas" style="width: 100%; height: 100%; display: block;" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { buildCabinet } from '../three/cabinetScene'
import type { CabinetConfig } from '../types/cabinet'

const props = defineProps<{ config: CabinetConfig }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const container = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer
let controls: OrbitControls, cabinet: THREE.Group
let animId = 0

function init() {
  const c = canvas.value, box = container.value
  if (!c || !box) return

  const w = box.clientWidth, h = box.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#0A0908')

  camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100)
  camera.position.set(1.2, 0.7, 1.5)

  renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.minDistance = 0.6
  controls.maxDistance = 4
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.8
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // Touch optimization for mobile
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN,
  }

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const d1 = new THREE.DirectionalLight(0xffffff, 1.0)
  d1.position.set(5, 5, 5)
  scene.add(d1)
  const d2 = new THREE.DirectionalLight(0xd4c5b0, 0.4)
  d2.position.set(-3, 3, -3)
  scene.add(d2)
  const p1 = new THREE.PointLight(0xB87333, 0.5, 10)
  p1.position.set(0, 2, 2)
  scene.add(p1)

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.ShadowMaterial({ opacity: 0.3 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // Build cabinet
  rebuild()

  // Animate
  const loop = () => {
    animId = requestAnimationFrame(loop)
    controls.update()
    renderer.render(scene, camera)
  }
  loop()

  // Resize
  const onResize = () => {
    const cw = box.clientWidth, ch = box.clientHeight
    camera.aspect = cw / ch
    camera.updateProjectionMatrix()
    renderer.setSize(cw, ch)
  }
  window.addEventListener('resize', onResize)

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    cancelAnimationFrame(animId)
    renderer.dispose()
    controls.dispose()
  })
}

function rebuild() {
  if (!scene) return
  if (cabinet) {
    scene.remove(cabinet)
    cabinet.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        const m = child.material
        if (Array.isArray(m)) m.forEach((x) => x.dispose())
        else m.dispose()
      }
    })
  }

  try {
    cabinet = buildCabinet(props.config)
    scene.add(cabinet)

    // Update ground
    const halfH = props.config.height / 2000
    const wheelOffset = props.config.hasWheels ? 0.065 : 0.01
    const groundY = -halfH - wheelOffset
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) {
        child.position.y = groundY
      }
    })
  } catch (e) {
    console.error('buildCabinet error:', e)
  }
}

onMounted(() => {
  init()
})

watch(
  () => props.config,
  () => rebuild(),
  { deep: true },
)
</script>
