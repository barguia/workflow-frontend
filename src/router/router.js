import {createRouter, createWebHistory} from 'vue-router'
import { useAuthStore } from '@/stores/authStore';

import controleAcessoRoutes from "@/components/pages/controle-acesso/routes/routes.js"
import appRoutes from "@/components/pages/aplicacao/routes/routes.js"
import workflowRoutes from "@/components/pages/projeto/routes/routes.js"
import formDinamicoRoutes from "@/components/pages/formulario-dinamico/routes/routes.js"
import FormExemploPage from "@/components/form-dinamico/FormExemploPage.vue";
import ExemploVueFlowGruposProcessoPage from "@/components/comuns/flow/ExemploVueFlowGruposProcessoPage.vue";
import FlowMobilidadeComponent from "@/components/pages/projeto/tarefa/FlowMobilidadeComponent.vue";

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
        path: '/exemplo-vue-flow-grupos-processo',
        name: 'Mobilidade Vue Flow Grupos de Processo',
        component: ExemploVueFlowGruposProcessoPage,
        meta: { requiresAuth: true },
    },
    {
        path: '/flow-mobilidade-preview/:ctrlWorkflowId',
        name: 'Flow Mobilidade Preview',
        component: FlowMobilidadeComponent,
        props: true,
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

router.beforeEach(async (to) => {
    // Usa a instância de Pinia globalmente ativa (instalada em main.js via
    // app.use(pinia)), garantindo que o guard reflita o MESMO authStore usado
    // pelo restante da aplicação (api.js, MenuCompletoComponent, LoginPage).
    // Antes, este guard criava sua PRÓPRIA instância de Pinia isolada, o que
    // fazia a sessão parecer "grudada" nos demais componentes mesmo depois
    // de o guard já ter detectado e limpo a sessão em seu authStore próprio.
    const authStore = useAuthStore();
    await authStore.checkAuth();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return '/login';
    }
});

export default router;
