import { test, expect } from '@playwright/test'

const sufixo = Date.now()
const nomeOriginal = `E2E Perfil ${sufixo}`
const nomeEditado = `E2E Perfil ${sufixo} Editado`

// Preenchido após a criação, com o id retornado pela API — garante que edição e
// exclusão atuem sempre sobre o registro criado neste teste, nunca em um registro
// pré-existente (ex.: perfis do sistema) que porventura combine com a busca textual.
let perfilId

async function mostrarTodosRegistros(page) {
  // O input do v-select fica coberto pelo span de exibição do Vuetify,
  // então o clique "normal" do Playwright nunca é aceito (fica travando).
  // Sob carga (suíte inteira rodando em paralelo) um único clique forçado pode
  // não abrir o menu a tempo — por isso repetimos até o menu realmente abrir.
  const opcaoTodos = page.getByRole('option', { name: 'Todos' })
  await expect(async () => {
    await page.getByLabel('Items per page:').click({ force: true })
    await expect(opcaoTodos).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 15000 })
  await opcaoTodos.click()
}

async function buscarLinha(page, termo) {
  await page.getByTestId('role-crud').getByLabel('Buscar', { exact: true }).fill(termo)
  return page.getByRole('row', { name: new RegExp(termo) })
}

async function selecionarGuardName(page, modal, valor) {
  await modal.getByLabel('Guard Name', { exact: true }).click({ force: true })
  await page.getByRole('option', { name: valor }).click()
}

test.describe.serial('Administração — Perfis — CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/administracao#perfis')
    await expect(page.getByTestId('role-crud')).toBeVisible({ timeout: 10000 })
  })

  test('cria um novo perfil com sucesso', async ({ page }) => {
    await page.getByTestId('crud-btn-adicionar').click()

    const modal = page.getByRole('dialog')
    await modal.getByLabel('Role').fill(nomeOriginal)
    await selecionarGuardName(page, modal, 'API')

    const [response] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/app/roles') && r.request().method() === 'POST'),
      page.getByTestId('crud-btn-salvar').click(),
    ])

    perfilId = (await response.json()).data.id

    await expect(page.getByText('Operação realizada com sucesso!')).toBeVisible({ timeout: 10000 })
    await expect(modal).not.toBeVisible()

    await mostrarTodosRegistros(page)
    const linha = await buscarLinha(page, nomeOriginal)
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

  test('edita o perfil criado', async ({ page }) => {
    await mostrarTodosRegistros(page)
    const linha = await buscarLinha(page, nomeOriginal)
    await expect(linha).toBeVisible({ timeout: 10000 })

    // Clica no botão de editar pelo id do perfil criado neste teste, garantindo que a
    // edição nunca recaia sobre outro registro (ex.: um perfil do sistema)
    await page.getByTestId(`crud-btn-editar-${perfilId}`).click()

    const modal = page.getByRole('dialog')
    const campoNome = modal.getByLabel('Role')
    await expect(campoNome).toHaveValue(nomeOriginal)
    await campoNome.fill(nomeEditado)

    await Promise.all([
      page.waitForResponse(r => r.url().endsWith(`/app/roles/${perfilId}`) && r.request().method() === 'PUT'),
      page.getByTestId('crud-btn-salvar').click(),
    ])

    await expect(page.getByText('Operação realizada com sucesso!')).toBeVisible({ timeout: 10000 })
    await expect(modal).not.toBeVisible()

    await mostrarTodosRegistros(page)
    const linhaAtualizada = await buscarLinha(page, nomeEditado)
    await expect(linhaAtualizada).toContainText(nomeEditado)
  })

  test('cancela edição sem salvar alterações', async ({ page }) => {
    await mostrarTodosRegistros(page)
    const linha = await buscarLinha(page, nomeEditado)
    await expect(linha).toBeVisible({ timeout: 10000 })

    await page.getByTestId(`crud-btn-editar-${perfilId}`).click()

    const modal = page.getByRole('dialog')
    await modal.getByLabel('Role').fill('Nome que não deve ser salvo')
    await page.getByTestId('crud-btn-cancelar').click()

    await expect(modal).not.toBeVisible()

    await mostrarTodosRegistros(page)
    const linhaInalterada = await buscarLinha(page, nomeEditado)
    await expect(linhaInalterada).toContainText(nomeEditado)
  })

  test('exclui o perfil criado', async ({ page }) => {
    await mostrarTodosRegistros(page)
    const linha = await buscarLinha(page, nomeEditado)
    await expect(linha).toBeVisible({ timeout: 10000 })

    page.once('dialog', dialog => dialog.accept())
    await Promise.all([
      page.waitForResponse(r => r.url().endsWith(`/app/roles/${perfilId}`) && r.request().method() === 'DELETE'),
      page.getByTestId(`crud-btn-excluir-${perfilId}`).click(),
    ])

    await expect(page.getByText('Item excluído com sucesso!')).toBeVisible({ timeout: 10000 })

    await page.getByTestId('role-crud').getByLabel('Buscar', { exact: true }).fill(nomeEditado)
    await expect(page.getByRole('row', { name: new RegExp(nomeEditado) })).toHaveCount(0)
  })
})
