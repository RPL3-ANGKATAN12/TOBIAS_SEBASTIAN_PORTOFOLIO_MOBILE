<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { CubeField } from '@/scene/field'

const props = defineProps<{ grid: number; fixed?: number; centered?: boolean }>()

const host = ref<HTMLDivElement>()
const ready = ref(false)
let field: CubeField | undefined
let io: IntersectionObserver | undefined
let gone = false

onMounted(async () => {
  const { CubeField, hasWebGL } = await import('@/scene/field')
  if (gone || !host.value || !hasWebGL()) return
  field = new CubeField(host.value, props.grid, { fixed: props.fixed, centered: props.centered }, () => {
    ready.value = true
  })
  io = new IntersectionObserver(([e]) => {
    if (e?.isIntersecting) field?.start()
    else field?.stop()
  }, { rootMargin: '80px' })
  io.observe(host.value)
})

onBeforeUnmount(() => {
  gone = true
  io?.disconnect()
  field?.dispose()
})
</script>

<template>
  <div
    ref="host"
    class="absolute inset-0 transition-opacity duration-[1400ms] ease-out motion-reduce:transition-none"
    :class="ready ? 'opacity-100' : 'opacity-0'"
    aria-hidden="true"
  ></div>
</template>
