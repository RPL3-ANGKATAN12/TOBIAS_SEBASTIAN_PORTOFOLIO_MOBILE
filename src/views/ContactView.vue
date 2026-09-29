<script setup lang="ts">
import ContactMe from '@/components/ContactMe.vue'
import CubeStage from '@/components/CubeStage.vue'
import SectionName from '@/components/SectionName.vue'
import { EMAIL, HF, SOCIALS } from '@/data/site'
import { finePointer } from '@/lib/motion'
</script>

<template>
  <section class="pt-[calc(4rem+var(--safe-top)+clamp(40px,7vw,96px))] pb-[clamp(72px,11vw,150px)] px-gutter">
    <div class="mb-14 grid gap-10 lg:mb-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end">
      <SectionName v-reveal title="Contact" index="Say hello" level="h1" class="mb-0!">
        Email is the quickest way to reach me. For something about a specific model, the community tab on
        its <a :href="HF + 'bench-labs'" target="_blank" rel="noopener" class="text-ink underline decoration-1 underline-offset-[3px] hover:text-accent">Hugging Face</a> page works too.
      </SectionName>
      <figure v-reveal class="relative w-full lg:max-w-[560px] lg:justify-self-end">
        <div class="relative aspect-[4/3] overflow-hidden border border-rule lg:aspect-square">
          <CubeStage :grid="24" :fixed="0" centered />
        </div>
        <figcaption class="mt-2.5 font-mono text-xs text-ink-3">
          {{ finePointer ? 'Move over the cubes.' : 'Touch the cubes.' }}
        </figcaption>
      </figure>
    </div>

    <ContactMe :email="EMAIL" :links="SOCIALS">
      Writing about a project on this site? Mention which one, it helps.
    </ContactMe>
  </section>
</template>
