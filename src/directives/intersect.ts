import type { DirectiveBinding } from 'vue'

interface IntersectOptions {
  once?: boolean
  margin?: string
  onEnter?: () => void
  onLeave?: () => void
}

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding<IntersectOptions>) {
    const opts = binding.value || {}
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          opts.onEnter?.()
          if (opts.once) observer.unobserve(el)
        } else {
          opts.onLeave?.()
        }
      },
      { rootMargin: opts.margin || '0px' }
    )
    observer.observe(el)
    ;(el as any).__intersectObserver = observer
  },
  unmounted(el: HTMLElement) {
    const observer = (el as any).__intersectObserver
    if (observer) observer.disconnect()
  },
}
