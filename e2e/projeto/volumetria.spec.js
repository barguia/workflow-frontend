import { test, expect } from '@playwright/test'

test.describe('Volumetria — Painel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/projetos#backlog')
  })

  test('exibe os cards de macroprocesso após carregar', async ({ page }) => {
    const cards = page.locator('.row-one .v-card')
    await expect(cards.first()).toBeVisible({ timeout: 5000 })
    expect(await cards.count()).toBeGreaterThanOrEqual(2)
  })

  test('card totalizador não dispara seleção ao clicar', async ({ page }) => {
    const cardTotal = page.locator('.row-one .v-card').first()
    await cardTotal.click()

    await expect(page.getByTestId('volumetria-tabela-processos')).not.toBeVisible()
  })

  test('clicar em um macroprocesso exibe a tabela de processos', async ({ page }) => {
    const cards = page.locator('.row-one .v-card')
    expect(await cards.count()).toBeGreaterThanOrEqual(2)

    await cards.nth(1).click()

    await expect(page.getByTestId('volumetria-tabela-processos')).toBeVisible({ timeout: 5000 })
  })

  test('fechar o painel de detalhe remove a tabela', async ({ page }) => {
    const cards = page.locator('.row-one .v-card')
    await cards.nth(1).click()

    const tabela = page.getByTestId('volumetria-tabela-processos')
    await expect(tabela).toBeVisible({ timeout: 5000 })

    await page.getByTestId('volumetria-btn-fechar-painel').click()
    await expect(tabela).not.toBeVisible()
  })

  test('clicar em uma linha da tabela expande o drill-down', async ({ page }) => {
    const cards = page.locator('.row-one .v-card')
    await cards.nth(1).click()

    const tabela = page.getByTestId('volumetria-tabela-processos')
    await expect(tabela).toBeVisible({ timeout: 5000 })

    await tabela.locator('tbody tr').first().click()

    await expect(page.locator('.sub-tabela-wrapper')).toBeVisible({ timeout: 5000 })
  })

  test('clicar na linha novamente colapsa o drill-down', async ({ page }) => {
    const cards = page.locator('.row-one .v-card')
    await cards.nth(1).click()

    const tabela = page.getByTestId('volumetria-tabela-processos')
    await expect(tabela).toBeVisible({ timeout: 5000 })

    const primeiraLinha = tabela.locator('tbody tr').first()
    await primeiraLinha.click()

    const subTabela = page.locator('.sub-tabela-wrapper')
    await expect(subTabela).toBeVisible({ timeout: 5000 })

    await primeiraLinha.click()
    await expect(subTabela).not.toBeVisible()
  })

  test('filtro de status recarrega o painel', async ({ page }) => {
    await expect(page.locator('.row-one .v-card').first()).toBeVisible({ timeout: 10000 })

    await page.getByTestId('volumetria-btn-filtro-finalizado').click()

    await expect(page.locator('.row-one .v-card').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Volumetria — Fila de Tarefas', () => {
  test('link da tarefa abre a fila em nova aba', async ({ page, context }) => {
    await page.goto('/adm/projetos#backlog')

    const cards = page.locator('.row-one .v-card')
    expect(await cards.count()).toBeGreaterThanOrEqual(2)

    const tabela = page.getByTestId('volumetria-tabela-processos')

    // Navega pelos cards até encontrar um que exiba tarefas no drill-down
    let linkTarefa = null
    for (let i = 1; i < await cards.count(); i++) {
      await cards.nth(i).click()
      await expect(tabela).toBeVisible({ timeout: 5000 })

      const linhas = tabela.locator('tbody tr')
      for (let j = 0; j < await linhas.count(); j++) {
        await linhas.nth(j).click()

        const subWrapper = page.locator('.sub-tabela-wrapper').first()
        const visivel = await subWrapper.isVisible().catch(() => false)
        if (!visivel) continue

        linkTarefa = subWrapper.locator('a[href*="/fila-tarefa/"]').first()
        const existe = await linkTarefa.count() > 0
        if (existe) break

        // Colapsa antes de tentar próxima linha
        await linhas.nth(j).click()
        linkTarefa = null
      }

      if (linkTarefa) break
    }

    // Se não encontrou tarefas nos dados atuais, ignora o teste
    test.skip(!linkTarefa, 'Nenhuma tarefa encontrada nos dados atuais')

    const [novaAba] = await Promise.all([
      context.waitForEvent('page'),
      linkTarefa.click(),
    ])

    await novaAba.waitForLoadState()
    await expect(novaAba).toHaveURL(/\/fila-tarefa\/\d+/)
  })
})
