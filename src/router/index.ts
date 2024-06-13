import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'


Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/vehiculos',
    name: 'vehiculos',
    component: () => import('../views/VehiculosView.vue')
  },
  {
    path: '/marcas',
    name: 'marcas',
    component: () => import('../views/MarcasView.vue')
  },
  {
    path: '/modelos',
    name: 'modelos',
    component: () => import('../views/ModelosView.vue')
  },
  {
    path: '/combustibles',
    name: 'combustibles',
    component: () => import('../views/CombustiblesView.vue'),
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: () =>  import('../views/ProfileView.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
