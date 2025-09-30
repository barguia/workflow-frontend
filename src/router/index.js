import { createMemoryHistory, createRouter } from 'vue-router'
import UserPage from "@/components/pages/aplicacao/UserPage.vue";
const routes = [
    {
        path: '/user',
        name: 'User',
        component: UserPage,
        icon: "mdi-home",
        page_id: '#home',
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
