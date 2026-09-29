import Lenis from 'lenis'

export const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
export const finePointer = typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches

export const stage = { value: 0, count: 0 }
export const pointer = { x: 0, y: 0, cx: 0, cy: 0, seen: 0 }

export function gridSize() {
  const small = Math.min(window.innerWidth, window.innerHeight) < 700
  const weak = (navigator.hardwareConcurrency ?? 8) <= 4
  return small || weak ? 24 : 32
}

let anchors: number[] = []
let active = -1
let lenis: Lenis | null = null
let started = false
const listeners = new Set<(i: number) => void>()

export function onActive(fn: (i: number) => void) {
  listeners.add(fn)
  fn(Math.max(0, active))
  return () => {
    listeners.delete(fn)
  }
}

function update() {
  const y = window.scrollY
  let v = 0
  if (anchors.length > 1) {
    const last = anchors.length - 1
    if (y >= anchors[last]!) v = last
    else if (y > anchors[0]!) {
      for (let i = 0; i < last; i++) {
        const a = anchors[i]!
        const b = anchors[i + 1]!
        if (y < b) {
          v = i + (y - a) / (b - a)
          break
        }
      }
    }
  }
  stage.value = v
  const a = Math.round(v)
  if (a !== active) {
    active = a
    listeners.forEach(fn => fn(a))
  }
}

export function refresh() {
  const el = document.querySelector<HTMLElement>('[data-stage]')
  const viewport = el ? el.clientHeight : window.innerHeight
  anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-step]')).map(s => {
    const r = s.getBoundingClientRect()
    return r.top + window.scrollY + (r.height - viewport) / 2
  })
  if (anchors.length) anchors[0] = Math.min(anchors[0]!, 0)
  stage.count = anchors.length
  update()
}

export function goTo(i: number, immediate = false) {
  const y = anchors[i] ?? 0
  if (lenis) lenis.scrollTo(y, { duration: 1.6, immediate, force: true })
  else window.scrollTo({ top: y, behavior: reduced || immediate ? 'auto' : 'smooth' })
}

export function resetScroll() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
  refresh()
}

export function lockScroll(on: boolean) {
  if (lenis) {
    if (on) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = on ? 'hidden' : ''
}

function setPointer(cx: number, cy: number) {
  pointer.cx = cx
  pointer.cy = cy
  pointer.x = (cx / window.innerWidth) * 2 - 1
  pointer.y = -(cy / window.innerHeight) * 2 + 1
  pointer.seen = performance.now()
}

export function startMotion() {
  if (started) return
  started = true
  if (!reduced) lenis = new Lenis({ autoRaf: true, lerp: 0.1, wheelMultiplier: 0.9 })
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', refresh)
  const root = document.getElementById('app')
  if (root) new ResizeObserver(refresh).observe(root)
  document.fonts?.ready.then(refresh)
  refresh()

  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') setPointer(e.clientX, e.clientY)
  }, { passive: true })
  const touch = (e: TouchEvent) => {
    const t = e.touches[0]
    if (t) setPointer(t.clientX, t.clientY)
  }
  window.addEventListener('touchstart', touch, { passive: true })
  window.addEventListener('touchmove', touch, { passive: true })
}
