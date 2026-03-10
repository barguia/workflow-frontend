import { describe, it, expect, afterEach } from 'vitest'
import { useValidationErrors } from '@/composables/useValidationErrors'
import { withSetup } from '@/__tests__/utils/withSetup'

describe('useValidationErrors', () => {
  let cleanup

  afterEach(() => {
    cleanup?.()
    cleanup = null
  })

  it('inicia com objeto de erros vazio', () => {
    const { result, unmount } = withSetup(() => useValidationErrors())
    cleanup = unmount
    expect(result.validationErrors.value).toEqual({})
  })

  it('popula validationErrors ao receber o evento "validation-errors"', () => {
    const { result, unmount } = withSetup(() => useValidationErrors())
    cleanup = unmount
    const erros = { email: ['E-mail inválido'], password: ['Senha obrigatória'] }
    window.dispatchEvent(new CustomEvent('validation-errors', { detail: erros }))
    expect(result.validationErrors.value).toEqual(erros)
  })

  it('clearErrors reseta para objeto vazio', () => {
    const { result, unmount } = withSetup(() => useValidationErrors())
    cleanup = unmount
    window.dispatchEvent(
      new CustomEvent('validation-errors', { detail: { email: ['inválido'] } }),
    )
    result.clearErrors()
    expect(result.validationErrors.value).toEqual({})
  })

  it('remove o listener ao desmontar', () => {
    const { result, unmount } = withSetup(() => useValidationErrors())
    unmount()
    cleanup = null
    window.dispatchEvent(
      new CustomEvent('validation-errors', { detail: { campo: ['erro'] } }),
    )
    expect(result.validationErrors.value).toEqual({})
  })
})
