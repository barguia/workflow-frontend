import { describe, it, expect, vi, beforeEach } from 'vitest'
import Crud from '@/services/crud'

function makeApi() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}

describe('Crud', () => {
  let api
  let crud

  beforeEach(() => {
    api = makeApi()
    crud = new Crud('app/items', api)
  })

  describe('index', () => {
    it('faz GET na rota correta e retorna data.data', async () => {
      api.get.mockResolvedValue({ data: { data: [{ id: 1 }] } })
      const result = await crud.index()
      expect(api.get).toHaveBeenCalledWith('app/items', { params: {} })
      expect(result).toEqual([{ id: 1 }])
    })

    it('passa payload como query params', async () => {
      api.get.mockResolvedValue({ data: { data: [] } })
      await crud.index({ page: 2, search: 'foo' })
      expect(api.get).toHaveBeenCalledWith('app/items', { params: { page: 2, search: 'foo' } })
    })
  })

  describe('create', () => {
    it('faz POST na rota correta e retorna data', async () => {
      const response = { data: { id: 1, name: 'Novo' } }
      api.post.mockResolvedValue({ data: response })
      const result = await crud.create({ name: 'Novo' })
      expect(api.post).toHaveBeenCalledWith('app/items', { name: 'Novo' })
      expect(result).toEqual(response)
    })
  })

  describe('update', () => {
    it('faz PUT em /rota/:id e retorna data', async () => {
      const response = { data: { id: 5, name: 'Atualizado' } }
      api.put.mockResolvedValue({ data: response })
      const result = await crud.update({ id: 5, name: 'Atualizado' })
      expect(api.put).toHaveBeenCalledWith('app/items/5', { id: 5, name: 'Atualizado' })
      expect(result).toEqual(response)
    })
  })

  describe('delete', () => {
    it('faz DELETE em /rota/:id e retorna data', async () => {
      api.delete.mockResolvedValue({ data: { success: true } })
      const result = await crud.delete({ id: 3 })
      expect(api.delete).toHaveBeenCalledWith('app/items/3')
      expect(result).toEqual({ success: true })
    })
  })

  describe('propagação de erros', () => {
    it('propaga erro do axios em index', async () => {
      api.get.mockRejectedValue(new Error('Network Error'))
      await expect(crud.index()).rejects.toThrow('Network Error')
    })

    it('propaga erro do axios em create', async () => {
      api.post.mockRejectedValue(new Error('Server Error'))
      await expect(crud.create({ name: 'x' })).rejects.toThrow('Server Error')
    })
  })
})
