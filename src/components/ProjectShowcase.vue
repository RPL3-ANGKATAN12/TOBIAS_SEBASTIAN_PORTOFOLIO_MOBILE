<script setup lang="ts">
import CubeStage from './CubeStage.vue'
import ProjectCard from './ProjectCard.vue'
import ProjectRail from './ProjectRail.vue'
import type { Chapter } from '@/data/projects'
import type { Live } from '@/lib/live'
import { gridSize } from '@/lib/motion'

defineProps<{ chapters: Chapter[]; labels: string[]; live: Live }>()

const grid = gridSize()
</script>

<template>
  <div class="relative">
    <div data-stage class="sticky top-0 z-0 h-svh overflow-hidden">
      <CubeStage :grid="grid" />
      <ProjectRail :labels="labels" />
    </div>
    <div class="pointer-events-none relative z-10 -mt-[100svh]">
      <section data-step="0" class="flex min-h-svh items-end pt-24 pb-6 px-gutter lg:pb-[clamp(40px,8vh,88px)]">
        <div class="pointer-events-auto w-full max-w-[640px]">
          <slot name="intro" />
        </div>
      </section>
      <ProjectCard v-for="(c, i) in chapters" :key="c.id" :chapter="c" :index="i" :live="live" />
    </div>
  </div>
</template>
