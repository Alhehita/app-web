import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/authors',
    name: 'authors',
    component: () => import('../views/AuthorsPage.vue')
  },
  {
    path: '/books',
    name: 'books',
    component: () => import('../views/BooksPage.vue')
  },
  {
    path: '/customers',
    name: 'customers',
    component: () => import('../views/CustomersPage.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
