import { test, expect } from '@playwright/test'

// Obtém um ID válido de tarefa navegando pela lista de tarefas
async function obterIdTarefa(page) {
  await page.goto('/adm/projetos#tarefas')
  await expect(page.getByTestId('tarefa-crud')).toBeVisible({ timeout: 15000 })

  const link = page.getByTestId('tarefa-btn-fila').first()
  await expect(link).toBeVisible({ timeout: 10000 })

  const href = await link.getAttribute('href')
  return href?.match(/\/fila-tarefa\/(\d+)/)?.[1] ?? null
}

test.describe('Fila de Tarefas', () => {
  test('exibe tabela e campo de busca', async ({ page }) => {
    const id = await obterIdTarefa(page)
    test.skip(!id, 'Nenhuma tarefa disponível para teste')

    await page.goto(`/fila-tarefa/${id}`)

    await expect(page.getByTestId('fila-tarefa-tabela')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('fila-tarefa-input-busca')).toBeVisible()
  })

  test('botão voltar está visível', async ({ page }) => {
    const id = await obterIdTarefa(page)
    test.skip(!id, 'Nenhuma tarefa disponível para teste')

    await page.goto(`/fila-tarefa/${id}`)

    await expect(page.getByTestId('fila-tarefa-btn-voltar')).toBeVisible({ timeout: 5000 })
  })

  test('botão voltar navega para a página anterior', async ({ page }) => {
    const id = await obterIdTarefa(page)
    test.skip(!id, 'Nenhuma tarefa disponível para teste')

    await page.goto('/adm/projetos#tarefas')
    await page.goto(`/fila-tarefa/${id}`)

    await page.getByTestId('fila-tarefa-btn-voltar').click()
    await expect(page).not.toHaveURL(`/fila-tarefa/${id}`)
  })

  test('campo de busca filtra os itens da tabela', async ({ page }) => {
    const id = await obterIdTarefa(page)
    test.skip(!id, 'Nenhuma tarefa disponível para teste')

    await page.goto(`/fila-tarefa/${id}`)
    await expect(page.getByTestId('fila-tarefa-tabela')).toBeVisible({ timeout: 5000 })

    await page.getByTestId('fila-tarefa-input-busca').locator('input').fill('zzz_inexistente')

    const linhas = page.getByTestId('fila-tarefa-tabela').locator('tbody tr:not(.v-data-table-rows-no-data)')
    await expect(linhas).toHaveCount(0, { timeout: 3000 })
  })
})
