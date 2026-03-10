import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore, THEMES } from '@/stores/themeStore'

function makeVuetifyMock() {
  return { global: { name: { value: 'light' } } }
}

describe('themeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('THEMES', () => {
    it('exporta pelo menos 6 temas', () => {
      expect(THEMES.length).toBeGreaterThanOrEqual(6)
    })

    it('cada tema possui key, label, icon e preview', () => {
      THEMES.forEach((theme) => {
        expect(theme).toHaveProperty('key')
        expect(theme).toHaveProperty('label')
        expect(theme).toHaveProperty('icon')
        expect(theme).toHaveProperty('preview')
      })
    })

    it('contém os temas light e dark', () => {
      const keys = THEMES.map((t) => t.key)
      expect(keys).toContain('light')
      expect(keys).toContain('dark')
    })
  })

  describe('currentTheme', () => {
    it('inicia com "light" quando localStorage está vazio', () => {
      const store = useThemeStore()
      expect(store.currentTheme).toBe('light')
    })

    it('inicia com o valor salvo no localStorage', () => {
      localStorage.setItem('theme', 'dark')
      // Recria store para pegar o valor do localStorage
      setActivePinia(createPinia())
      const store = useThemeStore()
      expect(store.currentTheme).toBe('dark')
    })
  })

  describe('applyTheme', () => {
    it('atualiza currentTheme para um tema válido', () => {
      const store = useThemeStore()
      const vuetify = makeVuetifyMock()
      store.applyTheme('dark', vuetify)
      expect(store.currentTheme).toBe('dark')
    })

    it('persiste o tema no localStorage', () => {
      const store = useThemeStore()
      const vuetify = makeVuetifyMock()
      store.applyTheme('violeta', vuetify)
      expect(localStorage.getItem('theme')).toBe('violeta')
    })

    it('atualiza o tema do Vuetify', () => {
      const store = useThemeStore()
      const vuetify = makeVuetifyMock()
      store.applyTheme('aurora', vuetify)
      expect(vuetify.global.name.value).toBe('aurora')
    })

    it('ignora temas inválidos e não altera o estado', () => {
      const store = useThemeStore()
      const vuetify = makeVuetifyMock()
      store.applyTheme('light', vuetify)
      store.applyTheme('tema-inexistente', vuetify)
      expect(store.currentTheme).toBe('light')
      expect(vuetify.global.name.value).toBe('light')
    })

    it('aplica todos os temas do array THEMES sem erro', () => {
      const store = useThemeStore()
      const vuetify = makeVuetifyMock()
      THEMES.forEach((theme) => {
        store.applyTheme(theme.key, vuetify)
        expect(store.currentTheme).toBe(theme.key)
      })
    })
  })

  describe('themes', () => {
    it('expõe o array de temas via getter', () => {
      const store = useThemeStore()
      expect(store.themes).toStrictEqual(THEMES)
    })
  })
})
