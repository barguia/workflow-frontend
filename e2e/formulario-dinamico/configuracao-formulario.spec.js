import { test, expect } from '@playwright/test'

test.describe('Configuração de campos (pivot)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/formularios#formularios')
    await expect(page.getByTestId('formulario-crud')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('formulario-btn-pivot').first().click()
    await expect(page.getByRole('button', { name: 'Salvar tudo' })).toBeVisible({ timeout: 15000 })
    // Aguarda o loader específico do modal sumir (v-if remove do DOM ao terminar)
    await expect(page.getByTestId('configuracao-carregando')).not.toBeVisible({ timeout: 15000 })
  })

  // ─── Modal ───────────────────────────────────────────────────────────────

  test('exibe botões Salvar tudo e Cancelar', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Salvar tudo' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible()
  })

  test('fecha pelo botão Cancelar', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByRole('button', { name: 'Salvar tudo' })).not.toBeVisible()
  })

  // ─── Busca ───────────────────────────────────────────────────────────────

  test('busca com termo inexistente exibe mensagem de vazio', async ({ page }) => {
    const campos = page.getByTestId('configuracao-campo-item')
    const count = await campos.count()
    test.skip(count === 0, 'Nenhum campo associado ao formulário')

    await page.getByPlaceholder('Buscar campo...').fill('xyzabc_inexistente_9999')
    await expect(page.getByText('Nenhum campo encontrado')).toBeVisible()
  })

  test('chip total atualiza ao filtrar', async ({ page }) => {
    const campos = page.getByTestId('configuracao-campo-item')
    const count = await campos.count()
    test.skip(count < 2, 'Requer ao menos 2 campos para testar filtragem')

    const chip = page.getByTestId('configuracao-chip-total')
    const textoAntes = await chip.textContent()

    // Busca com texto que provavelmente não casa com todos
    await page.getByPlaceholder('Buscar campo...').fill('xyzabc_inexistente_9999')

    const textoDepois = await chip.textContent()
    expect(textoDepois?.trim()).not.toBe(textoAntes?.trim())
  })

  test('limpar busca restaura o chip ao total original', async ({ page }) => {
    const campos = page.getByTestId('configuracao-campo-item')
    const count = await campos.count()
    test.skip(count === 0, 'Nenhum campo associado ao formulário')

    const chip = page.getByTestId('configuracao-chip-total')
    const textoOriginal = await chip.textContent()

    await page.getByPlaceholder('Buscar campo...').fill('xyzabc_inexistente_9999')
    await page.getByPlaceholder('Buscar campo...').clear()

    await expect(chip).toHaveText(textoOriginal ?? '')
  })

  // ─── Painel de edição ────────────────────────────────────────────────────

  test('clicar num campo abre o painel de edição com o label correto', async ({ page }) => {
    const campos = page.getByTestId('configuracao-campo-item')
    const count = await campos.count()
    test.skip(count === 0, 'Nenhum campo associado ao formulário')

    const labelTexto = await campos.first().locator('.text-body-2').textContent()
    await campos.first().click()

    await expect(page.getByTestId('configuracao-painel-edicao')).toBeVisible()
    await expect(page.getByTestId('configuracao-painel-label')).toHaveText(labelTexto?.trim() ?? '')
  })

  test('fechar painel pelo botão X oculta o painel', async ({ page }) => {
    const campos = page.getByTestId('configuracao-campo-item')
    const count = await campos.count()
    test.skip(count === 0, 'Nenhum campo associado ao formulário')

    await campos.first().click()
    await expect(page.getByTestId('configuracao-painel-edicao')).toBeVisible()

    await page.getByTestId('configuracao-painel-fechar').click()
    await expect(page.getByTestId('configuracao-painel-edicao')).not.toBeVisible()
  })

  test('clicar no campo selecionado novamente fecha o painel (toggle)', async ({ page }) => {
    const campos = page.getByTestId('configuracao-campo-item')
    const count = await campos.count()
    test.skip(count === 0, 'Nenhum campo associado ao formulário')

    await campos.first().click()
    await expect(page.getByTestId('configuracao-painel-edicao')).toBeVisible()

    await campos.first().click()
    await expect(page.getByTestId('configuracao-painel-edicao')).not.toBeVisible()
  })

  test('painel sempre exibe o campo Cols', async ({ page }) => {
    const campos = page.getByTestId('configuracao-campo-item')
    const count = await campos.count()
    test.skip(count === 0, 'Nenhum campo associado ao formulário')

    await campos.first().click()
    await expect(page.getByTestId('configuracao-painel-edicao').getByLabel('Cols')).toBeVisible()
  })

  // ─── Tipos específicos ───────────────────────────────────────────────────

  test('campo do tipo range exibe inputs de mínimo, máximo e step', async ({ page }) => {
    const rangeCampos = page.getByTestId('configuracao-campo-item').filter({ hasText: 'range' })
    const count = await rangeCampos.count()
    test.skip(count === 0, 'Nenhum campo do tipo range associado')

    await rangeCampos.first().click()
    await expect(page.getByLabel('Mínimo')).toBeVisible()
    await expect(page.getByLabel('Máximo')).toBeVisible()
    await expect(page.getByLabel('Step')).toBeVisible()
  })

  test('campo do tipo select exibe o checkbox de seleção múltipla', async ({ page }) => {
    const selectCampos = page.getByTestId('configuracao-campo-item').filter({ hasText: 'select' })
    const count = await selectCampos.count()
    test.skip(count === 0, 'Nenhum campo do tipo select associado')

    await selectCampos.first().click()
    await expect(page.getByLabel('Seleção múltipla')).toBeVisible()
  })

  test('campo do tipo switch exibe inputs de rótulos e valores', async ({ page }) => {
    const switchCampos = page.getByTestId('configuracao-campo-item').filter({ hasText: 'switch' })
    const count = await switchCampos.count()
    test.skip(count === 0, 'Nenhum campo do tipo switch associado')

    await switchCampos.first().click()
    await expect(page.getByLabel('Label ativo')).toBeVisible()
    await expect(page.getByLabel('Label inativo')).toBeVisible()
    await expect(page.getByLabel('Valor ativo')).toBeVisible()
    await expect(page.getByLabel('Valor inativo')).toBeVisible()
  })
})
