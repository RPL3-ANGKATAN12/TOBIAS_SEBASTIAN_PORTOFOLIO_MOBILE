<script setup lang="ts">
withDefaults(defineProps<{ title?: string; index?: string; level?: 'h1' | 'h2' }>(), { level: 'h2' })
</script>

<template>
  <header class="mb-[clamp(32px,5vw,64px)] grid gap-5">
    <p v-if="index" class="font-mono text-[12.5px] text-accent">{{ index }}</p>
    <component :is="level" class="text-[clamp(46px,7.4vw,108px)] font-[780] leading-[0.9] tracking-[-0.055em]">
      <slot name="title">{{ title }}</slot>
    </component>
    <div v-if="$slots.default" class="max-w-[46ch] text-ink-2">
      <slot />
    </div>
  </header>
</template>
