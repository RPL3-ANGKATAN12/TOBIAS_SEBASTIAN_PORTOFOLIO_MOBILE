import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { reveal } from './lib/reveal'

const app = createApp(App)

app.use(router)
app.directive('reveal', reveal)

app.mount('#app')
