import { test as setup, expect } from '@playwright/test'

const AUTH_FILE = 'e2e/.auth/state.json'

setup('autenticar', async ({ page }) => {
  const email    = process.env.E2E_EMAIL    ?? 'admin@admin.com'
  const password = process.env.E2E_PASSWORD ?? 'password'

  console.log(`\n→ Tentando login com: ${email}`)

  await page.goto('/login')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Senha').fill(password)

  // Intercepta a resposta da API de login para diagnóstico imediato
  const [response] = await Promise.all([
    page.waitForResponse(
      resp => resp.url().includes('/login') && resp.request().method() === 'POST',
      { timeout: 15000 }
    ),
    page.getByRole('button', { name: 'Efetuar Login' }).click(),
  ])

  const status = response.status()
  console.log(`→ Resposta da API: ${status}`)

  if (!response.ok()) {
    const body = await response.text().catch(() => '(sem corpo)')
    throw new Error(
      `Login falhou (HTTP ${status}).\n` +
      `Verifique:\n` +
      `  • Backend rodando em ${process.env.VITE_API_URL ?? 'http://localhost/api/'}\n` +
      `  • Credenciais E2E_EMAIL="${email}" estão corretas\n` +
      `  • Resposta: ${body}`
    )
  }

  // Aguarda a navegação para qualquer rota (não exige '/' especificamente)
  await page.waitForURL(url => url.pathname !== '/login', { timeout: 10000 })
  console.log(`→ Redirecionado para: ${page.url()}`)

  await page.context().storageState({ path: AUTH_FILE })
  console.log(`→ Estado de autenticação salvo em ${AUTH_FILE}\n`)
})
