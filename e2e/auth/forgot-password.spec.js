import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Esqueci a Senha', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password')
  })

  test('exibe o campo de email e botão continuar', async ({ page }) => {
    await expect(page.getByTestId('forgot-input-email')).toBeVisible()
    await expect(page.getByTestId('forgot-btn-continuar')).toBeVisible()
  })

  test('campo de email aceita digitação', async ({ page }) => {
    await page.getByTestId('forgot-input-email').locator('input').fill('usuario@teste.com')
    await expect(page.getByTestId('forgot-input-email').locator('input')).toHaveValue('usuario@teste.com')
  })
})
