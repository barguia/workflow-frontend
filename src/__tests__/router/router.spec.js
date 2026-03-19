import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

// --- vi.hoisted garante que as variáveis existam antes do hoisting dos vi.mock ---
const { checkAuth, mockAuthStore } = vi.hoisted(() => {
  const checkAuth = vi.fn().mockResolvedValue(undefined)
  return {
    checkAuth,
    mockAuthStore: { checkAuth, isAuthenticated: false },
  }
})

// --- Mocks (devem vir antes dos imports que os usam) ---

vi.mock('@/stores/authStore.js', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Substitui createWebHistory por createMemoryHistory para evitar dependência
// da URL real do browser no ambiente jsdom, o que causava timeout em isReady().
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, createWebHistory: actual.createMemoryHistory }
})

// Stub dos sub-módulos de rotas para evitar importar componentes reais de página.
// Os beforeEnter guards são copiados aqui pois fazem parte da lógica de negócio
// das rotas e não possuem dependências externas.
vi.mock('@/components/pages/controle-acesso/routes/routes.js', () => ({
  default: [
    {
      path: '/login',
      name: 'Login',
      component: { template: '<div/>' },
      meta: { requiresAuth: false },
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: { template: '<div/>' },
      meta: { requiresAuth: false },
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: { template: '<div/>' },
      meta: { requiresAuth: false },
    },
    {
      path: '/adm/administracao',
      name: 'Administracao',
      component: { template: '<div/>' },
      meta: { requiresAuth: true },
      beforeEnter: (to, from, next) => {
        const hashesValidos = ['#adm', '#organizacoes', '#usuarios', '#perfis', '#permissoes', '#menus']
        if (to.hash && !hashesValidos.includes(to.hash)) {
          next({ path: '/adm/administracao', hash: '#adm' })
        } else {
          next()
        }
      },
    },
  ],
}))

vi.mock('@/components/pages/aplicacao/routes/routes.js', () => ({
  default: [
    {
      path: '/',
      name: 'Home',
      component: { template: '<div/>' },
      meta: { requiresAuth: false },
    },
  ],
}))

vi.mock('@/components/pages/projeto/routes/routes.js', () => ({
  default: [
    {
      path: '/adm/projetos',
      name: 'GestaoProjetoProjeto',
      component: { template: '<div/>' },
      meta: { requiresAuth: true },
      beforeEnter: (to, from, next) => {
        const HASHES_VALIDOS = [
          '#visao-geral', '#projetos', '#tarefas', '#processos',
          '#hierarquias', '#workflows', '#pesquisa', '#backlog',
        ]
        if (to.hash && !HASHES_VALIDOS.includes(to.hash)) {
          next({ path: '/adm/projetos', hash: '#visao-geral' })
        } else {
          next()
        }
      },
    },
    {
      path: '/ficha-tecnica/:id',
      name: 'FichaTecnica',
      component: { template: '<div/>' },
      meta: { requiresAuth: true },
    },
    {
      path: '/fila-tarefa/:id',
      name: 'FilaTarefa',
      component: { template: '<div/>' },
      meta: { requiresAuth: true },
    },
    {
      path: '/mobilidade-tarefa/:id',
      name: 'MobilidadeTarefa',
      component: { template: '<div/>' },
      meta: { requiresAuth: true },
    },
  ],
}))

vi.mock('@/components/pages/NotFoundView.vue', () => ({
  default: { template: '<div>404</div>' },
}))

import router from '@/router/router.js'

