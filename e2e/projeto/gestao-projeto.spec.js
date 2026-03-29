import { test, expect } from '@playwright/test'

test.describe('Gestão de Projetos — Navegação entre abas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/projetos#visao-geral')
  })

  test('carrega a aba padrão (Visão Geral)', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Visão Geral' })).toBeVisible()
  })

  test('navega para aba Projetos', async ({ page }) => {
    await page.getByRole('tab', { name: 'Projetos' }).click()
    await expect(page.getByTestId('projeto-crud')).toBeVisible({ timeout: 15000 })
  })

  test('navega para aba Tarefas', async ({ page }) => {
    await page.getByRole('tab', { name: 'Tarefas' }).click()
    await expect(page.getByTestId('tarefa-crud')).toBeVisible({ timeout: 15000 })
  })

  test('navega para aba Processos', async ({ page }) => {
    await page.getByRole('tab', { name: 'Processos' }).click()
    await expect(page.getByTestId('processo-crud')).toBeVisible({ timeout: 15000 })
  })

  test('navega para aba Hierarquias', async ({ page }) => {
    await page.getByRole('tab', { name: 'Hierarquias' }).click()
    await expect(page.getByTestId('hierarquia-crud')).toBeVisible({ timeout: 15000 })
  })

  test('navega para aba Workflows', async ({ page }) => {
    await page.getByRole('tab', { name: 'Workflows' }).click()
    await expect(page.getByTestId('workflow-crud')).toBeVisible({ timeout: 15000 })
  })

  test('navega para aba Pesquisa', async ({ page }) => {
    await page.getByRole('tab', { name: 'Pesquisa' }).click()
    await expect(page.getByTestId('pesquisa-toggle-tipo')).toBeVisible({ timeout: 15000 })
  })

  test('navega para aba Backlog', async ({ page }) => {
    await page.getByRole('tab', { name: 'Backlog' }).click()
    await expect(page.getByTestId('volumetria-toggle-status')).toBeVisible({ timeout: 15000 })
  })

  test('hash da URL é atualizado ao trocar de aba', async ({ page }) => {
    await page.getByRole('tab', { name: 'Projetos' }).click()
    await expect(page).toHaveURL(/\/adm\/projetos#projetos/)
  })
})

test.describe('Gestão de Projetos — Projetos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/projetos#projetos')
    await expect(page.getByTestId('projeto-crud')).toBeVisible({ timeout: 15000 })
  })

  test('exibe botão de ficha técnica na tabela', async ({ page }) => {
    await expect(page.getByTestId('projeto-btn-ficha-tecnica').first()).toBeVisible({ timeout: 15000 })
  })

  test('link de ficha técnica abre em nova aba', async ({ page, context }) => {
    const [novaAba] = await Promise.all([
      context.waitForEvent('page'),
      page.getByTestId('projeto-btn-ficha-tecnica').first().click(),
    ])

    await novaAba.waitForLoadState()
    await expect(novaAba).toHaveURL(/\/ficha-tecnica\/\d+/)
  })
})

test.describe('Gestão de Projetos — Tarefas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/projetos#tarefas')
    await expect(page.getByTestId('tarefa-crud')).toBeVisible({ timeout: 15000 })
  })

  test('exibe botão de fila de tarefa na tabela', async ({ page }) => {
    await expect(page.getByTestId('tarefa-btn-fila').first()).toBeVisible({ timeout: 15000 })
  })

  test('exibe botão de mobilidade na tabela', async ({ page }) => {
    await expect(page.getByTestId('tarefa-btn-mobilidade').first()).toBeVisible({ timeout: 15000 })
  })

  test('link de fila de tarefa abre em nova aba', async ({ page, context }) => {
    const [novaAba] = await Promise.all([
      context.waitForEvent('page'),
      page.getByTestId('tarefa-btn-fila').first().click(),
    ])

    await novaAba.waitForLoadState()
    await expect(novaAba).toHaveURL(/\/fila-tarefa\/\d+/)
  })
})
