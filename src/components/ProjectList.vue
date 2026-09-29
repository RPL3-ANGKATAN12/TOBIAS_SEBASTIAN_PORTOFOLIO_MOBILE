<script setup lang="ts">
import ArrowIcon from './ArrowIcon.vue'
import type { Item } from '@/data/projects'

defineProps<{ items: Item[] }>()
</script>

<template>
  <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <li v-for="item in items" :key="item.name" v-reveal>
      <a
        :href="item.href"
        target="_blank"
        rel="noopener"
        class="group flex h-full min-h-[220px] flex-col border border-rule bg-paper p-5 transition-colors duration-300 hover:border-ink sm:p-6"
      >
        <div class="flex items-baseline justify-between gap-4 font-mono text-xs">
          <span class="text-ink-3">{{ item.tag }}</span>
          <span class="text-ink-2">
            <slot name="stat" :item="item" />
          </span>
        </div>
        <h3 class="mt-9 text-[22px] font-[680] leading-[1.15] tracking-[-0.02em] transition-colors group-hover:text-accent">
          {{ item.name }}
        </h3>
        <p class="mt-2 text-[15px] leading-normal text-ink-2">{{ item.text }}</p>
        <span class="mt-auto flex justify-end pt-6 text-ink-3 group-hover:text-accent">
          <ArrowIcon class="size-4" />
        </span>
      </a>
    </li>
  </ul>
</template>
