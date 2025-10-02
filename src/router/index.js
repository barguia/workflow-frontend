import {createRouter, createWebHistory} from 'vue-router'
import UserPage from "@/components/pages/aplicacao/UserPage.vue";
import ProjetosPage from "@/components/pages/Projetos/ProjetosPage.vue";
import LoginPage from "@/components/pages/aplicacao/login/LoginPage.vue";

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
        icon: "mdi-user",
    },
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
];

const router = createRouter({
    // history: createMemoryHistory(),
    history: createWebHistory(),
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
