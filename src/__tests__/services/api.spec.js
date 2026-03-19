import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks de dependências (devem vir antes dos imports que os usam) ---

vi.mock('@/stores/authStore.js', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/composables/useLoading.js', () => ({
  useLoading: vi.fn(),
}))

vi.mock('@/router/router.js', () => ({
  default: {
    currentRoute: { value: { path: '/dashboard' } },
    push: vi.fn().mockResolvedValue(undefined),
  },
}))

import api from '@/services/api.js'
import { useAuthStore } from '@/stores/authStore.js'
import { useLoading } from '@/composables/useLoading.js'
import router from '@/router/router.js'

// --- Helpers ---

const startLoading = vi.fn()
const stopLoading = vi.fn()
const limpaSessao = vi.fn()
const loadToken = vi.fn()

function mockAuthStore(token = null) {
  useAuthStore.mockReturnValue({ token, loadToken, limpaSessao })
}

function mockAdapterSuccess(data = { data: [] }) {
  api.defaults.adapter = async (config) => ({
    status: 200,
    data,
    headers: {},
    config,
    statusText: 'OK',
  })
}

function mockAdapterError(status, responseData = {}) {
  api.defaults.adapter = async (config) => {
    const err = new Error(`Request failed with status code ${status}`)
    err.response = { status, data: responseData, config }
    err.config = config
    throw err
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  useLoading.mockReturnValue({ startLoading, stopLoading })
  mockAuthStore()
})

// =============================================================================
// Interceptor de request — token
// =============================================================================
describe('interceptor de request — token de autenticação', () => {
  it('injeta o header Authorization quando há token na store', async () => {
    mockAuthStore('meu-token-valido')
    let capturedConfig
    api.defaults.adapter = async (config) => {
      capturedConfig = config
      return { status: 200, data: {}, headers: {}, config, statusText: 'OK' }
    }

    await api.get('/qualquer')
    expect(capturedConfig.headers.Authorization).toBe('Bearer meu-token-valido')
  })

  it('não injeta o header Authorization quando não há token', async () => {
    mockAuthStore(null)
    let capturedConfig
    api.defaults.adapter = async (config) => {
      capturedConfig = config
      return { status: 200, data: {}, headers: {}, config, statusText: 'OK' }
    }

    await api.get('/qualquer')
    expect(capturedConfig.headers.Authorization).toBeUndefined()
  })

  it('chama loadToken a cada request', async () => {
    mockAdapterSuccess()
    await api.get('/qualquer')
    expect(loadToken).toHaveBeenCalled()
  })
})

// =============================================================================
// Interceptor de request — loading
// =============================================================================
describe('interceptor de request — loading', () => {
  it('chama startLoading em toda requisição', async () => {
    mockAdapterSuccess()
    await api.get('/qualquer')
    expect(startLoading).toHaveBeenCalled()
  })
})

// =============================================================================
// Interceptor de response — sucesso
// =============================================================================
describe('interceptor de response — sucesso', () => {
  it('chama stopLoading e retorna a resposta', async () => {
    const payload = { data: [{ id: 1 }] }
    mockAdapterSuccess(payload)

    const response = await api.get('/qualquer')
    expect(stopLoading).toHaveBeenCalled()
    expect(response.data).toEqual(payload)
  })
})

// =============================================================================
// Interceptor de response — erros HTTP
// =============================================================================
describe('interceptor de response — erro 422 (validação)', () => {
  const erros = { email: ['Inválido'] }
  const mensagem = 'Erro de validação.'
  const responseData = { errors: erros, message: mensagem }

  it('chama stopLoading', async () => {
    mockAdapterError(422, responseData)
    await api.get('/qualquer').catch(() => {})
    expect(stopLoading).toHaveBeenCalled()
  })

  it('despacha CustomEvent "validation-errors" com os erros', async () => {
    mockAdapterError(422, responseData)
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    await api.get('/qualquer').catch(() => {})

    const evento = dispatchSpy.mock.calls.find(
      ([e]) => e.type === 'validation-errors',
    )?.[0]
    expect(evento).toBeDefined()
    expect(evento.detail).toEqual(erros)
  })

  it('rejeita a promise com type "validation"', async () => {
    mockAdapterError(422, responseData)
    await expect(api.get('/qualquer')).rejects.toMatchObject({
      type: 'validation',
      listener: 'validation-errors',
      errors: erros,
      message: mensagem,
    })
  })

  it('usa mensagem padrão quando a resposta não traz message', async () => {
    mockAdapterError(422, { errors: erros })
    await expect(api.get('/qualquer')).rejects.toMatchObject({
      message: 'Erro de validação. Corrija os campos destacados.',
    })
  })
})

