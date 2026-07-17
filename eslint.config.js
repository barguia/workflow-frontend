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
