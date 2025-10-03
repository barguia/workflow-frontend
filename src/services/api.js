import axios from 'axios';
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import {useLoading} from "@/composables/useLoading.js";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});


const errorHandlers = {
    422: (error) => ({
        type: 'validation',
        errors: error.response.data.errors,
        message: 'Erro de validação. Corrija os campos destacados.',
    }),
    403: (error) => ({
        type: 'forbidden',
        errors: error.response.data.errors,
        message: 'Acesso negado. Solicite permissão para o administrador.',
    }),
    401: (error) => {
        const authStore = useAuthStore(); // Assumindo Pinia disponível
        authStore.logout();
        return {
            type: 'unauthorized',
            errors: error.response.data.errors,
            message: 'Efetue o login para navegar no sistema.',
        };
    },
};

api.interceptors.request.use((config) => {
    const { startLoading } = useLoading();
    startLoading();
    return config;
});

api.interceptors.request.use(config => {
    const authStore = useAuthStore();
    authStore.loadToken();
    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        const { stopLoading } = useLoading();
        stopLoading();
        return response;
    },
    (error) => {
        const { stopLoading } = useLoading();
        stopLoading();
        const { response } = error;
        const status = response?.status;

        const handler = errorHandlers[status] || (() => ({
            type: 'general',
            message: 'Erro ao processar os dados.',
            details: error,
        }));

        return Promise.reject(handler(error));
    }
);

export default api;
