import { describe, it, expect, afterEach } from 'vitest'
import { useNotifications } from '@/composables/useNotifications'
import { withSetup } from '@/__tests__/utils/withSetup'

describe('useNotifications', () => {
  let cleanup

  afterEach(() => {
    cleanup?.()
    cleanup = null
  })

  it('inicia com valores padrão', () => {
    const { result, unmount } = withSetup(() => useNotifications())
    cleanup = unmount
    expect(result.message.value).toBe('')
    expect(result.type.value).toBe('')
    expect(result.showSnackbar.value).toBe(false)
  })

  it('triggerNotification atualiza message, type e showSnackbar', () => {
    const { result, unmount } = withSetup(() => useNotifications())
    cleanup = unmount
    result.triggerNotification({ message: 'Erro!', typeMessage: 'error' })
    expect(result.message.value).toBe('Erro!')
    expect(result.type.value).toBe('error')
    expect(result.showSnackbar.value).toBe(true)
  })

  it('triggerNotification usa "error" como typeMessage padrão', () => {
    const { result, unmount } = withSetup(() => useNotifications())
    cleanup = unmount
    result.triggerNotification({ message: 'Algo deu errado' })
    expect(result.type.value).toBe('error')
  })

  it('clearNotification reseta o estado', () => {
    const { result, unmount } = withSetup(() => useNotifications())
    cleanup = unmount
    result.triggerNotification({ message: 'Teste', typeMessage: 'warning' })
    result.clearNotification()
    expect(result.showSnackbar.value).toBe(false)
    expect(result.message.value).toBe('')
    expect(result.type.value).toBe('')
  })

  it('responde ao evento "notification" do window', () => {
    const { result, unmount } = withSetup(() => useNotifications())
    cleanup = unmount
    window.dispatchEvent(
      new CustomEvent('notification', {
        detail: { message: 'Servidor offline', type: 'warning' },
      }),
    )
    expect(result.message.value).toBe('Servidor offline')
    expect(result.type.value).toBe('warning')
    expect(result.showSnackbar.value).toBe(true)
  })

  it('remove o listener ao desmontar o componente', () => {
    const { result, unmount } = withSetup(() => useNotifications())
    unmount()
    cleanup = null
    window.dispatchEvent(
      new CustomEvent('notification', {
        detail: { message: 'Não deve ser capturado', type: 'error' },
      }),
    )
    // O estado não deve ter sido atualizado pois o listener foi removido
    expect(result.message.value).toBe('')
  })
})
