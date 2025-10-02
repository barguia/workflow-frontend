import { defineStore } from 'pinia';
import CryptoJS from 'crypto-js';

const CRYPTO_KEY = import.meta.env.VITE_CRYPTO_KEY || 'sua-chave-secreta-aqui';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null, // Estado em memória (descriptografado)
    }),
    actions: {
        // Criptografa e salva no LocalStorage
        setToken(newToken) {
            if (newToken) {
                const encrypted = CryptoJS.AES.encrypt(newToken, CRYPTO_KEY).toString();
                localStorage.setItem('authToken', encrypted);
                this.token = newToken; // Armazena descriptografado no estado
            }
        },
        // Descriptografa e carrega do LocalStorage
        loadToken() {
            const encrypted = localStorage.getItem('authToken');
            if (encrypted) {
                try {
                    const bytes = CryptoJS.AES.decrypt(encrypted, CRYPTO_KEY);
                    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                    this.token = decrypted;
                } catch (error) {
                    console.error('Erro ao descriptografar token:', error);
                    this.logout(); // Limpa se inválido
                }
            }
        },
        // Logout: Limpa tudo
        logout() {
            this.token = null;
            localStorage.removeItem('authToken');
        },
    },
});