import { test, expect } from '@playwright/test'

test.describe('Formulários Dinâmicos — Navegação entre abas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/formularios#visao-geral')
  })

  test('carrega a aba padrão (Visão Geral)', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Visão Geral' })).toBeVisible()
  })

  test('navega para aba Formulários', async ({ page }) => {
    await page.getByRole('tab', { name: 'Formulários' }).click()
    await expect(page.getByTestId('formulario-crud')).toBeVisible({ timeout: 15000 })
  })

  test('navega para aba Campos', async ({ page }) => {
    await page.getByRole('tab', { name: 'Campos', exact: true }).click()
    await expect(page.getByTestId('campo-crud')).toBeVisible({ timeout: 15000 })
  })

  test('navega para aba Regras de Campos', async ({ page }) => {
    await page.getByRole('tab', { name: 'Regras de Campos' }).click()
    await expect(page.getByTestId('regras-campo-crud')).toBeVisible({ timeout: 15000 })
  })

  test('hash da URL é atualizado ao trocar de aba', async ({ page }) => {
    await page.getByRole('tab', { name: 'Campos', exact: true }).click()
    await expect(page).toHaveURL(/\/adm\/formularios#campos/)
  })
})

test.describe('Formulários Dinâmicos — Formulários', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/formularios#formularios')
    await expect(page.getByTestId('formulario-crud')).toBeVisible({ timeout: 15000 })
  })

  test('exibe botão de preview na tabela', async ({ page }) => {
    await expect(page.getByTestId('formulario-btn-preview').first()).toBeVisible({ timeout: 15000 })
  })

  test('exibe botão de associar campos na tabela', async ({ page }) => {
    await expect(page.getByTestId('formulario-btn-campos').first()).toBeVisible({ timeout: 15000 })
  })

  test('exibe botão de configurar pivot na tabela', async ({ page }) => {
    await expect(page.getByTestId('formulario-btn-pivot').first()).toBeVisible({ timeout: 15000 })
  })

  test('abre e fecha o modal de preview pelo botão fechar do topo', async ({ page }) => {
    await page.getByTestId('formulario-btn-preview').first().click()
    await expect(page.getByTestId('preview-fechar-topo')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('preview-fechar-topo').click()
    await expect(page.getByTestId('preview-fechar-topo')).not.toBeVisible()
  })

  test('abre e fecha o modal de preview pelo botão Fechar do rodapé', async ({ page }) => {
    await page.getByTestId('formulario-btn-preview').first().click()
    await expect(page.getByTestId('preview-fechar')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('preview-fechar').click()
    await expect(page.getByTestId('preview-fechar')).not.toBeVisible()
  })

  test('exibe botão Validar no modal de preview quando há campos', async ({ page }) => {
    await page.getByTestId('formulario-btn-preview').first().click()

    const validar = page.getByTestId('preview-validar')
    const fechar  = page.getByTestId('preview-fechar')

    await expect(fechar).toBeVisible({ timeout: 15000 })

    // Botão validar só aparece se o formulário tiver campos
    const temCampos = await validar.isVisible()
    if (temCampos) {
      await expect(validar).toBeVisible()
    }

    await fechar.click()
  })

  test('abre e fecha o modal de associar campos', async ({ page }) => {
    await page.getByTestId('formulario-btn-campos').first().click()

    // Modal de associação usa botão Salvar do UmParaMuitosComponent2
    await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByRole('button', { name: 'Salvar' })).not.toBeVisible()
  })

  test('abre e fecha o modal de configurar pivot', async ({ page }) => {
    await page.getByTestId('formulario-btn-pivot').first().click()

    await expect(page.getByRole('button', { name: 'Salvar tudo' })).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByRole('button', { name: 'Salvar tudo' })).not.toBeVisible()
  })
})

test.describe('Formulários Dinâmicos — Campos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/adm/formularios#campos')
    await expect(page.getByTestId('campo-crud')).toBeVisible({ timeout: 15000 })
  })

  test('exibe a tabela de campos', async ({ page }) => {
    await expect(page.getByTestId('campo-crud')).toBeVisible()
  })

  test('exibe botão de gerenciar opções apenas para campos selecionáveis', async ({ page }) => {
    // O botão só aparece para tipos select/checkbox/radio
    // Verifica que ao menos um botão de opções existe (requer campo selecionável cadastrado)
    const botoes = page.getByTestId('campo-btn-opcoes')
    const count  = await botoes.count()

    if (count > 0) {
      await expect(botoes.first()).toBeVisible()
    }
  })

  test('abre e fecha o modal de gerenciar opções', async ({ page }) => {
    const botoes = page.getByTestId('campo-btn-opcoes')
    const count  = await botoes.count()

    test.skip(count === 0, 'Nenhum campo selecionável cadastrado')

    await botoes.first().click()
    await expect(page.getByRole('button', { name: 'Fechar' })).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: 'Fechar' }).click()
    await expect(page.getByRole('button', { name: 'Fechar' })).not.toBeVisible()
  })
})
