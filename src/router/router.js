import {createRouter, createWebHistory} from 'vue-router'
import { useAuthStore } from '@/stores/authStore';

import controleAcessoRoutes from "@/components/pages/controle-acesso/routes/routes.js"
import appRoutes from "@/components/pages/aplicacao/routes/routes.js"
import workflowRoutes from "@/components/pages/projeto/routes/routes.js"
import formDinamicoRoutes from "@/components/pages/formulario-dinamico/routes/routes.js"
import FormExemploPage from "@/components/form-dinamico/FormExemploPage.vue";
import MobilidadeExemploPage from "@/components/pages/mobilidade/MobilidadeExemploPage.vue";
import MobilidadeVueFlowPage from "@/components/pages/mobilidade/MobilidadeVueFlowPage.vue";
import MobilidadeVisNetworkSimplesPage from "@/components/pages/mobilidade/MobilidadeVisNetworkSimplesPage.vue";
import MobilidadeVisNetworkPage from "@/components/pages/mobilidade/MobilidadeVisNetworkPage.vue";
import MobilidadeNomeadaVueFlowSimplesPage from "@/components/pages/mobilidade/MobilidadeNomeadaVueFlowSimplesPage.vue";
import MobilidadeNomeadaVueFlowPage from "@/components/pages/mobilidade/MobilidadeNomeadaVueFlowPage.vue";
import MobilidadeNomeadaVisNetworkSimplesPage from "@/components/pages/mobilidade/MobilidadeNomeadaVisNetworkSimplesPage.vue";
import MobilidadeNomeadaVisNetworkPage from "@/components/pages/mobilidade/MobilidadeNomeadaVisNetworkPage.vue";

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
        path: '/mobilidade-exemplo',
        name: 'Mobilidade Exemplo',
        component: MobilidadeExemploPage,
    },
    {
        path: '/mobilidade-vue-flow',
        name: 'Mobilidade Vue Flow',
        component: MobilidadeVueFlowPage,
        meta: { requiresAuth: true },
    },
    {
        path: '/mobilidade-vis-network-simples',
        name: 'Mobilidade Vis Network Simples',
        component: MobilidadeVisNetworkSimplesPage,
    },
    {
        path: '/mobilidade-vis-network',
        name: 'Mobilidade Vis Network',
        component: MobilidadeVisNetworkPage,
        meta: { requiresAuth: true },
    },
    {
        path: '/mobilidade-nomeada-vue-flow-simples',
        name: 'Mobilidade Nomeada Vue Flow Simples',
        component: MobilidadeNomeadaVueFlowSimplesPage,
    },
    {
        path: '/mobilidade-nomeada-vue-flow',
        name: 'Mobilidade Nomeada Vue Flow',
        component: MobilidadeNomeadaVueFlowPage,
        meta: { requiresAuth: true },
    },
    {
        path: '/mobilidade-nomeada-vis-network-simples',
        name: 'Mobilidade Nomeada Vis Network Simples',
        component: MobilidadeNomeadaVisNetworkSimplesPage,
    },
    {
        path: '/mobilidade-nomeada-vis-network',
        name: 'Mobilidade Nomeada Vis Network',
        component: MobilidadeNomeadaVisNetworkPage,
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
    // Usa a instância de Pinia globalmente ativa (instalada em main.js via
    // app.use(pinia)), garantindo que o guard reflita o MESMO authStore usado
    // pelo restante da aplicação (api.js, MenuCompletoComponent, LoginPage).
    // Antes, este guard criava sua PRÓPRIA instância de Pinia isolada, o que
    // fazia a sessão parecer "grudada" nos demais componentes mesmo depois
    // de o guard já ter detectado e limpo a sessão em seu authStore próprio.
    const authStore = useAuthStore();
    await authStore.checkAuth();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login');
    } else {
        next();
    }
});

export default router;
