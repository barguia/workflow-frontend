import { createMemoryHistory, createRouter } from 'vue-router'
import UserPage from "@/components/pages/aplicacao/UserPage.vue";
import ProjetosPage from "@/components/pages/Projetos/ProjetosPage.vue";
import LoginPage from "@/components/pages/aplicacao/login/LoginPage.vue";

const routes = [
    {
        path: '',
        name: 'Home',
        component: UserPage,
        icon: "mdi-home",
    },
    {
        path: '/',
        name: 'Home',
        component: UserPage,
        icon: "mdi-home",
    },
    {
        path: '/user',
        name: 'User',
        component: UserPage,
        icon: "mdi-home",
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
        icon: "mdi-home",
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: ProjetosPage,
        icon: "mdi-home",
    },
    {
        path: '/profiles',
        name: 'profiles',
        component: ProjetosPage,
        icon: "mdi-home",
    },
    {
        path: '/workflows',
        name: 'workflows',
        component: ProjetosPage,
        icon: "mdi-home",
    },
    {
        path: '/processes',
        name: 'processes',
        component: ProjetosPage,
        icon: "mdi-home",
    },
    {
        path: '/tasks',
        name: 'tasks',
        component: ProjetosPage,
        icon: "mdi-home",
    },
    {
        path: '/hierarchy',
        name: 'hierarchy',
        component: ProjetosPage,
        icon: "mdi-home",
    },
    {
        path: '/organizations',
        name: 'organizations',
        component: ProjetosPage,
        icon: "mdi-home",
    },
];

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

router.beforeEach(async (to, from, next) => {
    // const { isAuthenticated, checkAuth } = useAuth();

    if (to.meta.requiresAuth && !isAuthenticated.value) {
        console.log('teste')
        // await checkAuth();
        // if (isAuthenticated.value) {
        //     next('/');
        // } else {
        //     next('/login');
        // }
    } else {
        next();
    }
});
export default router;
