import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'pt-BR',
  },

  projects: [
    // Faz login uma vez e salva o estado de autenticação
    {
      name: 'setup',
      testMatch: '**/auth/setup.js',
    },

    // Todos os outros testes reutilizam a sessão autenticada
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/state.json',
      },
      dependencies: ['setup'],
    },
  ],
})
