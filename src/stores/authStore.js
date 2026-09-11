import { defineStore } from 'pinia';
import {authService} from "@/services/authService.js";
import { encryptToken, decryptToken } from "@/utils/tokenCrypto.js";

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
                await this.setSessao(token, menus);

                return true;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        async setSessao(newToken, menus) {
            if (newToken) {
                const encrypted = await encryptToken(newToken, CRYPTO_KEY);
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
        async loadToken() {
            const encrypted = localStorage.getItem('authToken');
            if (!encrypted) {
                if (this.token !== null || this.menus.length > 0) {
                    this.limpaSessao();
                }
                return;
            }

            try {
                const decrypted = await decryptToken(encrypted, CRYPTO_KEY);
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
            await this.loadToken();
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