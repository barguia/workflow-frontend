import { describe, it, expect } from 'vitest'
import {
  chaveHeader,
  resolveFormatter,
  formatarValor,
  headersComFormatacao,
} from '@/composables/useColumnFormatting.js'
import { formatters } from '@/utils/formatters.js'

describe('useColumnFormatting', () => {
  describe('chaveHeader', () => {
    it('usa `key` quando presente (colunas dinâmicas)', () => {
      expect(chaveHeader({ key: 'nome', value: 'outro' })).toBe('nome')
    })

    it('cai para `value` quando não há `key` (headers estáticos das páginas)', () => {
      expect(chaveHeader({ title: 'Nome', value: 'nome' })).toBe('nome')
    })
  })

  describe('resolveFormatter', () => {
    it('retorna null quando o header não tem format nem formatter', () => {
      expect(resolveFormatter({ key: 'nome' })).toBeNull()
    })

    it('resolve um format nomeado existente em formatters.js', () => {
      expect(resolveFormatter({ format: 'upper' })).toBe(formatters.upper)
    })

    it('retorna null para um format desconhecido', () => {
      expect(resolveFormatter({ format: 'inexistente' })).toBeNull()
    })

    it('dá prioridade para `formatter` (função) sobre `format` (nome)', () => {
      const customFn = (v) => `custom:${v}`
      expect(resolveFormatter({ format: 'upper', formatter: customFn })).toBe(customFn)
    })
  })

  describe('formatarValor', () => {
    it('aplica o formatter resolvido ao valor', () => {
      expect(formatarValor({ format: 'upper' }, 'joão')).toBe('JOÃO')
    })

    it('passa o item pro formatter custom', () => {
      const formatter = (valor, item) => `${valor}-${item.id}`
      expect(formatarValor({ formatter }, 'x', { id: 7 })).toBe('x-7')
    })

    it('retorna o valor sem alteração quando não há formatter', () => {
      expect(formatarValor({ key: 'nome' }, 'joão')).toBe('joão')
    })
  })

  describe('headersComFormatacao', () => {
    it('inclui headers com format, formatter, bold ou italic', () => {
      const headers = [
        { key: 'a', format: 'upper' },
        { key: 'b', formatter: () => {} },
        { key: 'c', bold: true },
        { key: 'd', italic: true },
        { key: 'e' },
      ]
      expect(headersComFormatacao(headers).map(h => h.key)).toEqual(['a', 'b', 'c', 'd'])
    })

    it('não inclui um header sem nenhuma customização', () => {
      expect(headersComFormatacao([{ key: 'nome' }, { key: 'actions' }])).toEqual([])
    })
  })
})
