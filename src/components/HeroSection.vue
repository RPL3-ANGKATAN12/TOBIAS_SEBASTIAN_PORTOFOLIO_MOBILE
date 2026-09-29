<script setup lang="ts">
import CubeStage from './CubeStage.vue'
import { gridSize } from '@/lib/motion'

defineProps<{ title: string }>()

const grid = gridSize()
</script>

<template>
  <section class="relative flex min-h-svh items-end overflow-hidden pt-24 pb-6 px-gutter lg:pb-[clamp(40px,8vh,88px)]">
    <CubeStage :grid="grid" :fixed="0" />
    <div class="relative z-10 w-full max-w-[660px]">
      <h1 class="-ml-[0.045em] mb-[0.16em] text-[clamp(88px,26vw,236px)] font-extrabold leading-[0.82] tracking-[-0.06em] lg:text-[clamp(120px,15vw,236px)]">
        {{ title }}
      </h1>
      <slot />
      <div v-if="$slots.actions" class="mt-6 flex flex-wrap gap-2.5">
        <slot name="actions" />
      </div>
      <p v-if="$slots.note" class="mt-[18px] font-mono text-xs text-ink-2">
        <slot name="note" />
      </p>
    </div>
  </section>
</template>
