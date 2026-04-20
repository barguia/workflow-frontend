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
        beforeEnter: (to, from, next) => {
            if (to.hash && !HASHES_VALIDOS.includes(to.hash)) {
                next({ path: '/adm/formularios', hash: '#visao-geral' })
            } else {
                next()
            }
        },
    },
]

export default routes
