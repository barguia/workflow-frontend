import HomePage from "@/components/pages/aplicacao/HomePage.vue";
import MenuPage from "@/components/pages/controle-acesso/sub-pages/MenuPage.vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage,
        icon: "mdi-home",
        meta: { requiresAuth: false },
    },
]

export default routes