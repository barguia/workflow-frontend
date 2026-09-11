import { describe, it, expect } from 'vitest'
import { formatters } from '@/utils/formatters.js'

describe('formatters', () => {
  describe('upper', () => {
    it('converte para maiúsculo', () => {
      expect(formatters.upper('joão')).toBe('JOÃO')
    })

    it('trata null/undefined como string vazia', () => {
      expect(formatters.upper(null)).toBe('')
      expect(formatters.upper(undefined)).toBe('')
    })
  })

  describe('lower', () => {
    it('converte para minúsculo', () => {
      expect(formatters.lower('JOÃO')).toBe('joão')
    })

    it('trata null/undefined como string vazia', () => {
      expect(formatters.lower(null)).toBe('')
    })
  })

  describe('date', () => {
    it('formata sem hora', () => {
      expect(formatters.date('2026-08-14 13:06:39')).toBe('14/08/2026')
    })

    it('retorna "—" para valor nulo/vazio', () => {
      expect(formatters.date(null)).toBe('—')
      expect(formatters.date('')).toBe('—')
    })

    it('retorna "—" para data inválida', () => {
      expect(formatters.date('não é uma data')).toBe('—')
    })
  })

  describe('datetime', () => {
    it('formata com hora', () => {
      expect(formatters.datetime('2026-08-14 13:06:39')).toBe('14/08/2026, 13:06')
    })

    it('retorna "—" para valor nulo/vazio', () => {
      expect(formatters.datetime(null)).toBe('—')
    })

    it('retorna "—" para data inválida', () => {
      expect(formatters.datetime('não é uma data')).toBe('—')
    })
  })
})
