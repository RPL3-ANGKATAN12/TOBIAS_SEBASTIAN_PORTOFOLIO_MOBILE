<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Header from './components/Header.vue'
import SideBar from './components/SideBar.vue'
import Footer from './components/Footer.vue'
import { lockScroll, resetScroll, startMotion } from './lib/motion'

const menu = ref(false)
const route = useRoute()

watch(() => route.fullPath, () => {
  menu.value = false
})
watch(menu, open => lockScroll(open))

onMounted(startMotion)
</script>

<template>
  <Header :open="menu" @toggle="menu = !menu" />
  <SideBar :open="menu" @close="menu = false" />
  <main id="main">
    <RouterView v-slot="{ Component, route: r }">
      <Transition name="page" mode="out-in" @after-leave="resetScroll">
        <component :is="Component" :key="r.path" />
      </Transition>
    </RouterView>
  </main>
  <Footer />
</template>
