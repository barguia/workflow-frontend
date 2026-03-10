import { createApp } from 'vue'

/**
 * Monta um composable em um contexto de componente real,
 * permitindo que onMounted/onUnmounted funcionem corretamente.
 *
 * @param {Function} composable - função composable a ser testada
 * @returns {{ result: any, app: App, unmount: () => void }}
 */
export function withSetup(composable) {
  let result
  const app = createApp({
    setup() {
      result = composable()
      return () => {}
    },
  })
  app.mount(document.createElement('div'))
  return {
    result,
    app,
    unmount: () => app.unmount(),
  }
}
