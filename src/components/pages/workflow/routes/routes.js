import WorkflowPage from "@/components/pages/workflow/WorkflowPage.vue";
import TarefaPage from "@/components/pages/workflow/TarefaPage.vue";
import ProcessoPage from "@/components/pages/workflow/ProcessoPage.vue";
import FormExemploPage from "@/components/form-dinamico/FormExemploPage.vue";
import HierarquiaPage from "@/components/pages/workflow/HierarquiaPage.vue";
import ProjetoPage from "@/components/pages/workflow/ProjetoPage.vue";
import VolumetriaBacklog from "@/components/pages/workflow/VolumetriaBacklog.vue";

const routes = [
    {
        path: '/hierarquias',
        name: 'Hierarquia',
        component: HierarquiaPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/tarefas',
        name: 'Tarefa',
        component: TarefaPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/processos',
        name: 'Processo',
        component: ProcessoPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/workflows',
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
    {
        path: '/projetos',
        name: 'Projeto',
        component: ProjetoPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/backlog',
        name: 'backlog',
        component: VolumetriaBacklog,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
]
export default routes