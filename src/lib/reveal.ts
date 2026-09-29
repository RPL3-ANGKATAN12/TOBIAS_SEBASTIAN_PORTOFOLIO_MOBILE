import type { Directive } from 'vue'

let io: IntersectionObserver | null = null

export const reveal: Directive<HTMLElement> = {
  mounted(el) {
    io ??= new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io?.unobserve(e.target)
        }
      }
    }, { rootMargin: '0px 0px -8% 0px' })
    el.classList.add('reveal')
    io.observe(el)
  },
  unmounted(el) {
    io?.unobserve(el)
  }
}
