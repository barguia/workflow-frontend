import {createRouter, createWebHistory} from 'vue-router'
import { createPinia } from 'pinia'; // Importe Pinia aqui
import { useAuthStore } from '@/stores/authStore';

import UserPage from "@/components/pages/aplicacao/UserPage.vue";
import LoginPage from "@/components/pages/aplicacao/LoginPage.vue";
import PerfilPage from "@/components/pages/aplicacao/PerfilPage.vue";

const pinia = createPinia();

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
        icon: "mdi-user",
    },
    {
        path: '',
        name: 'Home',
        component: UserPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/perfil',
        name: 'Perfil',
        component: PerfilPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/user',
        name: 'User',
        component: UserPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/components/pages/NotFoundView.vue'),
        meta: { layout: 'public' }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore(pinia); // Acesse via pinia instance
    await authStore.checkAuth();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {

        next('/login'); // Redireciona para login
    } else {
        next(); // Prossegue
    }
});

export default router;
