import RolePage from "@/components/pages/controle-acesso/sub-pages/RolePage.vue";
import LoginPage from "@/components/pages/controle-acesso/LoginPage.vue";
import ForgotPasswordPage from "@/components/pages/controle-acesso/ForgotPasswordPage.vue";
import ResetPasswordPage from "@/components/pages/controle-acesso/ResetPasswordPage.vue";
import ControleAcessoPage from "@/components/pages/controle-acesso/ControleAcessoPage.vue";

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
        icon: "mdi-user",
        meta: { requiresAuth: false },
    },

    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: ForgotPasswordPage,
        meta: { requiresAuth: false },
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: ResetPasswordPage,
        meta: { requiresAuth: false },
    },
    {
        path: '/administracao',
        name: 'Administracao',
        component: ControleAcessoPage,
        icon: "mdi-shield-crown-outline",
        meta: { requiresAuth: true },
        beforeEnter: (to, from, next) => {
            const hashesValidos = ['#adm', '#organizacoes', '#usuarios', '#perfis', '#permissoes', '#menus']
            if (to.hash && !hashesValidos.includes(to.hash)) {
                next({ path: '/administracao', hash: '#adm' })
            } else {
                next()
            }
        },
    },
    {
        path: '/role',
        name: 'Role',
        component: RolePage,
        icon: "mdi-user",
        meta: { requiresAuth: true },
    },
]

export default routes