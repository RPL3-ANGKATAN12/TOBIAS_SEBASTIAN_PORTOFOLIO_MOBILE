<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BrandMark from './BrandMark.vue'
import { GH, HF, NAV } from '@/data/site'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ toggle: [] }>()

const solid = ref(false)
const check = () => {
  solid.value = window.scrollY > 24
}

onMounted(() => {
  check()
  window.addEventListener('scroll', check, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', check))
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 flex h-[calc(4rem+var(--safe-top))] items-center justify-between border-b pt-[var(--safe-top)] px-gutter transition-colors duration-300"
    :class="solid || open ? 'border-rule bg-paper' : 'border-transparent'"
  >
    <RouterLink to="/" class="flex min-h-11 items-center gap-2.5 text-[19px] font-bold tracking-[-0.02em]">
      <BrandMark class="size-[22px] text-ink" />
      <span>Tobias</span>
    </RouterLink>

    <nav class="hidden items-center gap-8 lg:flex" aria-label="Pages">
      <RouterLink
        v-for="item in NAV"
        :key="item.to"
        :to="item.to"
        class="inline-flex min-h-11 items-center text-[15px] transition-colors hover:text-accent"
        exact-active-class="text-accent"
      >
        {{ item.label }}
      </RouterLink>
      <span class="h-4 w-px bg-rule" aria-hidden="true"></span>
      <a :href="GH" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center text-[15px] transition-colors hover:text-accent">GitHub</a>
      <a :href="HF + 'TobiasLogic'" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center text-[15px] transition-colors hover:text-accent">Hugging Face</a>
    </nav>

    <button
      type="button"
      class="-mr-2.5 flex size-11 items-center justify-center lg:hidden"
      :aria-expanded="open"
      aria-controls="sidebar"
      :aria-label="open ? 'Close menu' : 'Open menu'"
      @click="emit('toggle')"
    >
      <span class="relative block h-3 w-6" aria-hidden="true">
        <span
          class="absolute left-0 h-[1.5px] w-6 bg-ink transition-transform duration-300 ease-out-soft"
          :class="open ? 'top-[5px] rotate-45' : 'top-0'"
        ></span>
        <span
          class="absolute left-0 h-[1.5px] w-6 bg-ink transition-transform duration-300 ease-out-soft"
          :class="open ? 'top-[5px] -rotate-45' : 'top-[10px]'"
        ></span>
      </span>
    </button>
  </header>
</template>
