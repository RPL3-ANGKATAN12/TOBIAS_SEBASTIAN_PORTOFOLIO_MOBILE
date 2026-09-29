<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import ArrowIcon from './ArrowIcon.vue'
import { EMAIL, NAV, SOCIALS } from '@/data/site'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement>()

watch(
  () => props.open,
  async open => {
    if (!open) return
    await nextTick()
    panel.value?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
  }
)

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="lg:hidden">
    <div
      class="fixed inset-0 z-30 bg-ink/25 transition-opacity duration-300"
      :class="open ? 'opacity-100' : 'pointer-events-none opacity-0'"
      aria-hidden="true"
      @click="emit('close')"
    ></div>
    <aside
      id="sidebar"
      ref="panel"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      :inert="!open"
      class="fixed inset-y-0 right-0 z-40 flex w-[min(86vw,380px)] flex-col overflow-y-auto border-l border-rule bg-paper pt-[calc(5.5rem+var(--safe-top))] pb-[calc(1.5rem+var(--safe-bottom))] px-6 transition-transform duration-500 ease-out-soft"
      :class="open ? 'translate-x-0' : 'translate-x-full'"
    >
      <nav aria-label="Pages">
        <ul class="border-t-[1.5px] border-ink">
          <li v-for="(item, i) in NAV" :key="item.to" class="border-b border-rule">
            <RouterLink
              :to="item.to"
              class="flex min-h-16 items-baseline gap-4 py-3 text-[34px] font-bold leading-none tracking-[-0.04em]"
              exact-active-class="text-accent"
              @click="emit('close')"
            >
              <span class="font-mono text-xs font-normal tracking-normal text-ink-3">0{{ i + 1 }}</span>
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="mt-auto pt-10">
        <p class="mb-3 font-mono text-xs text-ink-3">Elsewhere</p>
        <ul class="grid gap-1">
          <li v-for="s in SOCIALS" :key="s.label">
            <a :href="s.href" target="_blank" rel="noopener" class="group flex min-h-11 items-center justify-between text-[17px] font-medium">
              {{ s.label }}
              <ArrowIcon class="text-ink-3" />
            </a>
          </li>
        </ul>
        <a :href="'mailto:' + EMAIL" class="mt-4 block break-all font-mono text-[13px] text-ink-2 underline decoration-rule underline-offset-4">{{ EMAIL }}</a>
      </div>
    </aside>
  </div>
</template>
