import { test, expect } from '@playwright/test'

// Estes testes NÃO usam storageState — testam o fluxo de login em si
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login', () => {
  test('exibe a página de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByTestId('login-btn-entrar')).toBeVisible()
  })

  test('redireciona para home após login válido', async ({ page }) => {
    const email    = process.env.E2E_EMAIL    ?? 'admin@admin.com'
    const password = process.env.E2E_PASSWORD ?? 'password'

    await page.goto('/login')
    await page.getByTestId('login-input-email').locator('input').fill(email)
    await page.getByTestId('login-input-senha').locator('input').fill(password)
    await page.getByTestId('login-btn-entrar').click()

    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })

  test('permanece na página de login com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-input-email').locator('input').fill('invalido@teste.com')
    await page.getByTestId('login-input-senha').locator('input').fill('senha_errada')
    await page.getByTestId('login-btn-entrar').click()

    await expect(page).toHaveURL('/login')
  })

  test('redireciona para /login ao acessar rota protegida sem autenticação', async ({ page }) => {
    await page.goto('adm/administracao#adm')
    await expect(page).toHaveURL('/login')
  })
})
