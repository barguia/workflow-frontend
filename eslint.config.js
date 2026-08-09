import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // Vuetify usa nomes de slot com ponto (ex.: #item.nome, #header.nome)
      // como convenção, não como modificador de diretiva.
      'vue/valid-v-slot': ['error', { allowModifiers: true }],
    },
  },
  {
    files: [
      'vite.config.js',
      'vitest.config.js',
      'playwright.config.js',
      'scripts/**/*.js',
      'e2e/**/*.js',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]
