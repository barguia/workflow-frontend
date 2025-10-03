import api from '@/services/api.js'; // Instância Axios configurada

export const authService = {
    async login({ email, password }) {
        const response = await api.post('/login', { email, password });
        return response.data.data || response.data;
    },

    async logout() {
        const response = await api.get('/logout');
        return response.data.data || response.data;
    },
};