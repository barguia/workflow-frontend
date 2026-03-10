import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock da classe Crud antes dos imports dependentes.
// Usa function() para que `new Crud()` retorne o objeto de métodos mock.
const crudMethods = {
  index: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/services/crud', () => ({
  default: vi.fn(function () {
    return crudMethods
  }),
}))

import { useCrud } from '@/services/useCrud'

describe('useCrud', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inicializa com estado limpo', () => {
    const { errors, snackbarMessage, showSnackbar } = useCrud('app/test')
    expect(errors.value).toEqual({})
    expect(snackbarMessage.value).toBe('')
    expect(showSnackbar.value).toBe(false)
  })

  describe('index', () => {
    it('retorna os dados quando a requisição tem sucesso', async () => {
      const { index } = useCrud('app/test')
      crudMethods.index.mockResolvedValue([{ id: 1 }])
      const result = await index()
      expect(result).toEqual([{ id: 1 }])
    })

    it('popula errors e showSnackbar quando falha', async () => {
      const { index, errors, showSnackbar, snackbarMessage } = useCrud('app/test')
      const erro = { errors: { campo: ['inválido'] }, message: 'Erro de validação' }
      crudMethods.index.mockRejectedValue(erro)
      await expect(index()).rejects.toEqual(erro)
      expect(errors.value).toEqual({ campo: ['inválido'] })
      expect(snackbarMessage.value).toBe('Erro de validação')
      expect(showSnackbar.value).toBe(true)
    })
  })

  describe('create', () => {
    it('retorna os dados quando a requisição tem sucesso', async () => {
      const { create } = useCrud('app/test')
      crudMethods.create.mockResolvedValue({ id: 1 })
      const result = await create({ name: 'Novo' })
      expect(result).toEqual({ id: 1 })
    })

    it('popula errors e showSnackbar quando falha', async () => {
      const { create, showSnackbar } = useCrud('app/test')
      const erro = { errors: {}, message: 'Falhou' }
      crudMethods.create.mockRejectedValue(erro)
      await expect(create({})).rejects.toEqual(erro)
      expect(showSnackbar.value).toBe(true)
    })
  })

  describe('update', () => {
    it('retorna os dados quando a requisição tem sucesso', async () => {
      const { update } = useCrud('app/test')
      crudMethods.update.mockResolvedValue({ id: 1, name: 'Atualizado' })
      const result = await update({ id: 1, name: 'Atualizado' })
      expect(result).toEqual({ id: 1, name: 'Atualizado' })
    })
  })

  describe('deleteItem', () => {
    it('retorna os dados quando a requisição tem sucesso', async () => {
      const { deleteItem } = useCrud('app/test')
      crudMethods.delete.mockResolvedValue({ success: true })
      const result = await deleteItem({ id: 1 })
      expect(result).toEqual({ success: true })
    })
  })
})
