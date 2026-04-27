import {createRouter, createWebHistory} from 'vue-router'
import { createPinia } from 'pinia'; // Importe Pinia aqui
import { useAuthStore } from '@/stores/authStore';

import controleAcessoRoutes from "@/components/pages/controle-acesso/routes/routes.js"
import appRoutes from "@/components/pages/aplicacao/routes/routes.js"
import workflowRoutes from "@/components/pages/projeto/routes/routes.js"
import formDinamicoRoutes from "@/components/pages/formulario-dinamico/routes/routes.js"
import FormExemploPage from "@/components/form-dinamico/FormExemploPage.vue";

const pinia = createPinia();

const routes = [
    ...controleAcessoRoutes,
    ...appRoutes,
    ...workflowRoutes,
    ...formDinamicoRoutes,

    {
        path: '/form-dinamico-exemplo',
        name: 'Formulario Dinâmico Exemplo',
        component: FormExemploPage,
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
        next('/login');
    } else {
        next();
    }
});

export default router;
