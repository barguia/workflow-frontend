import { createMemoryHistory, createRouter } from 'vue-router'
import UserPage from "@/components/pages/aplicacao/UserPage.vue";
// import LoginPage from "@/components/pages/aplicacao/LoginPage.vue";
import ProjetosPage from "@/components/pages/Projetos/ProjetosPage.vue";
const routes = [
    {
        path: '/user',
        name: 'User',
        component: UserPage,
        icon: "mdi-home",
        page_id: '#home',
    },
    {
        path: '/login',
        name: 'Login',
        component: ProjetosPage,
        icon: "mdi-home",
        page_id: '#login',
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
