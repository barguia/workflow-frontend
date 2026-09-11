import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { encryptToken as encryptTokenUtil } from '@/utils/tokenCrypto.js'

// Mock do authService antes de importar a store
vi.mock('@/services/authService.js', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService.js'

// Usa exatamente a mesma resolução de chave que a store
const CRYPTO_KEY = import.meta.env.VITE_CRYPTO_KEY || 'sua-chave-secreta-aqui'

function encryptToken(token) {
  return encryptTokenUtil(token, CRYPTO_KEY)
}

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('token é null', () => {
      const store = useAuthStore()
      expect(store.token).toBeNull()
    })

    it('menus é array vazio', () => {
      const store = useAuthStore()
      expect(store.menus).toEqual([])
    })

    it('loaded é false', () => {
      const store = useAuthStore()
      expect(store.loaded).toBe(false)
    })
  })

  describe('isAuthenticated', () => {
    it('retorna false quando token é null', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('retorna true quando token está definido', () => {
      const store = useAuthStore()
      store.token = 'fake-token'
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('setSessao', () => {
    it('salva o token criptografado no localStorage', async () => {
      const store = useAuthStore()
      await store.setSessao('meu-token', [])
      expect(localStorage.getItem('authToken')).toBeTruthy()
    })

    it('atualiza token e menus na store', async () => {
      const store = useAuthStore()
      const menus = [{ id: 1, name: 'Dashboard' }]
      await store.setSessao('meu-token', menus)
      expect(store.token).toBe('meu-token')
      expect(store.menus).toEqual(menus)
    })

    it('marca loaded como true', async () => {
      const store = useAuthStore()
      await store.setSessao('meu-token', [])
      expect(store.loaded).toBe(true)
    })

    it('não faz nada quando token é falsy', async () => {
      const store = useAuthStore()
      await store.setSessao(null, [])
      expect(store.token).toBeNull()
      expect(localStorage.getItem('authToken')).toBeNull()
    })
  })

  describe('loadToken', () => {
    it('descriptografa e carrega o token do localStorage', async () => {
      localStorage.setItem('authToken', await encryptToken('token-salvo'))
      localStorage.setItem('menus', JSON.stringify([]))
      const store = useAuthStore()
      await store.loadToken()
      expect(store.token).toBe('token-salvo')
    })

    it('carrega menus do localStorage', async () => {
      const menus = [{ id: 1 }]
      localStorage.setItem('authToken', await encryptToken('t'))
      localStorage.setItem('menus', JSON.stringify(menus))
      const store = useAuthStore()
      await store.loadToken()
      expect(store.menus).toEqual(menus)
    })

    it('não lança exceção quando o dado no localStorage está corrompido', async () => {
      localStorage.setItem('authToken', 'dado-invalido-que-nao-e-aes')
      const store = useAuthStore()
      // O Web Crypto rejeita a Promise para ciphertext inválido — o try/catch interno
      // do loadToken() trata isso e limpa a sessão, sem propagar erro pro caller.
      await store.loadToken()
      expect(store.token).toBeNull()
    })

    it('não faz nada quando localStorage está vazio', async () => {
      const store = useAuthStore()
      await store.loadToken()
      expect(store.token).toBeNull()
      expect(store.loaded).toBe(false)
    })

    it('limpa o estado em memória quando o localStorage foi invalidado externamente (ex: 401 em outra aba)', async () => {
      const store = useAuthStore()
      // Simula uma store com sessão "grudada" em memória, mas sem token no localStorage
      // (ex: outra aba/requisição já limpou a sessão).
      store.token = 'token-obsoleto'
      store.menus = [{ id: 1 }]
      store.loaded = true

      await store.loadToken()

      expect(store.token).toBeNull()
      expect(store.menus).toEqual([])
      expect(store.loaded).toBe(false)
    })
  })

  describe('limpaSessao', () => {
    it('zera token, menus, loaded e remove do localStorage', async () => {
      const store = useAuthStore()
      await store.setSessao('token', [{ id: 1 }])
      store.limpaSessao()
      expect(store.token).toBeNull()
      expect(store.menus).toEqual([])
      expect(store.loaded).toBe(false)
      expect(localStorage.getItem('authToken')).toBeNull()
      expect(localStorage.getItem('menus')).toBeNull()
    })
  })

  describe('checkAuth', () => {
    it('retorna false quando não há token', async () => {
      const store = useAuthStore()
      const result = await store.checkAuth()
      expect(result).toBe(false)
    })

    it('retorna true quando há token válido no localStorage', async () => {
      localStorage.setItem('authToken', await encryptToken('valid-token'))
      const store = useAuthStore()
      const result = await store.checkAuth()
      expect(result).toBe(true)
    })

    it('marca loaded como true após a verificação', async () => {
      const store = useAuthStore()
      await store.checkAuth()
      expect(store.loaded).toBe(true)
    })

    it('reavalia o localStorage mesmo quando já foi carregado antes (evita estado desatualizado)', async () => {
      const store = useAuthStore()
      // Estado em memória "grudado" de uma sessão anterior, mas sem token
      // persistido no localStorage (ex: já limpo por um 401 anterior).
      store.loaded = true
      store.token = 'token-obsoleto'

      const result = await store.checkAuth()

      expect(result).toBe(false)
      expect(store.token).toBeNull()
    })

    it('mantém autenticado em chamadas repetidas quando o token no localStorage continua válido', async () => {
      localStorage.setItem('authToken', await encryptToken('valid-token'))
      const store = useAuthStore()

      await store.checkAuth()
      const result = await store.checkAuth()

      expect(result).toBe(true)
      expect(store.token).toBe('valid-token')
    })
  })

  describe('login', () => {
    it('chama authService.login e persiste a sessão', async () => {
      authService.login.mockResolvedValue({ token: 'novo-token', menus: [] })
      const store = useAuthStore()
      const result = await store.login({ email: 'a@b.com', password: '123' })
      expect(result).toBe(true)
      expect(store.token).toBe('novo-token')
    })

    it('propaga o erro quando authService.login falha', async () => {
      vi.spyOn(console, 'log').mockImplementation(() => {})
      authService.login.mockRejectedValue(new Error('Credenciais inválidas'))
      const store = useAuthStore()
      await expect(store.login({ email: 'a@b.com', password: 'errado' })).rejects.toThrow()
      vi.restoreAllMocks()
    })
  })
})
