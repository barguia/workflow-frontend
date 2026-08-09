import { defineStore } from 'pinia';
import CryptoJS from 'crypto-js';
import {authService} from "@/services/authService.js";

const CRYPTO_KEY = import.meta.env.VITE_CRYPTO_KEY || 'sua-chave-secreta-aqui';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        menus: [],
        loaded: false,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        getMenus: (state) => state.menus,
    },
    actions: {
        async login({ email, password }) {
            try {
                const { token, menus } = await authService.login({ email, password });
                this.setSessao(token, menus);

                return true;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        setSessao(newToken, menus) {
            if (newToken) {
                const encrypted = CryptoJS.AES.encrypt(newToken, CRYPTO_KEY).toString();
                localStorage.setItem('authToken', encrypted);
                localStorage.setItem('menus', JSON.stringify(menus));
                this.token = newToken;
                this.menus = menus
                this.loaded = true;
            }
        },
        // Descriptografa e carrega do LocalStorage.
        // Sempre reavalia o localStorage como fonte da verdade: se não houver
        // mais token persistido (ex: removido por um 401 em outra aba, ou por
        // limpaSessao() já ter rodado), garante que o estado em memória não
        // fique "grudado" numa sessão que já não existe mais.
        loadToken() {
            const encrypted = localStorage.getItem('authToken');
            if (!encrypted) {
                if (this.token !== null || this.menus.length > 0) {
                    this.limpaSessao();
                }
                return;
            }

            try {
                const bytes = CryptoJS.AES.decrypt(encrypted, CRYPTO_KEY);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                const menusJson = localStorage.getItem('menus');
                const menus = menusJson ? JSON.parse(menusJson) : [];

                this.token = decrypted;
                this.menus = Array.isArray(menus) ? menus : [];
                this.loaded = true;
            } catch (error) {
                console.error('Erro ao descriptografar token:', error);
                this.limpaSessao();
            }
        },
        // Reavalia o estado de autenticação a partir do localStorage a cada
        // chamada (usado pelo guard de rotas). Antes, o uso de `loaded` como
        // trava impedia que uma sessão invalidada fora do fluxo do interceptor
        // (ex: localStorage limpo manualmente ou por outra aba) fosse detectada
        // em navegações subsequentes dentro da mesma sessão de SPA.
        async checkAuth() {
            this.loadToken();
            this.loaded = true;
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
            this.menus = [];
            this.loaded = false;
            localStorage.removeItem('authToken');
            localStorage.removeItem('menus');
        }
    },
});