<template>
  <footer id="footer" class="relative pt-24 pb-8 overflow-hidden" style="background-color: #0A0908;">
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 1;" />
    <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
      <div class="grid md:grid-cols-3 gap-12 mb-16">
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-sm flex items-center justify-center" style="background-color: #B87333;">
              <span class="font-serif-cn text-sm font-bold" style="color: #0A0908;">铝</span>
            </div>
            <span class="font-serif-cn text-lg font-semibold tracking-wide" style="color: #F5F0EB;">猫砂柜工坊</span>
          </div>
          <p class="text-sm leading-relaxed" style="color: #8A8580;">
            用工业级铝型材重新定义猫砂柜。<br>为每一只猫咪打造专属空间。
          </p>
        </div>
        <div>
          <h4 class="font-serif-cn text-sm font-semibold mb-4" style="color: #F5F0EB;">联系我们</h4>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8A8580" stroke-width="1.5">
                <path d="M2 4l6 4 6-4M2 4v8h12V4" />
              </svg>
              <span class="text-sm" style="color: #8A8580;">hello@catcabinet.workshop</span>
            </div>
            <div class="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8A8580" stroke-width="1.5">
                <path d="M8 1v3m0 8v3M1 8h3m8 0h3M3.5 3.5l2 2m5 5l2 2M3.5 12.5l2-2m5-5l2-2" />
              </svg>
              <span class="text-sm" style="color: #8A8580;">上海市徐汇区 · 定制工坊</span>
            </div>
          </div>
        </div>
        <div>
          <h4 class="font-serif-cn text-sm font-semibold mb-4" style="color: #F5F0EB;">快速链接</h4>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="link in links"
              :key="link"
              class="text-left text-sm transition-colors duration-300 hover:text-[#F5F0EB]"
              style="color: #8A8580;"
              @click="link === '定制设计器' ? scrollTo('configurator') : null"
            >
              {{ link }}
            </button>
          </div>
        </div>
      </div>
      <div style="height: 1px; background-color: rgba(245,240,235,0.06);" />
      <div class="flex flex-col md:flex-row items-center justify-between py-6 gap-4">
        <p class="text-xs font-sans-en" style="color: rgba(138,133,128,0.5);">
          © 2025 猫砂柜铝型材定制工坊 · Custom Cat Cabinet Workshop
        </p>
        <div class="flex items-center gap-6">
          <span class="text-xs transition-colors duration-300 hover:text-[#F5F0EB] cursor-pointer" style="color: #8A8580;">隐私政策</span>
          <span class="text-xs transition-colors duration-300 hover:text-[#F5F0EB] cursor-pointer" style="color: #8A8580;">使用条款</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const links = ['定制设计器', '安装指南', 'FAQ']
const canvasRef = ref<HTMLCanvasElement | null>(null)

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resize = () => {
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)
  }
  resize()

  const splats: { x: number; y: number; r: number; dr: number; alpha: number; dAlpha: number }[] = []
  for (let i = 0; i < 8; i++) {
    splats.push({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight * 0.6,
      r: 20 + Math.random() * 60,
      dr: 0.5 + Math.random() * 1.5,
      alpha: 0,
      dAlpha: 0.01 + Math.random() * 0.02,
    })
  }

  let frame = 0
  let animId = 0

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      const animate = () => {
        frame++
        const w = canvas.offsetWidth, h = canvas.offsetHeight
        ctx.clearRect(0, 0, w, h)
        splats.forEach((splat) => {
          if (splat.alpha < 0.15) splat.alpha += splat.dAlpha
          splat.r += splat.dr * 0.02
          ctx.beginPath()
          ctx.arc(splat.x, splat.y, splat.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(184, 115, 51, ${splat.alpha * 0.3})`
          ctx.fill()
          ctx.beginPath()
          ctx.arc(splat.x, splat.y, splat.r * 0.4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(60, 55, 50, ${splat.alpha * 0.5})`
          ctx.fill()
        })
        if (frame < 200) animId = requestAnimationFrame(animate)
      }
      animId = requestAnimationFrame(animate)
    }
  }, { threshold: 0.1 })

  onUnmounted(() => {
    if (animId) cancelAnimationFrame(animId)
  })

  const footer = document.getElementById('footer')
  if (footer) observer.observe(footer)
})
</script>
