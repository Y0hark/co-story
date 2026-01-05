import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'landing',
            component: Landing
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('../views/auth/Login.vue')
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('../views/auth/Register.vue')
        }
    ]
})

export default router
