<script setup lang="ts">
import { computed } from 'vue'
import ButtonLink from './ButtonLink.vue'
import ArrowIcon from './ArrowIcon.vue'
import type { Chapter } from '@/data/projects'
import { HF } from '@/data/site'
import { fmt, type Live } from '@/lib/live'

const props = defineProps<{ chapter: Chapter; index: number; live: Live }>()

const num = computed(() => String(props.index + 1).padStart(2, '0'))
const counts = computed(() => props.live.hf[props.chapter.repo])
</script>

<template>
  <section
    :id="chapter.id"
    :data-step="index + 1"
    :aria-labelledby="chapter.id + '-t'"
    class="flex min-h-[112svh] items-end pt-[calc(5.25rem+var(--safe-top))] pb-[calc(1rem+var(--safe-bottom))] px-gutter lg:min-h-[128svh] lg:items-center lg:pb-10"
  >
    <article class="pointer-events-auto w-full max-w-[480px] border border-rule bg-paper p-[18px] sm:p-[22px] lg:-ml-7 lg:max-w-[470px] lg:border-transparent lg:p-7">
      <p class="mb-3 flex gap-3.5 font-mono text-[12.5px] text-ink-2">
        <span class="font-medium text-accent">{{ num }}</span>
        <span>{{ chapter.kind }}</span>
      </p>
      <h2 :id="chapter.id + '-t'" class="mb-3 text-[clamp(34px,4.4vw,62px)] font-[760] leading-[0.95] tracking-[-0.045em]">
        {{ chapter.title }}
      </h2>
      <p class="mb-4 text-[15px] leading-normal sm:text-base">{{ chapter.text }}</p>

      <dl class="mb-3.5 grid grid-cols-3 divide-x divide-rule border-t-[1.5px] border-ink">
        <div v-for="[k, v] in chapter.stats" :key="k" class="min-w-0 pt-[9px] pr-2.5 [&:not(:first-child)]:pl-2.5">
          <dt class="font-mono text-[11px] leading-[1.3] text-ink-2">{{ k }}</dt>
          <dd class="mt-0.5 text-[clamp(20px,2.2vw,28px)] font-[650] leading-[1.15] tracking-[-0.03em] tabular-nums">{{ v }}</dd>
        </div>
      </dl>

      <div v-if="chapter.also" class="mb-3.5 grid gap-0.5 border-y border-rule py-3">
        <a :href="HF + chapter.also.repo" target="_blank" rel="noopener" class="group inline-flex w-fit items-center gap-1.5 font-[650] hover:text-accent">
          {{ chapter.also.title }}
          <ArrowIcon />
        </a>
        <p class="text-sm leading-[1.45] text-ink-2">{{ chapter.also.text }}</p>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ButtonLink :href="HF + chapter.repo" size="sm">Model card</ButtonLink>
          <ButtonLink v-if="chapter.extra" :href="chapter.extra.href" variant="text">{{ chapter.extra.label }}</ButtonLink>
        </div>
        <span v-if="counts" class="font-mono text-xs text-ink-2">
          {{ fmt(counts.downloads) }} downloads · {{ fmt(counts.likes) }} likes
        </span>
      </div>

      <p class="mt-4 hidden border-t border-dashed border-rule pt-3 font-mono text-xs text-ink-3 lg:block">
        Fig. {{ index + 1 }}. {{ chapter.fig }}
      </p>
    </article>
  </section>
</template>