// =============================================================================
// Guard global beforeEach
// =============================================================================
describe('guard beforeEach — controle de autenticação', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkAuth.mockResolvedValue(undefined)
  })

  it('chama checkAuth em toda navegação', async () => {
    mockAuthStore.isAuthenticated = false
    await router.push('/login')
    expect(checkAuth).toHaveBeenCalled()
  })

  it('rota protegida sem autenticação redireciona para /login', async () => {
    mockAuthStore.isAuthenticated = false
    await router.push('/adm/projetos')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('rota protegida com autenticação passa normalmente', async () => {
    mockAuthStore.isAuthenticated = true
    await router.push('/adm/projetos')
    expect(router.currentRoute.value.path).toBe('/adm/projetos')
  })

  it('rota pública sem autenticação passa normalmente', async () => {
    mockAuthStore.isAuthenticated = false
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('rota pública com autenticação passa normalmente', async () => {
    mockAuthStore.isAuthenticated = true
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('/ (home) é acessível sem autenticação', async () => {
    mockAuthStore.isAuthenticated = false
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('/forgot-password é acessível sem autenticação', async () => {
    mockAuthStore.isAuthenticated = false
    await router.push('/forgot-password')
    expect(router.currentRoute.value.path).toBe('/forgot-password')
  })

  it('/reset-password é acessível sem autenticação', async () => {
    mockAuthStore.isAuthenticated = false
    await router.push('/reset-password')
    expect(router.currentRoute.value.path).toBe('/reset-password')
  })
})

// =============================================================================
// beforeEnter — /adm/administracao
// =============================================================================
describe('guard beforeEnter — /adm/administracao', () => {
  beforeEach(() => {
    mockAuthStore.isAuthenticated = true
    checkAuth.mockResolvedValue(undefined)
  })

  it('sem hash: navega normalmente', async () => {
    await router.push('/adm/administracao')
    expect(router.currentRoute.value.path).toBe('/adm/administracao')
    expect(router.currentRoute.value.hash).toBe('')
  })

  it.each(['#adm', '#organizacoes', '#usuarios', '#perfis', '#permissoes', '#menus'])(
    'hash válido %s: navega normalmente',
    async (hash) => {
      await router.push(`/adm/administracao${hash}`)
      expect(router.currentRoute.value.hash).toBe(hash)
    },
  )

  it('hash inválido: guard chama next com redirect para #adm', () => {
    // Testado diretamente na função guard para evitar race condition
    // do redirect assíncrono no Vue Router 4
    const next = vi.fn()
    const route = router.getRoutes().find(r => r.name === 'Administracao')
    route.beforeEnter({ hash: '#invalido', path: '/adm/administracao' }, {}, next)
    expect(next).toHaveBeenCalledWith({ path: '/adm/administracao', hash: '#adm' })
  })
})

// =============================================================================
// beforeEnter — /adm/projetos
// =============================================================================
describe('guard beforeEnter — /adm/projetos', () => {
  beforeEach(() => {
    mockAuthStore.isAuthenticated = true
    checkAuth.mockResolvedValue(undefined)
  })

  it('sem hash: navega normalmente', async () => {
    await router.push('/adm/projetos')
    expect(router.currentRoute.value.path).toBe('/adm/projetos')
    expect(router.currentRoute.value.hash).toBe('')
  })

  it.each(['#visao-geral', '#projetos', '#tarefas', '#processos', '#hierarquias', '#workflows', '#pesquisa', '#backlog'])(
    'hash válido %s: navega normalmente',
    async (hash) => {
      await router.push(`/adm/projetos${hash}`)
      expect(router.currentRoute.value.hash).toBe(hash)
    },
  )

  it('hash inválido: guard chama next com redirect para #visao-geral', () => {
    const next = vi.fn()
    const route = router.getRoutes().find(r => r.name === 'GestaoProjetoProjeto')
    route.beforeEnter({ hash: '#invalido', path: '/adm/projetos' }, {}, next)
    expect(next).toHaveBeenCalledWith({ path: '/adm/projetos', hash: '#visao-geral' })
  })
})

// =============================================================================
// Rotas com parâmetros dinâmicos
// =============================================================================
describe('rotas com parâmetros dinâmicos', () => {
  beforeEach(() => {
    mockAuthStore.isAuthenticated = true
    checkAuth.mockResolvedValue(undefined)
  })

  it('/ficha-tecnica/:id — resolve o parâmetro corretamente', async () => {
    await router.push('/ficha-tecnica/42')
    expect(router.currentRoute.value.path).toBe('/ficha-tecnica/42')
    expect(router.currentRoute.value.params.id).toBe('42')
  })

  it('/fila-tarefa/:id — resolve o parâmetro corretamente', async () => {
    await router.push('/fila-tarefa/7')
    expect(router.currentRoute.value.path).toBe('/fila-tarefa/7')
    expect(router.currentRoute.value.params.id).toBe('7')
  })

  it('/mobilidade-tarefa/:id — resolve o parâmetro corretamente', async () => {
    await router.push('/mobilidade-tarefa/3')
    expect(router.currentRoute.value.path).toBe('/mobilidade-tarefa/3')
    expect(router.currentRoute.value.params.id).toBe('3')
  })

  it('/ficha-tecnica/:id sem autenticação redireciona para /login', async () => {
    mockAuthStore.isAuthenticated = false
    await router.push('/ficha-tecnica/99')
    expect(router.currentRoute.value.path).toBe('/login')
  })
})

// =============================================================================
// Rota 404
// =============================================================================
describe('rota 404', () => {
  beforeEach(() => {
    mockAuthStore.isAuthenticated = true
    checkAuth.mockResolvedValue(undefined)
  })

  it('rota desconhecida ativa o not-found', async () => {
    await router.push('/rota-que-nao-existe-jamais')
    expect(router.currentRoute.value.name).toBe('not-found')
  })

  it('rota desconhecida aninhada ativa o not-found', async () => {
    await router.push('/a/b/c/d')
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})
