import GestaoProjetoPage from "@/components/pages/projeto/GestaoProjetoPage.vue";
import FichaTecnicaPage from "@/components/pages/projeto/FichaTecnicaPage.vue";
import FilaTarefaPage from "@/components/pages/projeto/FilaTarefaPage.vue";
import MobilidadePage from "@/components/pages/projeto/tarefa/MobilidadePage.vue";

const HASHES_VALIDOS = [
    '#visao-geral', '#projetos', '#tarefas', '#processos',
    '#hierarquias', '#workflows', '#pesquisa', '#backlog',
]

const routes = [
    {
        path: '/adm/projetos',
        name: 'GestaoProjetoProjeto',
        component: GestaoProjetoPage,
        icon: "mdi-briefcase-outline",
        meta: { requiresAuth: true },
        beforeEnter: (to, from, next) => {
            if (to.hash && !HASHES_VALIDOS.includes(to.hash)) {
                next({ path: '/adm/projetos', hash: '#visao-geral' })
            } else {
                next()
            }
        },
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
    {
        path: '/mobilidade-tarefa/:id',
        name: 'MobilidadeTarefa',
        component: MobilidadePage,
        icon: "mdi-transit-connection-variant",
        meta: { requiresAuth: true },
    },
]

export default routes
