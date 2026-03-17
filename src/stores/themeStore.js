import { defineStore } from 'pinia'
import { ref } from 'vue'

export const THEMES = [
    {
        key: 'light',
        label: 'Claro',
        icon: 'mdi-white-balance-sunny',
        preview: '#4A6CF7',
    },
    {
        key: 'dark',
        label: 'Escuro',
        icon: 'mdi-weather-night',
        preview: '#6366F1',
    },
    {
        key: 'violeta',
        label: 'Violeta',
        icon: 'mdi-palette-outline',
        preview: '#7C3AED',
    },
    {
        key: 'aurora',
        label: 'Aurora',
        icon: 'mdi-shimmer',
        preview: '#00D4AA',
    },
    {
        key: 'ambar',
        label: 'Âmbar',
        icon: 'mdi-candle',
        preview: '#D97706',
    },
    {
        key: 'oceano',
        label: 'Oceano',
        icon: 'mdi-waves',
        preview: '#0EA5E9',
    },
]

export const useThemeStore = defineStore('theme', () => {
    const currentTheme = ref(localStorage.getItem('theme') || 'light')

    function applyTheme(themeKey, vuetifyTheme) {
        const exists = THEMES.some(t => t.key === themeKey)
        if (!exists) return

        currentTheme.value = themeKey
        localStorage.setItem('theme', themeKey)
        vuetifyTheme.global.name.value = themeKey
    }

    return { currentTheme, themes: THEMES, applyTheme }
})
