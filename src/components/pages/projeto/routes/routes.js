import WorkflowPage from "@/components/pages/projeto/WorkflowPage.vue";
import TarefaPage from "@/components/pages/projeto/TarefaPage.vue";
import ProcessoPage from "@/components/pages/projeto/ProcessoPage.vue";
import FormExemploPage from "@/components/form-dinamico/FormExemploPage.vue";
import HierarquiaPage from "@/components/pages/projeto/HierarquiaPage.vue";
import ProjetoPage from "@/components/pages/projeto/ProjetoPage.vue";
import VolumetriaBacklog from "@/components/pages/projeto/VolumetriaBacklog.vue";
import PesquisaPage from "@/components/pages/projeto/PesquisaPage.vue";
import FichaTecnicaPage from "@/components/pages/projeto/FichaTecnicaPage.vue";
import FilaTarefaPage from "@/components/pages/projeto/FilaTarefaPage.vue";

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
    {
        path: '/pesquisa',
        name: 'Pesquisa',
        component: PesquisaPage,
        icon: "mdi-magnify",
        meta: { requiresAuth: true },
    },
    {
        path: '/ficha-tecnica/:id',
        name: 'FichaTecnica',
        component: FichaTecnicaPage,
        icon: "mdi-file-document-outline",
        meta: { requiresAuth: true },
    },
    {
        path: '/fila-tarefa/:id',
        name: 'FilaTarefa',
        component: FilaTarefaPage,
        icon: "mdi-format-list-checks",
        meta: { requiresAuth: true },
    },
]
export default routes
