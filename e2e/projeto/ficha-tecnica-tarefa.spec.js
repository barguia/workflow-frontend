import { test, expect } from '@playwright/test'

// Obtém um ID válido de pco_tarefa navegando pela fila de tarefas
async function obterIdTarefa(page) {
  await page.goto('/adm/projetos#projetos')
  await expect(page.getByTestId('projeto-crud')).toBeVisible({ timeout: 15000 })

  const linkFicha = page.getByTestId('projeto-btn-ficha-tecnica').first()
  try {
    await linkFicha.waitFor({ state: 'visible', timeout: 15000 })
  } catch {
    return null
  }

  const hrefFicha = await linkFicha.getAttribute('href')
  const idProjeto = hrefFicha?.match(/\/ficha-tecnica\/(\d+)/)?.[1] ?? null
  if (!idProjeto) return null

  await page.goto(`/ficha-tecnica/${idProjeto}`)
  await expect(page.getByTestId('ficha-tecnica-tabela-tarefas')).toBeVisible({ timeout: 15000 })

  const linkTarefa = page.locator('[data-testid="ficha-tecnica-tabela-tarefas"] a[href*="/ficha-tecnica-tarefa/"]').first()
  if (!(await linkTarefa.isVisible())) return null

  const hrefTarefa = await linkTarefa.getAttribute('href')
  return hrefTarefa?.match(/\/ficha-tecnica-tarefa\/(\d+)/)?.[1] ?? null
}

test.describe('Ficha Técnica da Tarefa — FtTarefasAbertas', () => {

  test('seção de tarefas abertas é exibida na página', async ({ page }) => {
    const id = await obterIdTarefa(page)
    test.skip(!id, 'Nenhuma tarefa disponível para teste')

    await page.goto(`/ficha-tecnica-tarefa/${id}`)

    await expect(page.getByTestId('ft-tarefas-abertas-tabela')).toBeVisible({ timeout: 15000 })
  })

  test('botão atualizar está visível', async ({ page }) => {
    const id = await obterIdTarefa(page)
    test.skip(!id, 'Nenhuma tarefa disponível para teste')

    await page.goto(`/ficha-tecnica-tarefa/${id}`)

    await expect(page.getByTestId('ft-tarefas-abertas-btn-atualizar')).toBeVisible({ timeout: 15000 })
  })

  test('campo de busca está visível', async ({ page }) => {
    const id = await obterIdTarefa(page)
    test.skip(!id, 'Nenhuma tarefa disponível para teste')

    await page.goto(`/ficha-tecnica-tarefa/${id}`)

    await expect(page.getByTestId('ft-tarefas-abertas-input-busca')).toBeVisible({ timeout: 15000 })
  })

  test('contador exibe um número', async ({ page }) => {
    const id = await obterIdTarefa(page)
    test.skip(!id, 'Nenhuma tarefa disponível para teste')

    await page.goto(`/ficha-tecnica-tarefa/${id}`)
    await expect(page.getByTestId('ft-tarefas-abertas-tabela')).toBeVisible({ timeout: 15000 })

    const contador = page.getByTestId('ft-tarefas-abertas-contador')
    await expect(contador).toBeVisible()
    const texto = await contador.textContent()
    expect(Number(texto?.trim())).toBeGreaterThanOrEqual(0)
  })

  test('tarefa atual não aparece na lista de tarefas abertas', async ({ page }) => {
    const id = await obterIdTarefa(page)
    test.skip(!id, 'Nenhuma tarefa disponível para teste')

    await page.goto(`/ficha-tecnica-tarefa/${id}`)
    await expect(page.getByTestId('ft-tarefas-abertas-tabela')).toBeVisible({ timeout: 15000 })

    // O botão de ficha desta mesma tarefa não deve estar na tabela de tarefas abertas
    const btnProprioId = page.getByTestId(`ft-tarefas-abertas-btn-ficha-${id}`)
    await expect(btnProprioId).not.toBeAttached()
  })

  test('exibe mensagem informativa quando não há tarefas abertas', async ({ page }) => {
    const id = await obterIdTarefa(page)
    test.skip(!id, 'Nenhuma tarefa disponível para teste')

    await page.goto(`/ficha-tecnica-tarefa/${id}`)
    await expect(page.getByTestId('ft-tarefas-abertas-tabela')).toBeVisible({ timeout: 15000 })

    const contador = page.getByTestId('ft-tarefas-abertas-contador')
    const total = Number((await contador.textContent())?.trim())

    if (total === 0) {
      await expect(page.getByTestId('ft-tarefas-abertas-vazio')).toBeVisible()
    } else {
      test.skip(true, 'Há tarefas abertas — estado vazio não aplicável neste registro')
    }
  })

  test('campo de busca com termo inexistente exibe estado vazio', async ({ page }) => {
    const id = await obterIdTarefa(page)
    test.skip(!id, 'Nenhuma tarefa disponível para teste')

    await page.goto(`/ficha-tecnica-tarefa/${id}`)
    await expect(page.getByTestId('ft-tarefas-abertas-tabela')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('ft-tarefas-abertas-input-busca').locator('input').fill('zzz_inexistente_xyz')

    const linhas = page.getByTestId('ft-tarefas-abertas-tabela').locator('tbody tr:not(.v-data-table-rows-no-data)')
    await expect(linhas).toHaveCount(0, { timeout: 3000 })
  })

  test('botão atualizar recarrega a tabela', async ({ page }) => {
    const id = await obterIdTarefa(page)
    test.skip(!id, 'Nenhuma tarefa disponível para teste')

    await page.goto(`/ficha-tecnica-tarefa/${id}`)
    await expect(page.getByTestId('ft-tarefas-abertas-tabela')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('ft-tarefas-abertas-btn-atualizar').click()
    await expect(page.getByTestId('ft-tarefas-abertas-tabela')).toBeVisible({ timeout: 10000 })
  })

})
