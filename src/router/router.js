import {createRouter, createWebHistory} from 'vue-router'
import { createPinia } from 'pinia'; // Importe Pinia aqui
import { useAuthStore } from '@/stores/authStore';

import appRoutes from "@/components/pages/aplicacao/routes/routes.js"
import authRoutes from "@/components/pages/autenticacao/routes/routes.js"
import workflowRoutes from "@/components/pages/workflow/routes/routes.js"

const pinia = createPinia();

const routes = [
    ...authRoutes,
    ...appRoutes,
    ...workflowRoutes,

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
        next('/login');
    } else {
        next();
    }
});

export default router;
