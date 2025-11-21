import RolePage from "@/components/pages/controle-acesso/RolePage.vue";
import LoginPage from "@/components/pages/controle-acesso/LoginPage.vue";
import ForgotPasswordPage from "@/components/pages/controle-acesso/ForgotPasswordPage.vue";
import ResetPasswordPage from "@/components/pages/controle-acesso/ResetPasswordPage.vue";

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
        path: '/role',
        name: 'Role',
        component: RolePage,
        icon: "mdi-user",
        meta: { requiresAuth: true },
    },
]

export default routes