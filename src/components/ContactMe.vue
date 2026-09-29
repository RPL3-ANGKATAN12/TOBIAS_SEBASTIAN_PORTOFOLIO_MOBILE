<script setup lang="ts">
import { computed, ref } from 'vue'
import ButtonLink from './ButtonLink.vue'
import ArrowIcon from './ArrowIcon.vue'

const props = defineProps<{
  email: string
  links: { label: string; handle: string; href: string }[]
}>()

const parts = computed(() => {
  const at = props.email.indexOf('@')
  return at > 0 ? [props.email.slice(0, at), props.email.slice(at)] : [props.email, '']
})

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.email)
  } catch {
    const area = document.createElement('textarea')
    area.value = props.email
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    area.remove()
  }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    copied.value = false
  }, 2200)
}
</script>

<template>
  <div class="grid gap-14">
    <div v-reveal class="border-t-[1.5px] border-ink pt-5">
      <p class="mb-3 font-mono text-[12.5px] text-ink-2">Email</p>
      <a
        :href="'mailto:' + email"
        class="block text-[clamp(26px,5.2vw,72px)] font-[740] leading-[1.02] tracking-[-0.045em] [overflow-wrap:anywhere] transition-colors hover:text-accent"
      >
        {{ parts[0] }}<wbr />{{ parts[1] }}
      </a>
      <div class="mt-6 flex flex-wrap items-center gap-2.5">
        <ButtonLink :href="'mailto:' + email">Write an email</ButtonLink>
        <button
          type="button"
          class="inline-flex min-h-12 cursor-pointer items-center rounded-[4px] px-5 text-[15px] font-semibold shadow-[inset_0_0_0_1.5px_var(--color-ink)] transition-colors hover:bg-ink hover:text-paper"
          @click="copy"
        >
          {{ copied ? 'Copied' : 'Copy address' }}
        </button>
        <span class="sr-only" aria-live="polite">{{ copied ? 'Email address copied' : '' }}</span>
      </div>
      <div v-if="$slots.default" class="mt-5 max-w-[52ch] text-[15px] text-ink-2">
        <slot />
      </div>
    </div>

    <div v-reveal>
      <p class="mb-3 font-mono text-[12.5px] text-ink-2">Elsewhere</p>
      <ul class="border-t-[1.5px] border-ink">
        <li v-for="l in links" :key="l.label">
          <a
            :href="l.href"
            target="_blank"
            rel="noopener"
            class="group grid grid-cols-[1fr_auto_24px] items-baseline gap-4 border-b border-rule py-[18px]"
          >
            <span class="text-[clamp(30px,4.6vw,64px)] font-[740] leading-none tracking-[-0.045em] transition-colors group-hover:text-accent">{{ l.label }}</span>
            <span class="font-mono text-[12.5px] text-ink-3">{{ l.handle }}</span>
            <ArrowIcon class="size-[22px] self-center group-hover:text-accent" />
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
