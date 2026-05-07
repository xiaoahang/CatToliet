import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import intersectDirective from './directives/intersect'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: Home }],
})

const app = createApp(App)
app.use(router)
app.directive('intersect', intersectDirective)
app.mount('#app')
