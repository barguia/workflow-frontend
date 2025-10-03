import { defineStore } from 'pinia';
import CryptoJS from 'crypto-js';
import {authService} from "@/services/auth.js";

const CRYPTO_KEY = import.meta.env.VITE_CRYPTO_KEY || 'sua-chave-secreta-aqui';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        loaded: false,
    }),
    getters: {
        isAuthenticated: (state) => state.loaded,
    },
    actions: {
        async login({ email, password }) {
            try {
                const { token } = await authService.login({ email, password });
                this.setToken(token);
                return true;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        setToken(newToken) {
            if (newToken) {
                const encrypted = CryptoJS.AES.encrypt(newToken, CRYPTO_KEY).toString();
                localStorage.setItem('authToken', encrypted);
                this.token = newToken;
                this.loaded = true;
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
                    this.loaded = true;
                } catch (error) {
                    console.error('Erro ao descriptografar token:', error);
                    this.limpaSessao();
                }
            }
        },
        async checkAuth() {
            if (!this.loaded) {
                const encrypted = localStorage.getItem('authToken');
                if (encrypted) {
                    try {
                        const bytes = CryptoJS.AES.decrypt(encrypted, CRYPTO_KEY);
                        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                        this.token = decrypted;
                    } catch (error) {
                        console.error('Erro ao descriptografar token:', error);
                        this.limpaSessao();
                    }
                }
                this.loaded = true;
            }
            return this.isAuthenticated;
        },
        async logout() {
            try {
                await authService.logout();
                this.limpaSessao();
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        limpaSessao() {
            this.token = null;
            this.loaded = false;
            localStorage.removeItem('authToken');
        }
    },
});