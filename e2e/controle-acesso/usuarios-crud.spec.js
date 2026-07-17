import { test, expect } from '@playwright/test'

const sufixo = Date.now()
const nomeOriginal = `E2E Usuario ${sufixo}`
const nomeEditado = `E2E Usuario ${sufixo} Editado`
const email = `e2e.usuario.${sufixo}@teste.com`

// Preenchido após a criação, com o id retornado pela API — garante que edição e
// exclusão atuem sempre sobre o registro criado neste teste, nunca em um registro
// pré-existente (ex.: usuários do sistema) que porventura combine com a busca textual.
let usuarioId

async function mostrarTodosRegistros(page) {
  // O input do v-select fica coberto pelo span de exibição do Vuetify,
  // então o clique "normal" do Playwright nunca é aceito (fica travando).
  await page.getByLabel('Items per page:').click({ force: true })
  await page.getByRole('option', { name: 'Todos' }).click()
}

async function buscarLinha(page, termo) {
  await page.getByTestId('usuario-crud').getByLabel('Buscar', { exact: true }).fill(termo)
  return page.getByRole('row', { name: new RegExp(termo) })
}

test.describe.serial('Administração — Usuários — CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/administracao#usuarios')
    await expect(page.getByTestId('usuario-crud')).toBeVisible({ timeout: 10000 })
  })

  test('cria um novo usuário com sucesso', async ({ page }) => {
    await page.getByTestId('crud-btn-adicionar').click()

    const modal = page.getByRole('dialog')
    await modal.getByLabel('Nome').fill(nomeOriginal)
    await modal.getByLabel('Email').fill(email)

    const [response] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/app/users') && r.request().method() === 'POST'),
      page.getByTestId('crud-btn-salvar').click(),
    ])

    usuarioId = (await response.json()).data.id

    await expect(page.getByText('Operação realizada com sucesso!')).toBeVisible({ timeout: 10000 })
    await expect(modal).not.toBeVisible()

    await mostrarTodosRegistros(page)
    const linha = await buscarLinha(page, email)
    await expect(linha).toBeVisible({ timeout: 10000 })
    await expect(linha).toContainText(nomeOriginal)
  })

  test('exibe erro de validação ao tentar salvar sem preencher campos obrigatórios', async ({ page }) => {
    await page.getByTestId('crud-btn-adicionar').click()
    await page.getByTestId('crud-btn-salvar').click()

    // Backend rejeita (422) e a modal permanece aberta com os erros de validação
    await expect(page.getByTestId('crud-btn-salvar')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('dialog').getByText(/obrigat/i).first()).toBeVisible({ timeout: 10000 })

    await page.getByTestId('crud-btn-cancelar').click()
  })

  test('edita o usuário criado', async ({ page }) => {
    await mostrarTodosRegistros(page)
    const linha = await buscarLinha(page, email)
    await expect(linha).toBeVisible({ timeout: 10000 })

    // Clica no botão de editar pelo id do usuário criado neste teste, garantindo que a
    // edição nunca recaia sobre outro registro (ex.: um usuário do sistema)
    await page.getByTestId(`crud-btn-editar-${usuarioId}`).click()

    const modal = page.getByRole('dialog')
    const campoNome = modal.getByLabel('Nome')
    await expect(campoNome).toHaveValue(nomeOriginal)
    await campoNome.fill(nomeEditado)

    await Promise.all([
      page.waitForResponse(r => r.url().endsWith(`/app/users/${usuarioId}`) && r.request().method() === 'PUT'),
      page.getByTestId('crud-btn-salvar').click(),
    ])

    await expect(page.getByText('Operação realizada com sucesso!')).toBeVisible({ timeout: 10000 })
    await expect(modal).not.toBeVisible()

    await mostrarTodosRegistros(page)
    const linhaAtualizada = await buscarLinha(page, email)
    await expect(linhaAtualizada).toContainText(nomeEditado)
  })

  test('cancela edição sem salvar alterações', async ({ page }) => {
    await mostrarTodosRegistros(page)
    const linha = await buscarLinha(page, email)
    await expect(linha).toBeVisible({ timeout: 10000 })

    await page.getByTestId(`crud-btn-editar-${usuarioId}`).click()

    const modal = page.getByRole('dialog')
    await modal.getByLabel('Nome').fill('Nome que não deve ser salvo')
    await page.getByTestId('crud-btn-cancelar').click()

    await expect(modal).not.toBeVisible()

    await mostrarTodosRegistros(page)
    const linhaInalterada = await buscarLinha(page, email)
    await expect(linhaInalterada).toContainText(nomeEditado)
  })

  test('exclui o usuário criado', async ({ page }) => {
    await mostrarTodosRegistros(page)
    const linha = await buscarLinha(page, email)
    await expect(linha).toBeVisible({ timeout: 10000 })

    page.once('dialog', dialog => dialog.accept())
    await Promise.all([
      page.waitForResponse(r => r.url().endsWith(`/app/users/${usuarioId}`) && r.request().method() === 'DELETE'),
      page.getByTestId(`crud-btn-excluir-${usuarioId}`).click(),
    ])

    await expect(page.getByText('Item excluído com sucesso!')).toBeVisible({ timeout: 10000 })

    await page.getByTestId('usuario-crud').getByLabel('Buscar', { exact: true }).fill(email)
    await expect(page.getByRole('row', { name: new RegExp(email) })).toHaveCount(0)
  })
})