describe('interceptor de response — erro 403 (acesso negado)', () => {
  const responseData = { errors: null, message: 'Proibido.' }

  it('despacha CustomEvent "notification" com type "error"', async () => {
    mockAdapterError(403, responseData)
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    await api.get('/qualquer').catch(() => {})

    const evento = dispatchSpy.mock.calls.find(
      ([e]) => e.type === 'notification',
    )?.[0]
    expect(evento).toBeDefined()
    expect(evento.detail).toEqual({ type: 'error', message: 'Proibido.' })
  })

  it('rejeita a promise com type "forbidden"', async () => {
    mockAdapterError(403, responseData)
    await expect(api.get('/qualquer')).rejects.toMatchObject({
      type: 'forbidden',
      listener: 'notification',
    })
  })

  it('usa mensagem padrão quando a resposta não traz message', async () => {
    mockAdapterError(403, { errors: null })
    await expect(api.get('/qualquer')).rejects.toMatchObject({
      message: 'Acesso negado. Solicite permissão para o administrador.',
    })
  })
})

describe('interceptor de response — erro 401 (não autenticado)', () => {
  const responseData = { errors: null, message: 'Não autorizado.' }

  it('chama limpaSessao na store', async () => {
    mockAdapterError(401, responseData)
    await api.get('/qualquer').catch(() => {})
    expect(limpaSessao).toHaveBeenCalled()
  })

  it('redireciona para /login quando a rota atual não é pública', async () => {
    router.currentRoute.value.path = '/dashboard'
    mockAdapterError(401, responseData)
    await api.get('/qualquer').catch(() => {})
    expect(router.push).toHaveBeenCalledWith('/login')
  })

  it('não redireciona quando já está em rota pública', async () => {
    router.currentRoute.value.path = '/login'
    mockAdapterError(401, responseData)
    await api.get('/qualquer').catch(() => {})
    expect(router.push).not.toHaveBeenCalled()
    // restaura
    router.currentRoute.value.path = '/dashboard'
  })

  it('rejeita a promise com type "unauthorized"', async () => {
    router.currentRoute.value.path = '/dashboard'
    mockAdapterError(401, responseData)
    await expect(api.get('/qualquer')).rejects.toMatchObject({
      type: 'unauthorized',
      listener: 'notification',
    })
  })
})

describe('interceptor de response — erro 500 (servidor)', () => {
  const responseData = { errors: null, message: 'Erro interno.' }

  it('despacha CustomEvent "notification"', async () => {
    mockAdapterError(500, responseData)
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    await api.get('/qualquer').catch(() => {})

    const evento = dispatchSpy.mock.calls.find(
      ([e]) => e.type === 'notification',
    )?.[0]
    expect(evento).toBeDefined()
    expect(evento.detail).toEqual({ type: 'error', message: 'Erro interno.' })
  })

  it('rejeita a promise com type "server"', async () => {
    mockAdapterError(500, responseData)
    await expect(api.get('/qualquer')).rejects.toMatchObject({
      type: 'server',
      listener: 'notification',
    })
  })
})

describe('interceptor de response — erro genérico (sem status)', () => {
  it('despacha CustomEvent "notification" com mensagem genérica', async () => {
    api.defaults.adapter = async () => {
      throw new Error('Network Error')
    }
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    await api.get('/qualquer').catch(() => {})

    const evento = dispatchSpy.mock.calls.find(
      ([e]) => e.type === 'notification',
    )?.[0]
    expect(evento).toBeDefined()
    expect(evento.detail.message).toBe('Erro ao processar os dados.')
  })

  it('rejeita a promise com type "general"', async () => {
    api.defaults.adapter = async () => {
      throw new Error('Network Error')
    }
    await expect(api.get('/qualquer')).rejects.toMatchObject({
      type: 'general',
      listener: 'notification',
    })
  })
})
