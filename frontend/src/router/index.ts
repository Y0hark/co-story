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
        }, // Added comma here
        {
            path: '/app',
            component: () => import('../layouts/MainLayout.vue'),
            meta: { requiresAuth: true }, // We'll assume this for now, even if guard isn't fully robust yet
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: () => import('../views/Dashboard.vue'),
                    meta: { title: 'Dashboard' }
                },
                {
                    path: 'studio/:id?', // Optional ID for editing specific story
                    name: 'studio',
                    component: () => import('../views/studio/Studio.vue'),
                    meta: { title: 'Writing Studio' }
                },
                {
                    path: 'community',
                    name: 'community',
                    component: () => import('../views/Community.vue'),
                    meta: { title: 'Community' }
                },
                {
                    path: 'profile',
                    name: 'Profile',
                    component: () => import('../views/Profile.vue'),
                    meta: { title: 'Your Profile' }
                },
                {
                    path: 'new-story',
                    name: 'NewStory',
                    component: () => import('../views/NewStory.vue'),
                    meta: { title: 'New Story' }
                },
                {
                    path: 'read/:id',
                    name: 'Reader',
                    component: () => import('../views/Reader.vue'),
                    meta: { title: 'Reading Mode' }
                }
            ]
        }
    ]
})

export default router
