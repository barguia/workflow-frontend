import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router.js'
import { createPinia } from 'pinia';

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import '@mdi/font/css/materialdesignicons.css';
import './assets/css/global.css';
import {useAuthStore} from "@/stores/authStore.js";

const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
        themes: {
            light: {
                colors: {
                    background: '#F5F7FA',
                    surface: '#FFFFFF',
                    primary: '#3A86FF',
                    secondary: '#A8DADC',
                    accent: '#457B9D',
                    textPrimary: '#333333',
                    textSecondary: '#555555',
                },
            },
            dark: {
                colors: {
                    background: '#1E1E1E',
                    surface: '#333333',
                    primary: '#BB86FC',
                    secondary: '#03DAC5',
                    accent: '#3700B3',
                    textPrimary: '#E0E0E0',
                    textSecondary: '#A0A0A0',
                },
            },
            tech: {
                colors: {
                    background: '#E0F7FA',
                    surface: '#E0F2F1',
                    primary: '#00796B',
                    secondary: '#004D40',
                    accent: '#00BCD4',
                    textPrimary: '#004D40',
                    textSecondary: '#00796B',
                },
            },
        },
    },
})
const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const authStore = useAuthStore();
authStore.loadToken();

app.use(router);
app.use(vuetify);
app.mount('#app')
