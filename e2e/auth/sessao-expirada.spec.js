import { test, expect } from '@playwright/test'

// Usa a sessão autenticada padrão (storageState de e2e/.auth/state.json).
test.describe('Sessão expirada/invalidada', () => {
  test('navegação client-side (SPA) com sessão já invalidada redireciona para /login e oculta o menu', async ({ page }) => {
    // 1. Acessa uma rota protegida autenticado — menu deve estar visível.
    await page.goto('/adm/projetos#visao-geral')
    await expect(page.getByTestId('menu-toggle')).toBeVisible()

    // 2. Simula a sessão sendo invalidada (ex: token expirado/limpo por um
    //    401 recebido em outra aba) sem que a página seja recarregada — o
    //    app permanece com o authStore já "carregado" em memória.
    await page.evaluate(() => {
      localStorage.removeItem('authToken')
      localStorage.removeItem('menus')
    })

    // 3. Dispara uma navegação client-side (sem reload) para outra rota
    //    protegida, através do próprio menu do app — isso exercita o guard
    //    do vue-router (`beforeEach`) na mesma sessão de SPA em que
    //    `authStore.loaded` já era `true` antes da correção.
    await page.getByTestId('menu-toggle').click()
    await page.getByRole('link', { name: 'Formulários dinâmicos' }).click()

    // 4. O guard deve reavaliar a sessão a partir do localStorage e
    //    redirecionar para /login, mesmo com o app já tendo passado por
    //    checkAuth() antes nesta mesma sessão do SPA.
    await expect(page).toHaveURL('/login')
    await expect(page.getByTestId('login-btn-entrar')).toBeVisible()
    await expect(page.getByTestId('menu-toggle')).not.toBeVisible()
  })

  test('requisição de API retornando 401 limpa a sessão, oculta o menu e redireciona para /login', async ({ page }) => {
    // Intercepta qualquer chamada à API e força uma resposta 401, simulando
    // uma sessão expirada no backend — configurado antes da navegação para
    // que a primeira chamada de dados da página já seja capturada.
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'error', message: 'Não autorizado.', errors: null }),
      })
    })

    // A aba "Processos" faz uma chamada de API (listagem) ao montar.
    await page.goto('/adm/projetos#processos')

    await expect(page).toHaveURL('/login', { timeout: 15000 })
    await expect(page.getByTestId('login-btn-entrar')).toBeVisible()
    await expect(page.getByTestId('menu-toggle')).not.toBeVisible()
  })
})
