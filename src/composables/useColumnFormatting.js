// src/composables/useColumnFormatting.js
// Resolução de formatação/estilo por coluna de CrudDataTableComponent — extraído do
// componente pra poder ser testado sem precisar montar a v-data-table-server real.
import { formatters } from '@/utils/formatters.js'

/** Nome da coluna: headers com colunas dinâmicas usam `key`, headers estáticos passados
 *  pelas páginas (ex: RolePage.vue) usam `value` — aceita os dois. */
export function chaveHeader(header) {
  return header.key ?? header.value
}

/** header.formatter (função) tem prioridade sobre header.format (nome em formatters.js). */
export function resolveFormatter(header) {
  if (typeof header.formatter === 'function') return header.formatter
  if (header.format && formatters[header.format]) return formatters[header.format]
  return null
}

export function formatarValor(header, value, item) {
  const fn = resolveFormatter(header)
  return fn ? fn(value, item) : value
}

/** Só as colunas que precisam de um slot #item.<key> dedicado — formatter/format e/ou estilo. */
export function headersComFormatacao(headers) {
  return headers.filter(h => resolveFormatter(h) || h.bold || h.italic)
}
