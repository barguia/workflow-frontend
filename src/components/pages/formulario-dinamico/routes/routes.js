import GestaoFormularioPage from "@/components/pages/formulario-dinamico/GestaoFormularioPage.vue";

const HASHES_VALIDOS = [
    '#visao-geral', '#formularios', '#campos', '#regras-campos',
]

const routes = [
    {
        path: '/adm/formularios',
        name: 'GestaoFormulario',
        component: GestaoFormularioPage,
        icon: "mdi-text-box-multiple-outline",
        meta: { requiresAuth: true },
        beforeEnter: (to) => {
            if (to.hash && !HASHES_VALIDOS.includes(to.hash)) {
                return { path: '/adm/formularios', hash: '#visao-geral' }
            }
        },
    },
]

export default routes
