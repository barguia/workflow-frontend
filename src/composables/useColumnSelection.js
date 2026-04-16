/**
 * Persiste a seleção e ordenação de colunas no localStorage por chave de rota.
 *
 * Formato salvo: { selected: [...], available: [...] }
 * - selected: colunas visíveis (ordenadas pelo usuário)
 * - available: todas as colunas conhecidas no momento do salvamento
 *
 * Ao inicializar:
 *   - Mantém a ordem salva para colunas que ainda existem
 *   - Acrescenta colunas GENUINAMENTE novas (não estavam no available salvo) ao final
 *   - Colunas que o usuário escondeu NÃO são re-adicionadas
 *   - Seleção vazia salva intencionalmente é respeitada
 *
 * Suporte retrocompatível com o formato antigo (array puro).
 */
export function useColumnSelection(cacheKey) {
  const storageKey = `col-sel:${cacheKey}`
  let lastAvailable = null

  const initColumns = (available) => {
    lastAvailable = available
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return [...available]

      const saved = JSON.parse(raw)

      // Detecta formato: novo { selected, available } vs legado array
      const isNew = !Array.isArray(saved) && saved !== null && 'selected' in saved
      const savedSelected  = isNew ? (saved.selected  ?? []) : saved
      const savedAvailable = isNew ? (saved.available ?? null) : null

      const availableSet = new Set(available)

      // Preserva a ordem salva, filtrando colunas que não existem mais
      const merged = savedSelected.filter(c => availableSet.has(c))

      if (savedAvailable !== null) {
        // Formato novo: apenas colunas genuinamente novas (ausentes no available salvo)
        const savedAvailableSet = new Set(savedAvailable)
        const newCols = available.filter(c => !savedAvailableSet.has(c))
        return [...merged, ...newCols]
      }

      // Formato legado: comportamento original (melhor esforço)
      if (savedSelected.length > 0) {
        const savedSet = new Set(savedSelected)
        const newCols = available.filter(c => !savedSet.has(c))
        return [...merged, ...newCols]
      }

      return merged
    } catch {
      return [...available]
    }
  }

  const saveColumns = (cols) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        selected:  cols,
        available: lastAvailable ?? cols,
      }))
    } catch {}
  }

  return { initColumns, saveColumns }
}
