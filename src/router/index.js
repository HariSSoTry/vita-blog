import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/blog/:id',
    name: 'blog',
    component: () => import('@/views/BlogView.vue'),
    props: true
  },
  {
    path: '/post/:id',
    name: 'post',
    component: () => import('@/views/PostView.vue'),
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/components/UserManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create-post',
    name: 'create-post',
    component: () => import('@/views/CreatePostView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router