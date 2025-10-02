import axios from 'axios';
import store from '@/store';

const api = axios.create({
    baseURL: process.env.VUE_APP_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = store.state.token;
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 422) {
            return Promise.reject({
                type: 'validation',
                errors: error.response.data.errors,
                message: "Erro de validação. Corrija os campos destacados."
            });
        }

        if (error.response && error.response.status === 403) {
            return Promise.reject({
                type: 'forbidden',
                errors: error.response.data.errors,
                message: "Acesso negado. Solicite permissão para o administrador."
            });
        }

        if (error.response && error.response.status === 401) {
            store.commit('CLEAR_TOKEN');
            return Promise.reject({
                type: 'unauthorized',
                errors: error.response.data.errors,
                message: "Efetue o login para navegar no sistema."
            });
        }


        // Para outros erros, personalize como necessário
        return Promise.reject({
            type: 'general',
            message: "Erro ao processar os dados.",
            details: error
        });
    }
);

export default api;
