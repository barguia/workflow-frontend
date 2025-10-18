import axios from 'axios';
import {useAuthStore} from "@/stores/authStore.js";
import {useLoading} from "@/composables/useLoading.js";
// import { useRouter } from 'vue-router';
import router from '@/router';


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
        listener: 'validation-errors',
        errors: error.response.data.errors,
        message: error.response.data.message || 'Erro de validação. Corrija os campos destacados.',
    }),
    403: (error) => ({
        type: 'forbidden',
        errorType: 'error',
        listener: 'notification',
        errors: error.response.data.errors,
        message: error.response.data.message || 'Acesso negado. Solicite permissão para o administrador.',
    }),
    401: (error) => {
        const authStore = useAuthStore();
        authStore.limpaSessao();

        const publicRoutes = ['/login', '/forgot-password', '/register'];
        const publicEndpoints = ['/api/login', '/api/register', '/api/password/reset'];
        const currentPath = router.currentRoute.value?.path || '';
        const requestUrl = error.config?.url || 'unknown';

        if (
            currentPath &&
            !publicRoutes.includes(currentPath) &&
            !publicEndpoints.some(endpoint => requestUrl.includes(endpoint))
        ) {
            router.push('/login').catch(err => {
                console.error('Erro ao redirecionar para /login:', err);
            });
        }

        return {
            type: 'unauthorized',
            errorType: 'error',
            listener: 'notification',
            errors: error.response.data.errors,
            message: error.response.data.message,
        };
    },
    500: (error) => {
        return {
            type: 'server',
            errorType: 'error',
            listener: 'notification',
            errors: error.response.data.errors,
            message: error.response.data.message,
        };
    },
};

api.interceptors.request.use(config => {
    const authStore = useAuthStore();
    authStore.loadToken();
    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
});

api.interceptors.request.use((config) => {
    const { startLoading } = useLoading();
    startLoading();
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
            listener: 'notification',
            errorType: 'error',
            message: 'Erro ao processar os dados.',
            detail: error,
            errors: error,
        }));

        const errorData = handler(error); // Executa o handler com o erro

        // Dispara evento para o composable useNotifications
        if (errorData.listener === 'notification') {
            window.dispatchEvent(
                new CustomEvent('notification', {
                    detail: {
                        type: errorData.errorType,
                        message: errorData.message,
                    },
                })
            );
        } else if (errorData.listener === 'validation-errors') {
            window.dispatchEvent(
                new CustomEvent('validation-errors', {
                    detail: errorData.errors,
                })
            );
        }

        return Promise.reject(errorData);
    }
);

export default api;
