// src/utils/formatters.js
// Formatadores prontos para uso em headers de CrudDataTableComponent (campo `format`).
// Para algo que não está aqui, use `formatter` (função) direto no header.

function formatarData(valor, opcoes) {
  if (!valor) return '—'
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return '—'
  return data.toLocaleString('pt-BR', opcoes)
}

export const formatters = {
  upper: (valor) => String(valor ?? '').toUpperCase(),
  lower: (valor) => String(valor ?? '').toLowerCase(),
  date: (valor) => formatarData(valor, { day: '2-digit', month: '2-digit', year: 'numeric' }),
  datetime: (valor) => formatarData(valor, {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }),
}
