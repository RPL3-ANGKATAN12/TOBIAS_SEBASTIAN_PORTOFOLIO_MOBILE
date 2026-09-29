<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { goTo, onActive } from '@/lib/motion'

defineProps<{ labels: string[] }>()

const active = ref(0)
let off: (() => void) | undefined

onMounted(() => {
  off = onActive(i => {
    active.value = i
  })
})
onBeforeUnmount(() => off?.())
</script>

<template>
  <ol
    class="absolute top-1/2 right-[clamp(16px,4vw,56px)] z-20 hidden -translate-y-1/2 flex-col items-end bg-paper py-2 pl-3.5 transition-opacity duration-500 lg:flex"
    :class="active > 0 ? 'opacity-100' : 'pointer-events-none opacity-0'"
    aria-label="Projects"
  >
    <li v-for="(label, i) in labels" :key="label">
      <button
        type="button"
        class="flex cursor-pointer items-center gap-2.5 py-[5px] font-mono text-xs transition-colors after:h-[1.5px] after:transition-all after:duration-300 after:content-[''] hover:text-ink"
        :class="active === i + 1 ? 'text-ink after:w-[30px] after:bg-accent' : 'text-ink-3 after:w-3.5 after:bg-current'"
        :aria-current="active === i + 1 ? 'step' : undefined"
        :tabindex="active > 0 ? 0 : -1"
        @click="goTo(i + 1)"
      >
        {{ label }}
      </button>
    </li>
  </ol>
</template>
