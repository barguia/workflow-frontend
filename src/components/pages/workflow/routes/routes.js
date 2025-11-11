import WorkflowPage from "@/components/pages/workflow/WorkflowPage.vue";
import TarefaPage from "@/components/pages/workflow/TarefaPage.vue";
import ProcessoPage from "@/components/pages/workflow/ProcessoPage.vue";
import FormExemploPage from "@/components/form-dinamico/FormExemploPage.vue";
import HierarquiaPage from "@/components/pages/workflow/HierarquiaPage.vue";

const routes = [
    {
        path: '/hierarquia',
        name: 'Hierarquia',
        component: HierarquiaPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/tarefa',
        name: 'Tarefa',
        component: TarefaPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/processo',
        name: 'Processo',
        component: ProcessoPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/workflow',
        name: 'Workflow',
        component: WorkflowPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/formulario-dinamico-exemplo',
        name: 'FormularioDinamicoExemplo',
        component: FormExemploPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
]
export default routes