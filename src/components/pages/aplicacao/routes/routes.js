import HomePage from "@/components/pages/aplicacao/HomePage.vue";
import PerfilPage from "@/components/pages/aplicacao/PerfilPage.vue";
import UserPage from "@/components/pages/aplicacao/UserPage.vue";
import MenuPage from "@/components/pages/aplicacao/Menus/MenuPage.vue";
import OrganizacaoPage from "@/components/pages/aplicacao/OrganizacaoPage.vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage,
        icon: "mdi-home",
        meta: { requiresAuth: false },
    },
    {
        path: '/perfil',
        name: 'Perfil',
        component: PerfilPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/user',
        name: 'User',
        component: UserPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/menu',
        name: 'Menu',
        component: MenuPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
    {
        path: '/organizacao',
        name: 'Menu',
        component: OrganizacaoPage,
        icon: "mdi-home",
        meta: { requiresAuth: true },
    },
]

export default routes