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
    defaults: {
        VTextField:  { variant: 'outlined', density: 'comfortable', color: 'primary' },
        VTextarea:   { variant: 'outlined', density: 'comfortable', color: 'primary', rows: 3 },
        VSelect:     { variant: 'outlined', density: 'comfortable', color: 'primary' },
        VCombobox:   { variant: 'outlined', density: 'comfortable', color: 'primary' },
        VRadioGroup: { color: 'primary', density: 'comfortable' },
        VCheckbox:   { color: 'primary', density: 'comfortable' },
        VDataTable:  { density: 'comfortable', hover: true },
        VBtn:        { style: 'text-transform: none; letter-spacing: 0' },
    },
    theme: {
        defaultTheme: localStorage.getItem('theme') || 'light',
        themes: {
            light: {
                dark: false,
                colors: {
                    background: '#F0F4F8',
                    surface: '#FFFFFF',
                    primary: '#4A6CF7',
                    secondary: '#6C8EBD',
                    accent: '#0EA5E9',
                    error: '#EF4444',
                    warning: '#F59E0B',
                    info: '#3B82F6',
                    success: '#10B981',
                    textPrimary: '#0F172A',
                    textSecondary: '#475569',
                },
            },
            dark: {
                dark: true,
                colors: {
                    background: '#0D1117',
                    surface: '#161B22',
                    primary: '#58A6FF',
                    secondary: '#BC8CFF',
                    accent: '#3FB950',
                    error: '#F85149',
                    warning: '#D29922',
                    info: '#58A6FF',
                    success: '#3FB950',
                    textPrimary: '#E6EDF3',
                    textSecondary: '#8B949E',
                },
            },
            violeta: {
                dark: false,
                colors: {
                    background: '#F5F0FF',
                    surface: '#FFFFFF',
                    primary: '#7C3AED',
                    secondary: '#A78BFA',
                    accent: '#EC4899',
                    error: '#EF4444',
                    warning: '#F59E0B',
                    info: '#8B5CF6',
                    success: '#10B981',
                    textPrimary: '#1E1B4B',
                    textSecondary: '#6B21A8',
                },
            },
            aurora: {
                dark: true,
                colors: {
                    background: '#071520',
                    surface: '#0D2137',
                    primary: '#00D4AA',
                    secondary: '#7B68EE',
                    accent: '#FF6B9D',
                    error: '#FF5252',
                    warning: '#FFD740',
                    info: '#40C4FF',
                    success: '#00BFA5',
                    textPrimary: '#E8F4F8',
                    textSecondary: '#90CAD4',
                },
            },
            ambar: {
                dark: false,
                colors: {
                    background: '#FFFBF0',
                    surface: '#FFFFFF',
                    primary: '#D97706',
                    secondary: '#B45309',
                    accent: '#EA580C',
                    error: '#DC2626',
                    warning: '#F59E0B',
                    info: '#0284C7',
                    success: '#059669',
                    textPrimary: '#1C1917',
                    textSecondary: '#78716C',
                },
            },
            oceano: {
                dark: false,
                colors: {
                    background: '#EFF6FF',
                    surface: '#FFFFFF',
                    primary: '#0EA5E9',
                    secondary: '#0891B2',
                    accent: '#6366F1',
                    error: '#EF4444',
                    warning: '#F59E0B',
                    info: '#0EA5E9',
                    success: '#10B981',
                    textPrimary: '#0C1A2E',
                    textSecondary: '#334155',
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
