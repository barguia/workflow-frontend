import { test, expect } from '@playwright/test'

test.describe('Pesquisa de Registros', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/projetos#pesquisa')
    await expect(page.getByTestId('pesquisa-toggle-tipo')).toBeVisible({ timeout: 15000 })
  })

  test('exibe os filtros e botões de ação', async ({ page }) => {
    await expect(page.getByTestId('pesquisa-btn-pendentes')).toBeVisible()
    await expect(page.getByTestId('pesquisa-btn-finalizados')).toBeVisible()
    await expect(page.getByTestId('pesquisa-select-projetos')).toBeVisible()
    await expect(page.getByTestId('pesquisa-select-macro-processo')).toBeVisible()
    await expect(page.getByTestId('pesquisa-select-processo')).toBeVisible()
    await expect(page.getByTestId('pesquisa-select-tarefas')).toBeVisible()
    await expect(page.getByTestId('pesquisa-btn-limpar')).toBeVisible()
    await expect(page.getByTestId('pesquisa-btn-pesquisar')).toBeVisible()
  })

  test('filtro de status mostra campo Status apenas no modo Pendentes', async ({ page }) => {
    await expect(page.getByTestId('pesquisa-select-status')).toBeVisible()

    await page.getByTestId('pesquisa-btn-finalizados').click()
    await expect(page.getByTestId('pesquisa-select-status')).not.toBeVisible()

    await page.getByTestId('pesquisa-btn-pendentes').click()
    await expect(page.getByTestId('pesquisa-select-status')).toBeVisible()
  })

  test('botão pesquisar exibe a tabela de resultados', async ({ page }) => {
    await page.getByTestId('pesquisa-btn-pesquisar').click()

    await expect(page.getByTestId('pesquisa-tabela-resultados')).toBeVisible({ timeout: 10000 })
  })

  test('botão limpar remove os resultados', async ({ page }) => {
    await page.getByTestId('pesquisa-btn-pesquisar').click()
    await expect(page.getByTestId('pesquisa-tabela-resultados')).toBeVisible({ timeout: 10000 })

    await page.getByTestId('pesquisa-btn-limpar').click()
    await expect(page.getByTestId('pesquisa-tabela-resultados')).not.toBeVisible()
  })

  test('campo de busca nos resultados está visível após pesquisar', async ({ page }) => {
    await page.getByTestId('pesquisa-btn-pesquisar').click()
    await expect(page.getByTestId('pesquisa-tabela-resultados')).toBeVisible({ timeout: 10000 })

    await expect(page.getByTestId('pesquisa-input-busca')).toBeVisible()
  })
})
