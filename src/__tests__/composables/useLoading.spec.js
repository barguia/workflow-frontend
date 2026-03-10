import { describe, it, expect, afterEach } from 'vitest'
import { useLoading } from '@/composables/useLoading'

// useLoading usa estado global (módulo compartilhado), então
// cada teste deve restaurar o estado ao final.
describe('useLoading', () => {
  afterEach(() => {
    const { stopLoading } = useLoading()
    stopLoading()
  })

  it('inicia com isLoading() false', () => {
    const { isLoading } = useLoading()
    expect(isLoading()).toBe(false)
  })

  it('startLoading faz isLoading() retornar true', () => {
    const { startLoading, isLoading } = useLoading()
    startLoading()
    expect(isLoading()).toBe(true)
  })

  it('stopLoading faz isLoading() retornar false', () => {
    const { startLoading, stopLoading, isLoading } = useLoading()
    startLoading()
    stopLoading()
    expect(isLoading()).toBe(false)
  })

  it('o estado é compartilhado entre instâncias', () => {
    const a = useLoading()
    const b = useLoading()
    a.startLoading()
    expect(b.isLoading()).toBe(true)
  })
})
