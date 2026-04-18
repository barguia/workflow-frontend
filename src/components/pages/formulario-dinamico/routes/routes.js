
import GestaoFormularioPage from "@/components/pages/formulario-dinamico/GestaoFormularioPage.vue";
import CampoPage from "@/components/pages/formulario-dinamico/sub-pages/CampoPage.vue";

// const HASHES_VALIDOS = [
//     '#visao-geral', '#projetos', '#tarefas', '#processos',
//     '#hierarquias', '#workflows', '#pesquisa', '#backlog',
// ]

const routes = [
    {
        path: '/adm/formularios',
        name: 'GestaoFormulario',
        component: GestaoFormularioPage,
        icon: "mdi-briefcase-outline",
        meta: { requiresAuth: true },
        // beforeEnter: (to, from, next) => {
        //     if (to.hash && !HASHES_VALIDOS.includes(to.hash)) {
        //         next({ path: '/adm/formularios', hash: '#visao-geral' })
        //     } else {
        //         next()
        //     }
        // },
    },
    {
        path: '/campos',
        name: 'CampoPage',
        component: CampoPage,
        icon: "mdi-file-document-outline",
        meta: { requiresAuth: true },
    },
]

export default routes
