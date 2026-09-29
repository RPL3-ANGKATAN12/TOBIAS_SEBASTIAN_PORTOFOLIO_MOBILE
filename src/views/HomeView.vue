<script setup lang="ts">
import { RouterLink } from 'vue-router'
import HeroSection from '@/components/HeroSection.vue'
import ButtonLink from '@/components/ButtonLink.vue'
import SectionName from '@/components/SectionName.vue'
import SkillList from '@/components/SkillList.vue'
import ArrowIcon from '@/components/ArrowIcon.vue'
import { CHAPTERS } from '@/data/projects'
import { GH, HF, SKILLS } from '@/data/site'
import { finePointer, gridSize } from '@/lib/motion'

const count = gridSize() ** 2
</script>

<template>
  <div>
    <HeroSection title="Tobias">
      <p class="mb-3 max-w-[22ch] text-[clamp(22px,2.3vw,31px)] font-[560] leading-[1.16] tracking-[-0.022em]">
        I train small models from scratch and publish the weights.
      </p>
      <p class="max-w-[48ch] text-base text-ink-2">
        Language models, diffusion for images, 3D and audio, a chess engine and an object detector.
        Most of it is released through
        <a :href="HF + 'bench-labs'" target="_blank" rel="noopener" class="underline decoration-1 underline-offset-[3px] hover:text-accent">Bench Labs</a>.
      </p>
      <template #actions>
        <ButtonLink to="/project">See the work</ButtonLink>
        <ButtonLink :href="HF + 'TobiasLogic'" variant="ghost">Hugging Face</ButtonLink>
      </template>
      <template #note>
        <span class="text-ink">{{ count.toLocaleString('en-US') }} raw weights.</span>
        {{ finePointer ? 'Move over them.' : 'Touch them.' }}
      </template>
    </HeroSection>

    <section class="relative z-10 border-t-[1.5px] border-ink bg-paper py-[clamp(72px,11vw,150px)] px-gutter">
      <div class="grid gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-x-[clamp(48px,7vw,120px)]">
        <div v-reveal>
          <SectionName title="About" index="01" />
          <p class="mb-[22px] max-w-[30ch] text-[clamp(23px,2.6vw,36px)] font-[520] leading-[1.2] tracking-[-0.025em]">
            I'm Tobias. I build language, image, 3D and audio models from scratch, mostly small ones, and
            publish them with model cards that say how they were measured and what they can't do.
          </p>
          <p class="max-w-[52ch] text-ink-2">
            Most of that work goes out through Bench Labs, a non-profit exploring AI together. Around the
            training runs I write tools for running and poking at models, tune Linux servers, and lately
            I've been building in Android Studio.
          </p>
        </div>
        <SkillList v-reveal class="lg:pt-[clamp(80px,9vw,150px)]" heading="What I write" :skills="SKILLS" />
      </div>
    </section>

    <section class="relative z-10 border-t border-rule bg-paper py-[clamp(72px,11vw,150px)] px-gutter">
      <SectionName v-reveal title="Recent work" index="02">
        Six models trained from scratch. Each one gets its own scene on the projects page.
      </SectionName>
      <ol class="border-t-[1.5px] border-ink">
        <li v-for="(c, i) in CHAPTERS" :key="c.id" v-reveal>
          <RouterLink
            :to="{ path: '/project', hash: '#' + c.id }"
            class="group grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-4 border-b border-rule py-5 transition-colors sm:grid-cols-[3rem_1fr_12rem_auto] sm:hover:bg-paper-2"
          >
            <span class="font-mono text-xs text-accent">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="text-[clamp(24px,3.2vw,40px)] font-bold leading-[1.05] tracking-[-0.035em] transition-colors group-hover:text-accent">{{ c.title }}</span>
            <span class="col-start-2 font-mono text-xs text-ink-3 sm:col-start-auto">{{ c.kind }}</span>
            <ArrowIcon class="col-start-3 row-start-1 self-center text-ink-3 group-hover:text-accent sm:col-start-auto sm:row-start-auto" />
          </RouterLink>
        </li>
      </ol>
      <div v-reveal class="mt-8">
        <ButtonLink to="/project" variant="ghost">All projects</ButtonLink>
      </div>
    </section>

    <section class="relative z-10 border-t border-rule bg-paper py-[clamp(72px,11vw,150px)] px-gutter">
      <div v-reveal class="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <p class="max-w-[16ch] text-[clamp(40px,6.4vw,92px)] font-[760] leading-[0.95] tracking-[-0.05em]">
          Got a question about a model? Say hello.
        </p>
        <div class="flex flex-wrap gap-2.5">
          <ButtonLink to="/contact">Contact</ButtonLink>
          <ButtonLink :href="GH" variant="ghost">GitHub</ButtonLink>
        </div>
      </div>
    </section>
  </div>
</template>
