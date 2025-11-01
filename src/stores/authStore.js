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
        // Descriptografa e carrega do LocalStorage
        loadToken() {
            const encrypted = localStorage.getItem('authToken');
            const menusJson = localStorage.getItem('menus');
            if (encrypted) {
                try {
                    const bytes = CryptoJS.AES.decrypt(encrypted, CRYPTO_KEY);
                    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                    this.token = decrypted;
                    const menus = menusJson ? JSON.parse(menusJson) : [];
                    this.menus = Array.isArray(menus) ? menus : [];
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
                        this.menus = localStorage.getItem('menus');
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
            this.menus = [];
            this.loaded = false;
            localStorage.removeItem('authToken');
            localStorage.removeItem('menus');
        }
    },
});