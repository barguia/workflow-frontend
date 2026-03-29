import { test, expect } from '@playwright/test'

// Obtém um ID válido de projeto navegando pela lista
async function obterIdProjeto(page) {
  await page.goto('/adm/projetos#projetos')
  await expect(page.getByTestId('projeto-crud')).toBeVisible({ timeout: 15000 })

  const link = page.getByTestId('projeto-btn-ficha-tecnica').first()
  await expect(link).toBeVisible({ timeout: 15000 })

  const href = await link.getAttribute('href')
  return href?.match(/\/ficha-tecnica\/(\d+)/)?.[1] ?? null
}

test.describe('Ficha Técnica do Projeto', () => {
  test('exibe botão voltar e toggle de tarefas', async ({ page }) => {
    const id = await obterIdProjeto(page)
    test.skip(!id, 'Nenhum projeto disponível para teste')

    await page.goto(`/ficha-tecnica/${id}`)

    await expect(page.getByTestId('ficha-tecnica-btn-voltar')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('ficha-tecnica-toggle-tarefas')).toBeVisible({ timeout: 15000 })
  })

  test('exibe a tabela de tarefas', async ({ page }) => {
    const id = await obterIdProjeto(page)
    test.skip(!id, 'Nenhum projeto disponível para teste')

    await page.goto(`/ficha-tecnica/${id}`)

    await expect(page.getByTestId('ficha-tecnica-tabela-tarefas')).toBeVisible({ timeout: 15000 })
  })

  test('toggle alterna entre tarefas pendentes e finalizadas', async ({ page }) => {
    const id = await obterIdProjeto(page)
    test.skip(!id, 'Nenhum projeto disponível para teste')

    await page.goto(`/ficha-tecnica/${id}`)
    await expect(page.getByTestId('ficha-tecnica-tabela-tarefas')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('ficha-tecnica-btn-tarefas-finalizadas').click()
    await expect(page.getByTestId('ficha-tecnica-tabela-tarefas')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('ficha-tecnica-btn-tarefas-pendentes').click()
    await expect(page.getByTestId('ficha-tecnica-tabela-tarefas')).toBeVisible({ timeout: 15000 })
  })

  test('campo de busca está visível', async ({ page }) => {
    const id = await obterIdProjeto(page)
    test.skip(!id, 'Nenhum projeto disponível para teste')

    await page.goto(`/ficha-tecnica/${id}`)

    await expect(page.getByTestId('ficha-tecnica-input-busca')).toBeVisible({ timeout: 15000 })
  })

  test('exibe mensagem de não encontrado para ID inválido', async ({ page }) => {
    await page.goto('/ficha-tecnica/999999')

    await expect(page.getByTestId('ficha-tecnica-btn-voltar-404')).toBeVisible({ timeout: 15000 })
  })
})
