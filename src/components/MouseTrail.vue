<template>
  <canvas
    ref="canvasRef"
    style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9998; pointer-events: none;"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface TrailPoint { x: number; y: number; life: number; size: number }

const canvasRef = ref<HTMLCanvasElement | null>(null)
const points = ref<TrailPoint[]>([])
const mouse = ref({ x: 0, y: 0, active: false })
let animId = 0

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  window.addEventListener('resize', resize)

  const handleMove = (e: MouseEvent) => {
    mouse.value.x = e.clientX
    mouse.value.y = e.clientY
    mouse.value.active = true
    points.value.push({ x: e.clientX, y: e.clientY, life: 1, size: 4 + Math.random() * 4 })
  }
  const handleLeave = () => { mouse.value.active = false }

  window.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseleave', handleLeave)

  const animate = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    ctx.clearRect(0, 0, w, h)

    for (let i = points.value.length - 1; i >= 0; i--) {
      points.value[i].life -= 0.025
      if (points.value[i].life <= 0) { points.value.splice(i, 1); continue }
    }

    if (points.value.length < 2) { animId = requestAnimationFrame(animate); return }

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (let i = 1; i < points.value.length; i++) {
      const p1 = points.value[i - 1], p2 = points.value[i]
      const avgLife = (p1.life + p2.life) / 2
      const alpha = avgLife * 0.6
      const width = ((p1.size + p2.size) / 2) * avgLife

      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.strokeStyle = `rgba(184, 115, 51, ${alpha})`
      ctx.lineWidth = width
      ctx.stroke()

      if (avgLife > 0.5) {
        ctx.beginPath()
        ctx.arc(p2.x, p2.y, width * 1.5, 0, Math.PI * 2)
        const grad = ctx.createRadialGradient(p2.x, p2.y, 0, p2.x, p2.y, width * 1.5)
        grad.addColorStop(0, `rgba(184, 115, 51, ${alpha * 0.3})`)
        grad.addColorStop(1, 'rgba(184, 115, 51, 0)')
        ctx.fillStyle = grad
        ctx.fill()
      }
    }
    animId = requestAnimationFrame(animate)
  }
  animId = requestAnimationFrame(animate)

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseleave', handleLeave)
  })
})
</script>
