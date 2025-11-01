import LoginPage from "@/components/pages/autenticacao/LoginPage.vue";
import ForgotPasswordPage from "@/components/pages/autenticacao/ForgotPasswordPage.vue";
import ResetPasswordPage from "@/components/pages/autenticacao/ResetPasswordPage.vue";


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
]

export default routes