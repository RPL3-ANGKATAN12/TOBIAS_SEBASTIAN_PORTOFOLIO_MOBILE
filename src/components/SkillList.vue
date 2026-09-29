<script setup lang="ts">
defineProps<{ skills: { name: string; note?: string }[]; heading?: string }>()
</script>

<template>
  <div>
    <h3 v-if="heading" class="mb-3.5 font-mono text-[12.5px] font-medium text-ink-2">{{ heading }}</h3>
    <ul class="border-t-[1.5px] border-ink">
      <li
        v-for="s in skills"
        :key="s.name"
        class="flex items-baseline justify-between gap-4 border-b border-rule py-[13px] text-[19px] font-[560] tracking-[-0.01em]"
      >
        {{ s.name }}
        <span v-if="s.note" class="text-right font-mono text-xs font-normal text-ink-3">{{ s.note }}</span>
      </li>
    </ul>
  </div>
</template>
