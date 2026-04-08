import { test, expect } from '@playwright/test'

test.describe('Administração — Navegação entre abas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/administracao#adm')
  })

  test('carrega a aba padrão (ADM)', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'ADM' })).toBeVisible()
  })

  test('navega para aba Organizações', async ({ page }) => {
    await page.getByRole('tab', { name: 'Organizações' }).click()
    await expect(page.getByTestId('organizacao-crud')).toBeVisible({ timeout: 15000 })
  })

  test('navega para aba Usuários', async ({ page }) => {
    await page.getByRole('tab', { name: 'Usuários' }).click()
    await expect(page.getByTestId('usuario-crud')).toBeVisible({ timeout: 15000 })
  })

  test('navega para aba Perfis', async ({ page }) => {
    await page.getByRole('tab', { name: 'Perfis' }).click()
    await expect(page.getByTestId('role-crud')).toBeVisible({ timeout: 15000 })
  })

  test('navega para aba Permissões', async ({ page }) => {
    await page.getByRole('tab', { name: 'Permissões' }).click()
    await expect(page.getByTestId('permissao-crud')).toBeVisible({ timeout: 15000 })
  })

  test('navega para aba Menu', async ({ page }) => {
    await page.getByRole('tab', { name: 'Menu' }).click()
    await expect(page.getByTestId('menu-crud')).toBeVisible({ timeout: 15000 })
  })

  test('hash da URL é atualizado ao trocar de aba', async ({ page }) => {
    await page.getByRole('tab', { name: 'Usuários' }).click()
    await expect(page).toHaveURL(/\/adm\/administracao#usuarios/)
  })
})

test.describe('Administração — Perfis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/administracao#perfis')
  })

  test('exibe botão de permissões por perfil na tabela', async ({ page }) => {
    await expect(page.getByTestId('role-crud')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('role-btn-permissoes').first()).toBeVisible({ timeout: 15000 })
  })

  test('abre e fecha o modal de permissões', async ({ page }) => {
    await expect(page.getByTestId('role-btn-permissoes').first()).toBeVisible({ timeout: 15000 })
    await page.getByTestId('role-btn-permissoes').first().click()

    await expect(page.getByTestId('role-modal-btn-salvar')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('role-modal-btn-fechar').click()
    await expect(page.getByTestId('role-modal-btn-salvar')).not.toBeVisible()
  })

  test('fecha modal de permissões pelo botão cancelar', async ({ page }) => {
    await page.getByTestId('role-btn-permissoes').first().click()
    await expect(page.getByTestId('role-modal-btn-cancelar')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('role-modal-btn-cancelar').click()
    await expect(page.getByTestId('role-modal-btn-cancelar')).not.toBeVisible()
  })
})

test.describe('Administração — Usuários', () => {
  test('exibe botão de perfis por usuário na tabela', async ({ page }) => {
    await page.goto('/adm/administracao#usuarios')
    await expect(page.getByTestId('usuario-crud')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('usuario-btn-perfis').first()).toBeVisible({ timeout: 15000 })
  })
})
