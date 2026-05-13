// router/index.ts - Vue Router 配置
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/HomePage.vue'),
    meta: { showNav: true }
  },
  {
    path: '/beast',
    name: 'beast',
    component: () => import('../pages/BeastPage.vue'),
    meta: { showNav: true }
  },
  {
    path: '/beast/select',
    name: 'beast-select',
    component: () => import('../pages/BeastSelectPage.vue'),
    meta: { showNav: false }
  },
  {
    path: '/task',
    name: 'task',
    component: () => import('../pages/TaskPage.vue'),
    meta: { showNav: true }
  },
  {
    path: '/duel',
    name: 'duel',
    component: () => import('../pages/DuelPage.vue'),
    meta: { showNav: true }
  },
  {
    path: '/battle/:duelId',
    name: 'battle',
    component: () => import('../pages/BattlePage.vue'),
    meta: { showNav: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router