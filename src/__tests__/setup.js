import { beforeEach, vi } from 'vitest'

// Node.js 25+ expõe localStorage nativo via node:internal/webstorage,
// mas requer --localstorage-file com path válido. jsdom 28 delega para
// essa implementação nativa, deixando .clear() indisponível nos testes.
// Substituímos por um mock em memória com a API Web Storage completa.
const createStorageMock = () => {
  let store = {}
  return {
    getItem:    (key)        => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    setItem:    (key, value) => { store[key] = String(value) },
    removeItem: (key)        => { delete store[key] },
    clear:      ()           => { store = {} },
    get length()             { return Object.keys(store).length },
    key:        (i)          => Object.keys(store)[i] ?? null,
  }
}

vi.stubGlobal('localStorage', createStorageMock())
vi.stubGlobal('sessionStorage', createStorageMock())

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})
