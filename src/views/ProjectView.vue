<script setup lang="ts">
import { nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProjectShowcase from '@/components/ProjectShowcase.vue'
import ProjectList from '@/components/ProjectList.vue'
import SectionName from '@/components/SectionName.vue'
import { CHAPTERS, EARLIER, MORE, type Item } from '@/data/projects'
import { fmt, useLive } from '@/lib/live'
import { goTo, refresh } from '@/lib/motion'

const labels = ['Language', 'Image', '3D', 'Audio', 'Chess', 'Vision']
const live = useLive()
const route = useRoute()

function stat(item: Item) {
  if (item.hf) {
    const m = live.value.hf[item.hf]
    return m ? `${fmt(m.downloads)} downloads` : ''
  }
  if (item.space) {
    const n = live.value.spaces[item.space]
    return n !== undefined ? `♥ ${fmt(n)}` : ''
  }
  if (item.gh) {
    const n = live.value.gh[item.gh]
    return n !== undefined ? `★ ${fmt(n)}` : ''
  }
  return ''
}

onMounted(async () => {
  await nextTick()
  refresh()
  const i = CHAPTERS.findIndex(c => '#' + c.id === route.hash)
  if (i >= 0) requestAnimationFrame(() => goTo(i + 1, true))
})
</script>

<template>
  <div>
    <ProjectShowcase :chapters="CHAPTERS" :labels="labels" :live="live">
      <template #intro>
        <SectionName title="Projects" level="h1">
          <p class="text-[clamp(18px,1.8vw,22px)] leading-[1.35] text-ink">
            Six models trained from scratch, one scene each. Keep scrolling and the cubes rebuild
            themselves into every project.
          </p>
          <p class="mt-3 font-mono text-xs">Downloads and likes are live from Hugging Face.</p>
        </SectionName>
      </template>
    </ProjectShowcase>

    <section class="relative z-10 border-t-[1.5px] border-ink bg-paper py-[clamp(72px,11vw,150px)] px-gutter">
      <SectionName v-reveal>
        <template #title>Other things<br />I've made</template>
        Tools, experiments and a few models that aren't from scratch. Stars and downloads are pulled live
        from GitHub and Hugging Face.
      </SectionName>

      <ProjectList :items="MORE">
        <template #stat="{ item }">{{ stat(item) }}</template>
      </ProjectList>

      <p v-reveal class="mt-10 text-[15px] leading-[1.8] text-ink-2">
        <span class="block font-mono text-xs text-ink-3">Earlier releases</span>
        <template v-for="(e, i) in EARLIER" :key="e.name">
          <a :href="e.href" target="_blank" rel="noopener" class="text-ink underline decoration-1 underline-offset-[3px] hover:text-accent">{{ e.name }}</a>{{ i < EARLIER.length - 1 ? ', ' : '' }}
        </template>
      </p>
    </section>
  </div>
</template>
