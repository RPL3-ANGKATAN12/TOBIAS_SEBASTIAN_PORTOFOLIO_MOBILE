import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Tobias' } },
    { path: '/project', name: 'project', component: () => import('../views/ProjectView.vue'), meta: { title: 'Projects · Tobias' } },
    { path: '/contact', name: 'contact', component: () => import('../views/ContactView.vue'), meta: { title: 'Contact · Tobias' } }
  ]
})

router.afterEach(to => {
  document.title = (to.meta.title as string | undefined) ?? 'Tobias'
})

export default router
