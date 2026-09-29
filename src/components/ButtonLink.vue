<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import ArrowIcon from './ArrowIcon.vue'

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw
    href?: string
    variant?: 'solid' | 'ghost' | 'text'
    size?: 'md' | 'sm'
  }>(),
  { variant: 'solid', size: 'md' }
)

const external = computed(() => !!props.href && /^https?:/.test(props.href))

const variants = {
  solid: 'rounded-[4px] bg-ink text-paper hover:bg-accent',
  ghost: 'rounded-[4px] text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)] hover:bg-ink hover:text-paper',
  text: 'min-h-11 text-sm font-medium underline decoration-1 underline-offset-4 hover:text-accent'
}

const sizes = {
  md: 'min-h-12 px-5 text-[15px]',
  sm: 'min-h-11 px-4 text-sm'
}

const classes = computed(() => [
  'group inline-flex items-center gap-2.5 font-semibold transition-colors duration-200',
  variants[props.variant],
  props.variant === 'text' ? '' : sizes[props.size]
])
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes">
    <slot />
  </RouterLink>
  <a
    v-else
    :href="href"
    :class="classes"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
  >
    <slot />
    <ArrowIcon v-if="external && variant !== 'text'" />
  </a>
</template>
