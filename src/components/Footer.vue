<script setup lang="ts">
import { EMAIL, GH, HF } from '@/data/site'
</script>

<template>
  <footer class="relative z-10 border-t-[1.5px] border-ink bg-paper pt-7 pb-[calc(1.75rem+var(--safe-bottom))] font-mono text-xs text-ink-2 px-gutter">
    <div class="flex flex-wrap justify-between gap-x-7 gap-y-3">
      <span>© 2026 Tobias</span>
      <span class="max-w-[60ch]">The 3D scenes are drawn in code for this site. They illustrate each project and aren't model outputs.</span>
      <span class="flex gap-4">
        <a :href="GH" target="_blank" rel="noopener" class="text-ink underline underline-offset-4 hover:text-accent">GitHub</a>
        <a :href="HF + 'TobiasLogic'" target="_blank" rel="noopener" class="text-ink underline underline-offset-4 hover:text-accent">Hugging Face</a>
        <a :href="'mailto:' + EMAIL" class="text-ink underline underline-offset-4 hover:text-accent">Email</a>
      </span>
    </div>
  </footer>
</template>
