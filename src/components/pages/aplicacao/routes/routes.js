import HomePage from "@/components/pages/aplicacao/HomePage.vue";

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